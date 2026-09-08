"""
Streaming VCF Parser for Large Files
======================================
High-performance line-by-line VCF parser that filters during parsing.

Only creates Variant objects for rows matching pharmacogenomically
relevant rsIDs or gene names — typically ~50-200 matches out of
millions of rows in a whole-genome VCF.

Memory usage: O(matches) instead of O(total_variants).
A 10 GB VCF uses <100 MB RAM instead of >20 GB.

Supports:
  - Plain-text .vcf files
  - bgzip-compressed .vcf.bgz / .vcf.gz files
  - Auto-detection of gzip via magic bytes
  - Streaming from file path or file-like object
"""

from __future__ import annotations

import gzip
import io
import os
import time
from typing import BinaryIO, Dict, List, Optional, Set, Tuple, Union

from parser import (
    Variant,
    VCFFile,
    VCFMetadata,
    SampleGenotype,
    _parse_structured_line,
    _parse_info,
    _parse_genotype,
)


def _is_gzip(source: Union[str, BinaryIO]) -> bool:
    """Check if a source is gzip-compressed by reading magic bytes."""
    if isinstance(source, str):
        with open(source, "rb") as f:
            magic = f.read(2)
        return magic == b"\x1f\x8b"
    else:
        pos = source.tell()
        magic = source.read(2)
        source.seek(pos)
        return magic == b"\x1f\x8b"


def _open_streaming(source: Union[str, BinaryIO], is_compressed: bool):
    """
    Return a line iterator for the VCF source.
    Handles plain text and gzip/bgzip transparently.
    """
    if isinstance(source, str):
        # File path
        if is_compressed:
            return io.TextIOWrapper(
                gzip.open(source, "rb"), encoding="utf-8", errors="replace"
            )
        return open(source, "r", encoding="utf-8", errors="replace")
    else:
        # File-like object (e.g. from Flask upload stream)
        if is_compressed:
            return io.TextIOWrapper(
                gzip.open(source, "rb"), encoding="utf-8", errors="replace"
            )
        return io.TextIOWrapper(source, encoding="utf-8", errors="replace")


def _quick_match_line(
    cols: List[str],
    target_rsids: Set[str],
    target_genes_upper: Set[str],
    target_positions: Set[Tuple[str, int]],
) -> bool:
    """
    Fast check if a VCF data line matches any target rsID, gene, or defining position.
    """
    # Check positional match (handles generic unannotated VCFs)
    chrom = cols[0]
    chrom_norm = chrom if chrom.startswith('chr') else f'chr{chrom}'
    try:
        pos = int(cols[1])
        if (chrom_norm, pos) in target_positions:
            return True
    except ValueError:
        pass

    # Check ID column for rsID match (most common path)
    var_id = cols[2]
    if var_id != ".":
        # Handle compound IDs like "rs123;rs456"
        if ";" in var_id:
            for part in var_id.split(";"):
                if part in target_rsids:
                    return True
        elif var_id in target_rsids:
            return True

    # Check INFO column for rsIDs and GENE= tags
    info_str = cols[7] if len(cols) > 7 else ""
    if "rs" in info_str or "GENE=" in info_str or "PX=" in info_str:
        for token in info_str.split(";"):
            if "=" in token:
                k, v = token.split("=", 1)
                # Check GENE
                if k in ("GENE", "PX") and v.upper() in target_genes_upper:
                    return True
                # Check for rsID (e.g. RS=rs123 or dbSNP139.ID=rs123)
                if v.startswith("rs") and v in target_rsids:
                    return True
            else:
                # Some files just have the rsID as a flag
                if token.startswith("rs") and token in target_rsids:
                    return True

    return False


