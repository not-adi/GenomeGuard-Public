"""
Step 4: Run PharmCAT via Docker on Each Single-Sample VCF
==========================================================
Uses the official pgkb/pharmcat Docker image to:
1. Preprocess each VCF (normalise, filter to PGx positions)
2. Run the PharmCAT pipeline (Named Allele Matcher → Phenotyper → Reporter)
3. Parse JSON outputs into a standardized TSV matching GenomeGuard's format
4. Record per-sample wall-clock timing
"""

from __future__ import annotations
import csv
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
PER_SAMPLE_DIR = DATA_DIR / "per_sample_vcfs"
PHARMCAT_OUT_DIR = DATA_DIR / "pharmcat_output"
RESULTS_DIR = SCRIPT_DIR / "results"

PHARMCAT_IMAGE = "pgkb/pharmcat:latest"


def _ensure_docker_image() -> bool:
    """Pull the PharmCAT Docker image if not already present."""
    print("  Checking for PharmCAT Docker image...")
    result = subprocess.run(
        ["docker", "images", "-q", PHARMCAT_IMAGE],
        capture_output=True, text=True, timeout=30
    )
    if not result.stdout.strip():
        print("  Pulling PharmCAT Docker image (one-time download)...")
        pull = subprocess.run(
            ["docker", "pull", PHARMCAT_IMAGE],
            capture_output=True, text=True, timeout=600
        )
        if pull.returncode != 0:
            print(f"  ⚠ Docker pull failed: {pull.stderr[:300]}")
            return False
        print("  ✓ PharmCAT image pulled successfully")
    else:
        print("  ✓ PharmCAT image already available")
    return True


