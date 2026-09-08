"""
Step 3: Run GenomeGuard Engine on Each Single-Sample VCF (with Profiling)
==========================================================================
Iterates through per-sample VCFs, runs GenomeGuard's parser + analyzer,
and collects per-gene diplotype and phenotype calls into a TSV.

v2 additions over v1:
  - Per-sample wall-clock timing (perf_counter_ns for nanosecond precision)
  - Per-sample peak memory tracking (tracemalloc)
  - Outputs both results TSV and performance TSV
"""

from __future__ import annotations
import csv
import json
import os
import sys
import time
import tracemalloc
from pathlib import Path
from typing import List

# Add py-backend to path so we can import the engine
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent.parent / "py-backend"
sys.path.insert(0, str(BACKEND_DIR))

DATA_DIR = SCRIPT_DIR / "data"
PER_SAMPLE_DIR = DATA_DIR / "per_sample_vcfs"
RESULTS_DIR = SCRIPT_DIR / "results"



def run_single_sample(vcf_path: Path, sample_id: str) -> tuple:
    """Run GenomeGuard on a single VCF and return (gene_rows, perf_row)."""
    from parser import parse_vcf
    from analyzer import analyze
    from pgx_knowledgebase import KNOWN_DRUGS, RSID_GRCH38, GENE_FOR_RSID, build_diplotype

    # Start profiling
    tracemalloc.start()
    t_start = time.perf_counter_ns()

    try:
        vcf_obj = parse_vcf(str(vcf_path))
    except Exception as e:
        tracemalloc.stop()
        print(f"    ⚠ Parse failed for {sample_id}: {e}")
        return [], None

    try:
        result = analyze(vcf_obj, list(KNOWN_DRUGS), sample=sample_id)
    except Exception as e:
        tracemalloc.stop()
        print(f"    ⚠ Analysis failed for {sample_id}: {e}")
        return [], None

    t_end = time.perf_counter_ns()
    _, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    wall_time_ms = (t_end - t_start) / 1_000_000  # ns → ms
    peak_mem_kb = peak_mem / 1024  # bytes → KB

    # Build coverage set from VCF positions for diplotype building
    vcf_positions = set()
    for v in vcf_obj.variants:
        vcf_positions.add((v.chrom, v.pos))

    # Build per-gene expected positions
    gene_expected_positions = {}
    for rsid, (chrom, pos) in RSID_GRCH38.items():
        g = GENE_FOR_RSID.get(rsid)
        if g:
            gene_expected_positions.setdefault(g, set()).add((chrom, pos))

    rows = []
    for gene_result in result.genes:
        allele_info = [
            {"star_allele": a.star_allele, "genotype": a.genotype}
            for a in gene_result.detected_alleles
        ]
        expected = gene_expected_positions.get(gene_result.gene, set())
        has_coverage = bool(expected & vcf_positions) or bool(allele_info)
        diplotype = build_diplotype(gene_result.gene, allele_info, has_coverage)

        rows.append({
            "sample_id": sample_id,
            "gene": gene_result.gene,
            "diplotype": diplotype,
            "phenotype": gene_result.phenotype,
            "n_variants": len(gene_result.detected_alleles),
            "tool": "GenomeGuard",
            "tool_version": "2.0.0",
        })

    perf_row = {
        "sample_id": sample_id,
        "tool": "GenomeGuard",
        "wall_time_ms": round(wall_time_ms, 3),
        "peak_mem_kb": round(peak_mem_kb, 1),
        "n_genes": len(rows),
        "n_variants": sum(r["n_variants"] for r in rows),
    }

    return rows, perf_row


def run() -> dict:
    """Execute Step 3 (GenomeGuard pipeline with profiling)."""
    print("\n═══ Step 3: Run GenomeGuard on All Samples ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    if not PER_SAMPLE_DIR.exists():
        print("  ⚠ No per-sample VCFs found. Run Step 2 first.")
        return {}

    vcf_files = sorted(PER_SAMPLE_DIR.glob("*.vcf"))
    if not vcf_files:
        vcf_files = sorted(PER_SAMPLE_DIR.glob("*.vcf.gz"))
    if not vcf_files:
        vcf_files = sorted(PER_SAMPLE_DIR.glob("*.vcf.bgz"))

    print(f"  Found {len(vcf_files)} sample VCFs to process")

    output_tsv = RESULTS_DIR / "genomeguard_results.tsv"
    perf_tsv = RESULTS_DIR / "genomeguard_perf.tsv"
    all_rows = []
    all_perf = []
    t_start = time.time()
    errors = 0

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.stem.replace(".vcf", "")
        rows, perf_row = run_single_sample(vcf_path, sample_id)
        if rows:
            all_rows.extend(rows)
        else:
            errors += 1
        if perf_row:
            all_perf.append(perf_row)

        if (i + 1) % 100 == 0:
            elapsed = time.time() - t_start
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            eta = (len(vcf_files) - i - 1) / rate if rate > 0 else 0
            print(f"    Processed {i+1}/{len(vcf_files)} samples "
                  f"({elapsed:.1f}s elapsed, ~{eta:.0f}s remaining)")

    # Write results
    if all_rows:
        fieldnames = ["sample_id", "gene", "diplotype", "phenotype",
                      "n_variants", "tool", "tool_version"]
        with open(output_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_rows)
        print(f"  ✓ Wrote {len(all_rows)} gene calls → genomeguard_results.tsv")

    # Write performance data
    if all_perf:
        perf_fields = ["sample_id", "tool", "wall_time_ms", "peak_mem_kb",
                        "n_genes", "n_variants"]
        with open(perf_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=perf_fields, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_perf)
        print(f"  ✓ Wrote {len(all_perf)} perf records → genomeguard_perf.tsv")

    elapsed = time.time() - t_start
    summary = {
        "samples_processed": len(vcf_files) - errors,
        "samples_failed": errors,
        "total_gene_calls": len(all_rows),
        "elapsed_seconds": round(elapsed, 1),
        "mean_time_ms": round(sum(p["wall_time_ms"] for p in all_perf) / len(all_perf), 3) if all_perf else 0,
        "mean_mem_kb": round(sum(p["peak_mem_kb"] for p in all_perf) / len(all_perf), 1) if all_perf else 0,
    }
    with open(RESULTS_DIR / "step3_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 3 complete. {len(all_rows)} gene calls in {elapsed:.1f}s\n")
    return summary


if __name__ == "__main__":
    run()
