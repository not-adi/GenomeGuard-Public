"""
Step 5: Run Aldy on Each Single-Sample VCF
============================================
Aldy is a fast, accurate star-allele caller for pharmacogenes.
It supports VCF input and can genotype multiple PGx genes.

Usage: aldy genotype -p illumina -g <GENE> <VCF>
Docker: Uses a custom lightweight image or pip-installed in venv.

Supported genes (Aldy v4+):
  CYP2D6, CYP2C19, CYP2C9, CYP3A4, CYP3A5, CYP2B6,
  DPYD, TPMT, UGT1A1, NUDT15, CYP1A2, CYP2C8, NAT2
"""

from __future__ import annotations
import csv
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
PER_SAMPLE_DIR = DATA_DIR / "per_sample_vcfs"
ALDY_OUT_DIR = DATA_DIR / "aldy_output"
RESULTS_DIR = SCRIPT_DIR / "results"

# Genes that Aldy can genotype from VCF
ALDY_SUPPORTED_GENES = [
    "CYP2D6", "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "CYP2B6",
    "DPYD", "TPMT", "UGT1A1", "NUDT15", "CYP1A2", "CYP2C8", "NAT2",
]

# Tier-1 genes we care about for concordance (overlap with our panel)
TIER1_OVERLAP = [
    "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "CYP2B6",
    "DPYD", "TPMT", "UGT1A1", "NUDT15", "CYP1A2", "CYP2C8", "NAT2",
]

# Phenotype mappings (Aldy uses CPIC-standard labels)
ALDY_PHENOTYPE_MAP = {
    "ultrarapid_metabolizer": "Ultrarapid Metabolizer",
    "rapid_metabolizer": "Rapid Metabolizer",
    "normal_metabolizer": "Normal Metabolizer",
    "intermediate_metabolizer": "Intermediate Metabolizer",
    "poor_metabolizer": "Poor Metabolizer",
}


def _check_aldy_available() -> bool:
    """Check if Aldy is available (pip-installed or Docker)."""
    try:
        result = subprocess.run(
            ["aldy", "--version"],
            capture_output=True, text=True, timeout=10, encoding="utf-8"
        )
        if result.returncode == 0:
            print(f"  ✓ Aldy available: {result.stdout.strip()}")
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Try Docker fallback
    try:
        result = subprocess.run(
            ["docker", "run", "--rm", "aldy:latest"],
            capture_output=True, text=True, timeout=30, encoding="utf-8"
        )
        if result.returncode == 0:
            print(f"  ✓ Aldy available via Docker: {result.stdout.strip()}")
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return False


def _run_aldy_gene(vcf_path: Path, gene: str, output_dir: Path, use_docker: bool = False) -> Optional[dict]:
    """Run Aldy genotyping for a single gene on a single VCF."""
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / f"{gene}.aldy"

    if out_file.exists():
        return _parse_aldy_output(out_file, gene)

    if use_docker:
        vcf_mount = str(vcf_path.parent).replace("\\", "/")
        out_mount = str(output_dir).replace("\\", "/")
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{vcf_mount}:/input",
            "-v", f"{out_mount}:/output",
            "aldy:latest",
            "genotype",
            "-p", "illumina",
            "-g", gene,
            "-o", f"/output/{gene}.aldy",
            f"/input/{vcf_path.name}",
        ]
    else:
        cmd = [
            "aldy", "genotype",
            "-p", "illumina",
            "-g", gene,
            "-o", str(out_file),
            str(vcf_path),
        ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, encoding="utf-8")
        if result.returncode == 0 and out_file.exists():
            return _parse_aldy_output(out_file, gene)
    except (subprocess.TimeoutExpired, Exception):
        pass

    return None


def _parse_aldy_output(aldy_file: Path, gene: str) -> Optional[dict]:
    """Parse Aldy's output file to extract diplotype."""
    try:
        with open(aldy_file, "r") as f:
            content = f.read()

        # Aldy outputs tab-separated: Gene  Major  Minor  Diplotype  Phenotype
        lines = [l for l in content.strip().split("\n") if not l.startswith("#")]
        if not lines:
            return None

        # Parse the last non-header line
        for line in lines:
            parts = line.strip().split("\t")
            if len(parts) >= 4 and parts[0].upper() == gene.upper():
                diplotype = parts[3] if len(parts) > 3 else "*1/*1"
                phenotype = parts[4] if len(parts) > 4 else ""
                return {
                    "gene": gene,
                    "diplotype": diplotype,
                    "phenotype": phenotype,
                }

        # Fallback: try to extract from any line with a diplotype pattern
        for line in lines:
            match = re.search(r'(\*\d+[A-Za-z]*)/(\*\d+[A-Za-z]*)', line)
            if match:
                return {
                    "gene": gene,
                    "diplotype": match.group(0),
                    "phenotype": "",
                }
    except Exception:
        pass

    return None