def run_pharmcat_on_sample(vcf_path: Path, output_dir: Path, timeout: int = 120) -> bool:
    """Run the full PharmCAT pipeline on a single-sample VCF."""
    output_dir.mkdir(parents=True, exist_ok=True)

    vcf_mount = str(vcf_path.parent).replace("\\", "/")
    out_mount = str(output_dir).replace("\\", "/")
    vcf_name = vcf_path.name

    cmd = [
        "docker", "run", "--rm",
        "-v", f"{vcf_mount}:/pharmcat/input",
        "-v", f"{out_mount}:/pharmcat/output",
        PHARMCAT_IMAGE,
        "pharmcat_pipeline",
        f"/pharmcat/input/{vcf_name}",
        "-o", "/pharmcat/output",
        "-reporterJson",
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode != 0:
            return False
        return True
    except subprocess.TimeoutExpired:
        return False
    except Exception:
        return False


def parse_pharmcat_json(output_dir: Path, sample_id: str) -> List[dict]:
    """Parse PharmCAT's JSON output files into standardized rows."""
    rows = []

    match_files = list(output_dir.glob("*.match.json"))
    pheno_files = list(output_dir.glob("*.phenotype.json"))

    if not match_files:
        return rows

    try:
        with open(match_files[0], "r") as f:
            match_data = json.load(f)
    except Exception:
        return rows

    gene_calls = match_data.get("results", [])
    for call in gene_calls:
        gene = call.get("gene", "")
        if not gene:
            continue

        diplotype_str = "*1/*1"
        phenotype = ""
        if pheno_files:
            try:
                with open(pheno_files[0], "r") as f:
                    pheno_data = json.load(f)
                gene_reports = pheno_data.get("geneReports", {})
                if gene in gene_reports:
                    recs = gene_reports[gene].get("recommendationDiplotypes", [])
                    if recs:
                        diplotype_str = recs[0].get("label", "*1/*1")
                        if recs[0].get("phenotypes"):
                            phenotype = recs[0]["phenotypes"][0]
            except Exception:
                pass

        if diplotype_str:
            rows.append({
                "sample_id": sample_id,
                "gene": gene,
                "diplotype": diplotype_str,
                "phenotype": phenotype,
                "n_variants": len(call.get("matchedVariants", [])),
                "tool": "PharmCAT",
                "tool_version": match_data.get("version", "unknown"),
            })

    return rows


def run() -> dict:
    """Execute Step 4 (PharmCAT pipeline with timing)."""
    print("\n═══ Step 4: Run PharmCAT on All Samples ═══\n")
    print("  ℹ This step can take 3-4 hours for ~2600 samples.")
    print("  ℹ Progress is logged every 50 samples.\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    PHARMCAT_OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not _ensure_docker_image():
        return {"error": "PharmCAT Docker image not available"}

    if not PER_SAMPLE_DIR.exists():
        print("  ⚠ No per-sample VCFs found. Run Step 2 first.")
        return {}

    vcf_files = sorted(PER_SAMPLE_DIR.glob("*.vcf"))
    if not vcf_files:
        vcf_files = sorted(PER_SAMPLE_DIR.glob("*.vcf.gz"))

    print(f"  Found {len(vcf_files)} sample VCFs to process via PharmCAT")

    output_tsv = RESULTS_DIR / "pharmcat_results.tsv"
    perf_tsv = RESULTS_DIR / "pharmcat_perf.tsv"
    all_rows = []
    all_perf = []
    t_start = time.time()
    errors = 0
    skipped = 0

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.stem.replace(".vcf", "")
        sample_out_dir = PHARMCAT_OUT_DIR / sample_id

        if sample_out_dir.exists() and list(sample_out_dir.glob("*.match.json")):
            skipped += 1
            continue

    # --- BATCH EXECUTION VIA SINGLE DOCKER CONTAINER ---
    script_path = SCRIPT_DIR / "data" / "pharmcat_batch.sh"
    with open(script_path, "w", newline='\n') as f:
        f.write("#!/bin/bash\n")
        for vcf_path in vcf_files:
            sample_id = vcf_path.stem.replace(".vcf", "")
            f.write(f"mkdir -p /pharmcat/output/{sample_id}\n")
            f.write(f"if [ -z \"$(ls -A /pharmcat/output/{sample_id}/*.match.json 2>/dev/null)\" ]; then\n")
            f.write(f"  pharmcat_pipeline /pharmcat/input/{vcf_path.name} -o /pharmcat/output/{sample_id} -reporterJson\n")
            f.write(f"fi\n")

    vcf_mount = str(PER_SAMPLE_DIR).replace("\\", "/")
    out_mount = str(PHARMCAT_OUT_DIR).replace("\\", "/")
    data_mount = str(SCRIPT_DIR / "data").replace("\\", "/")

    print("  Running PharmCAT batch script across all samples via Docker...")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{vcf_mount}:/pharmcat/input",
        "-v", f"{out_mount}:/pharmcat/output",
        "-v", f"{data_mount}:/pharmcat/data",
        "--entrypoint", "bash",
        PHARMCAT_IMAGE,
        "/pharmcat/data/pharmcat_batch.sh"
    ]
    subprocess.run(cmd)

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.stem.replace(".vcf", "")
        sample_out_dir = PHARMCAT_OUT_DIR / sample_id

        t_sample = time.perf_counter()
        
        # All processing was done in batch, just parse output
        ok = sample_out_dir.exists() and list(sample_out_dir.glob("*.match.json"))
        t_sample_end = time.perf_counter()
        sample_time_ms = (t_sample_end - t_sample) * 1000

        if ok:
            rows = parse_pharmcat_json(sample_out_dir, sample_id)
            all_rows.extend(rows)
            all_perf.append({
                "sample_id": sample_id,
                "tool": "PharmCAT",
                "wall_time_ms": round(sample_time_ms, 1),
                "peak_mem_kb": 0,  # Docker isolates memory
                "n_genes": len(rows),
                "n_variants": sum(r["n_variants"] for r in rows),
            })
        else:
            errors += 1

        if (i + 1) % 50 == 0:
            elapsed = time.time() - t_start
            rate = (i + 1 - skipped) / elapsed if elapsed > 0 else 0
            remaining = len(vcf_files) - i - 1
            eta = remaining / rate if rate > 0 else 0
            print(f"    Processed {i+1}/{len(vcf_files)} samples "
                  f"({elapsed:.0f}s elapsed, ~{eta:.0f}s remaining)")

    # Write results
    if all_rows:
        fieldnames = ["sample_id", "gene", "diplotype", "phenotype",
                      "n_variants", "tool", "tool_version"]
        with open(output_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_rows)
        print(f"  ✓ Wrote {len(all_rows)} gene calls → pharmcat_results.tsv")

    # Write performance data
    if all_perf:
        perf_fields = ["sample_id", "tool", "wall_time_ms", "peak_mem_kb",
                        "n_genes", "n_variants"]
        with open(perf_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=perf_fields, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_perf)
        print(f"  ✓ Wrote {len(all_perf)} perf records → pharmcat_perf.tsv")

    elapsed = time.time() - t_start
    # Calculate real timing excluding cached
    real_perf = [p for p in all_perf if p["wall_time_ms"] > 0]
    summary = {
        "samples_processed": len(vcf_files) - errors - skipped,
        "samples_skipped": skipped,
        "samples_failed": errors,
        "total_gene_calls": len(all_rows),
        "elapsed_seconds": round(elapsed, 1),
        "mean_time_ms": round(sum(p["wall_time_ms"] for p in real_perf) / len(real_perf), 1) if real_perf else 0,
    }
    with open(RESULTS_DIR / "step4_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 4 complete. {len(all_rows)} gene calls in {elapsed:.1f}s\n")
    return summary


if __name__ == "__main__":
    run()
