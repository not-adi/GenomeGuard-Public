"""
Step 3: Run GenomeGuard Engine on Each Single-Sample VCF
=========================================================
Iterates through per-sample VCFs, runs GenomeGuard's parser + analyzer,
and collects per-gene diplotype and phenotype calls into a TSV.
"""

from __future__ import annotations
import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import List

# Add py-backend to path so we can import the engine
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent / "py-backend"
sys.path.insert(0, str(BACKEND_DIR))

DATA_DIR = SCRIPT_DIR / "data"
PER_SAMPLE_DIR = DATA_DIR / "per_sample_vcfs"
RESULTS_DIR = SCRIPT_DIR / "results"



def run_single_sample(vcf_path: Path, sample_id: str) -> List[dict]:
    """Run GenomeGuard on a single VCF and return per-gene results."""
    from parser import parse_vcf
    from analyzer import analyze
    from pgx_knowledgebase import KNOWN_DRUGS, RSID_GRCH38, GENE_FOR_RSID, build_diplotype

    try:
        vcf_obj = parse_vcf(str(vcf_path))
    except Exception as e:
        print(f"    ⚠ Parse failed for {sample_id}: {e}")
        return []

    try:
        result = analyze(vcf_obj, list(KNOWN_DRUGS), sample=sample_id)
    except Exception as e:
        print(f"    ⚠ Analysis failed for {sample_id}: {e}")
        return []

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
            "tool_version": "1.0.0",
        })

    return rows


def run() -> dict:
    """Execute Step 3 (GenomeGuard pipeline)."""
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
    all_rows = []
    t_start = time.time()
    errors = 0

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.stem.replace(".vcf", "")
        rows = run_single_sample(vcf_path, sample_id)
        if rows:
            all_rows.extend(rows)
        else:
            errors += 1

        if (i + 1) % 50 == 0:
            elapsed = time.time() - t_start
            print(f"    Processed {i+1}/{len(vcf_files)} samples ({elapsed:.1f}s elapsed)")

    # Write results
    if all_rows:
        fieldnames = ["sample_id", "gene", "diplotype", "phenotype", "n_variants", "tool", "tool_version"]
        with open(output_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_rows)
        print(f"  ✓ Wrote {len(all_rows)} gene calls → {output_tsv}")

    elapsed = time.time() - t_start
    summary = {
        "samples_processed": len(vcf_files) - errors,
        "samples_failed": errors,
        "total_gene_calls": len(all_rows),
        "elapsed_seconds": round(elapsed, 1),
    }
    with open(RESULTS_DIR / "step3_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 3 complete. {len(all_rows)} gene calls in {elapsed:.1f}s\n")
    return summary


if __name__ == "__main__":
    run()