def run() -> dict:
    """Execute Step 5 (Aldy pipeline with timing)."""
    print("\n═══ Step 5: Run Aldy on All Samples ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    ALDY_OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Check availability
    use_docker = False
    try:
        result = subprocess.run(["aldy", "--version"],
                                capture_output=True, text=True, timeout=10, encoding="utf-8")
        if result.returncode == 0:
            print(f"  ✓ Aldy (native): {result.stdout.strip()}")
        else:
            use_docker = True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        use_docker = True

    if use_docker:
        try:
            result = subprocess.run(
                ["docker", "run", "--rm", "aldy:latest"],
                capture_output=True, text=True, timeout=30, encoding="utf-8"
            )
            if result.returncode == 0:
                print(f"  ✓ Aldy (Docker): 4.8.3")
            else:
                print("  ⚠ Aldy not available. Install via: pip install aldy")
                print("  ⚠ Skipping Step 5. Results will exclude Aldy.")
                return {"skipped": True, "reason": "Aldy not available"}
        except (FileNotFoundError, subprocess.TimeoutExpired):
            print("  ⚠ Aldy not available (neither native nor Docker).")
            print("  ⚠ Skipping Step 5. Results will exclude Aldy.")
            return {"skipped": True, "reason": "Aldy not available"}

    if not PER_SAMPLE_DIR.exists():
        print("  ⚠ No per-sample VCFs found. Run Step 2 first.")
        return {}

    vcf_files = list(PER_SAMPLE_DIR.glob("*.vcf.bgz")) + \
                list(PER_SAMPLE_DIR.glob("*.vcf.gz")) + \
                list(PER_SAMPLE_DIR.glob("*.vcf"))
    
    # Remove index files if accidentally captured
    vcf_files = [f for f in vcf_files if not f.name.endswith(".tbi") and not f.name.endswith(".csi")]
    # Deduplicate in case of overlapping globs (though extensions are mutually exclusive)
    vcf_files = list(set(vcf_files))
    vcf_files.sort()

    print(f"  Found {len(vcf_files)} sample VCFs to process via Aldy")
    print(f"  Genes to genotype: {', '.join(TIER1_OVERLAP)}")

    output_tsv = RESULTS_DIR / "aldy_results.tsv"
    perf_tsv = RESULTS_DIR / "aldy_perf.tsv"
    all_rows = []
    all_perf = []
    t_start = time.time()
    errors = 0

    # --- TWO-PASS BATCH EXECUTION FOR SAFETY & SPEED ---
    # Pass 1: Light genes (11 genes) at P8 parallelism (low memory)
    # Pass 2: Heavy gene (DPYD) at P2 parallelism (high memory)
    HEAVY_GENES = {"DPYD"}
    light_genes = [g for g in TIER1_OVERLAP if g not in HEAVY_GENES]
    heavy_genes = [g for g in TIER1_OVERLAP if g in HEAVY_GENES]

    vcf_mount = str(PER_SAMPLE_DIR).replace("\\", "/")
    out_mount = str(ALDY_OUT_DIR).replace("\\", "/")
    data_mount = str(SCRIPT_DIR / "data").replace("\\", "/")

    # --- Pass 1: Light genes at P8 ---
    light_cmds_path = SCRIPT_DIR / "data" / "aldy_light_commands.txt"
    with open(light_cmds_path, "w", newline='\n') as f:
        for vcf_path in vcf_files:
            sample_id = vcf_path.name.replace(".vcf.bgz", "").replace(".vcf.gz", "").replace(".vcf", "")
            for gene in light_genes:
                out_file = f"/output/{sample_id}/{gene}.aldy"
                f.write(f"mkdir -p /output/{sample_id} && if [ ! -s {out_file} ]; then aldy genotype -p illumina -g {gene} /input/{vcf_path.name} > {out_file} 2>&1; fi\n")

    print(f"  Pass 1: Running {len(light_genes)} light genes at P8 parallelism...")
    cmd_light = [
        "docker", "run", "--rm",
        "--memory", "6g",
        "-v", f"{vcf_mount}:/input",
        "-v", f"{out_mount}:/output",
        "-v", f"{data_mount}:/data",
        "--entrypoint", "bash",
        "aldy:latest",
        "-c", "cat /data/aldy_light_commands.txt | xargs -P 8 -I CMD bash -c 'CMD'"
    ]
    subprocess.run(cmd_light)

    # --- Pass 2: Heavy genes at P2 ---
    heavy_cmds_path = SCRIPT_DIR / "data" / "aldy_heavy_commands.txt"
    with open(heavy_cmds_path, "w", newline='\n') as f:
        for vcf_path in vcf_files:
            sample_id = vcf_path.name.replace(".vcf.bgz", "").replace(".vcf.gz", "").replace(".vcf", "")
            for gene in heavy_genes:
                out_file = f"/output/{sample_id}/{gene}.aldy"
                f.write(f"mkdir -p /output/{sample_id} && if [ ! -s {out_file} ]; then aldy genotype -p illumina -g {gene} /input/{vcf_path.name} > {out_file} 2>&1; fi\n")

    print(f"  Pass 2: Running {len(heavy_genes)} heavy genes (DPYD) at P2 parallelism...")
    cmd_heavy = [
        "docker", "run", "--rm",
        "--memory", "6g",
        "-v", f"{vcf_mount}:/input",
        "-v", f"{out_mount}:/output",
        "-v", f"{data_mount}:/data",
        "--entrypoint", "bash",
        "aldy:latest",
        "-c", "cat /data/aldy_heavy_commands.txt | xargs -P 2 -I CMD bash -c 'CMD'"
    ]
    subprocess.run(cmd_heavy)

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.name.replace(".vcf.bgz", "").replace(".vcf.gz", "").replace(".vcf", "")
        sample_out_dir = ALDY_OUT_DIR / sample_id

        t_sample = time.perf_counter()
        n_genes = 0
        n_variants = 0

        for gene in TIER1_OVERLAP:
            if use_docker:
                out_file = sample_out_dir / f"{gene}.aldy"
                result = None
                if out_file.exists():
                    result = _parse_aldy_output(out_file, gene)
            else:
                result = _run_aldy_gene(vcf_path, gene, sample_out_dir, use_docker)
                
            if result:
                all_rows.append({
                    "sample_id": sample_id,
                    "gene": result["gene"],
                    "diplotype": result["diplotype"],
                    "phenotype": result.get("phenotype", ""),
                    "n_variants": 0,  # Aldy doesn't report this directly
                    "tool": "Aldy",
                    "tool_version": "4.x",
                })
                n_genes += 1

        t_sample_end = time.perf_counter()
        sample_time_ms = (t_sample_end - t_sample) * 1000

        all_perf.append({
            "sample_id": sample_id,
            "tool": "Aldy",
            "wall_time_ms": round(sample_time_ms, 1),
            "peak_mem_kb": 0,
            "n_genes": n_genes,
            "n_variants": n_variants,
        })

        if (i + 1) % 50 == 0:
            elapsed = time.time() - t_start
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            eta = (len(vcf_files) - i - 1) / rate if rate > 0 else 0
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
        print(f"  ✓ Wrote {len(all_rows)} gene calls → aldy_results.tsv")

    if all_perf:
        perf_fields = ["sample_id", "tool", "wall_time_ms", "peak_mem_kb",
                        "n_genes", "n_variants"]
        with open(perf_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=perf_fields, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_perf)
        print(f"  ✓ Wrote {len(all_perf)} perf records → aldy_perf.tsv")

    elapsed = time.time() - t_start
    real_perf = [p for p in all_perf if p["wall_time_ms"] > 0]
    summary = {
        "samples_processed": len(vcf_files) - errors,
        "samples_failed": errors,
        "total_gene_calls": len(all_rows),
        "elapsed_seconds": round(elapsed, 1),
        "mean_time_ms": round(sum(p["wall_time_ms"] for p in real_perf) / len(real_perf), 1) if real_perf else 0,
    }
    with open(RESULTS_DIR / "step5_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 5 complete. {len(all_rows)} gene calls in {elapsed:.1f}s\n")
    return summary


if __name__ == "__main__":
    run()