def parse_vcf_streaming(
    source: Union[str, BinaryIO],
    *,
    target_rsids: Set[str],
    target_genes: Set[str],
    target_positions: Set[Tuple[str, int]] = None,
    max_variants: int = 0,
) -> VCFFile:
    """
    Parse a VCF file using streaming with pharmacogenomic filtering.

    Only variant rows matching target_rsids or target_genes are fully
    parsed and stored. All other rows are skipped after a minimal check.

    Parameters
    ----------
    source : str or BinaryIO
        File path or file-like object.
    target_rsids : set[str]
        Set of rsIDs to match (e.g. {"rs4244285", "rs1799853", ...}).
    target_genes : set[str]
        Set of gene names to match (e.g. {"CYP2D6", "CYP2C19", ...}).
    max_variants : int, optional
        If > 0, stop after this many matched variants.

    Returns
    -------
    VCFFile
        Parsed VCF containing only pharmacogenomically relevant variants.
    """
    t_start = time.perf_counter()

    # Prepare uppercase gene set for case-insensitive matching
    target_genes_upper = {g.upper() for g in target_genes}

    # Detect compression
    is_compressed = False
    if isinstance(source, str):
        is_compressed = source.endswith((".gz", ".bgz")) or _is_gzip(source)
    else:
        is_compressed = _is_gzip(source)

    metadata = VCFMetadata()
    samples: List[str] = []
    variants: List[Variant] = []
    total_lines = 0
    skipped_lines = 0

    with _open_streaming(source, is_compressed) as fh:
        for raw_line in fh:
            line = raw_line.rstrip("\n\r")
            if not line:
                continue

            # ── Meta-information lines (##) ──
            if line.startswith("##"):
                # Only store essential metadata, skip raw storage for huge files
                if line.startswith("##fileformat="):
                    metadata.file_format = line.split("=", 1)[1]
                    continue

                key, fields = _parse_structured_line(line)
                if key and fields:
                    fid = fields.get("ID", "")
                    if key == "FILTER":
                        metadata.filters[fid] = fields.get("Description", "")
                    elif key == "INFO":
                        metadata.infos[fid] = fields
                    elif key == "FORMAT":
                        metadata.formats[fid] = fields
                    elif key == "contig":
                        metadata.contigs[fid] = fields
                continue

            # ── Header line (#CHROM ...) ──
            if line.startswith("#CHROM") or line.startswith("#chrom"):
                header_cols = line.lstrip("#").split("\t")
                if len(header_cols) > 9:
                    samples = header_cols[9:]
                continue

            # ── Data rows — fast filter ──
            total_lines += 1

            # Minimal tab split — only split first 8+ columns
            cols = line.split("\t")
            if len(cols) < 8:
                continue

            # Quick match check (O(1) set lookups)
            target_pos_set = target_positions if target_positions is not None else set()
            if not _quick_match_line(cols, target_rsids, target_genes_upper, target_pos_set):
                skipped_lines += 1
                continue

            # ── Full parse for matched line ──
            chrom = cols[0]
            pos = int(cols[1])
            var_id = cols[2] if cols[2] != "." else ""
            ref = cols[3]
            alt = cols[4].split(",") if cols[4] != "." else []
            qual = None
            if cols[5] != ".":
                try:
                    qual = float(cols[5])
                except ValueError:
                    pass
            filt = cols[6].split(";") if cols[6] != "." else ["PASS"]
            info = _parse_info(cols[7])

            fmt_keys: List[str] = []
            if len(cols) > 8 and cols[8] != ".":
                fmt_keys = cols[8].split(":")

            genotypes: List[SampleGenotype] = []
            for idx, sample_name in enumerate(samples):
                col_idx = 9 + idx
                if col_idx < len(cols):
                    genotypes.append(
                        _parse_genotype(fmt_keys, cols[col_idx], sample_name, alt)
                    )

            variant = Variant(
                chrom=chrom,
                pos=pos,
                id=var_id,
                ref=ref,
                alt=alt,
                qual=qual,
                filter=filt,
                info=info,
                format_keys=fmt_keys,
                genotypes=genotypes,
            )
            variants.append(variant)

            if max_variants and len(variants) >= max_variants:
                break

    t_end = time.perf_counter()
    elapsed_ms = (t_end - t_start) * 1000

    print(
        f"[StreamingParser] Scanned {total_lines:,} variant lines in {elapsed_ms:.0f}ms — "
        f"matched {len(variants)}, skipped {skipped_lines:,}"
    )

    return VCFFile(metadata=metadata, samples=samples, variants=variants)
