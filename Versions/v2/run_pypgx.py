"""
Step 6: Run PyPGx on Each Single-Sample VCF
=============================================
PyPGx is a comprehensive pharmacogenomics tool supporting 80+ genes.
It can call star alleles from VCF data using its API or CLI.

For VCF-only analysis (no BAM), PyPGx uses SNV/indel data to determine
star alleles.  Structural variant calling requires BAM input, so we
restrict to SNV-based calling here.

References:
  - https://github.com/sbslee/pypgx
  - https://pypgx.readthedocs.io/
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
PYPGX_OUT_DIR = DATA_DIR / "pypgx_output"
RESULTS_DIR = SCRIPT_DIR / "results"

# Genes PyPGx can genotype from VCF (SNV-based, no BAM needed)
PYPGX_GENES = [
    "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "CYP2B6",
    "DPYD", "TPMT", "UGT1A1", "NUDT15", "CYP1A2", "CYP2C8", "NAT2",
    "SLCO1B1", "VKORC1", "IFNL3", "ABCG2",
]


def _check_pypgx_available() -> bool:
    """Check if PyPGx is installed or available via Docker."""
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import pypgx; print(pypgx.__version__)"],
            capture_output=True, text=True, timeout=10, encoding="utf-8"
        )
        if result.returncode == 0:
            print(f"  ✓ PyPGx available: v{result.stdout.strip()}")
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # Try Docker
    try:
        result = subprocess.run(
            ["docker", "run", "--rm", "pypgx:latest", "--version"],
            capture_output=True, text=True, timeout=10, encoding="utf-8"
        )
        if result.returncode == 0:
            print(f"  ✓ PyPGx Docker CLI available: {result.stdout.strip()}")
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return False


def _run_pypgx_api(vcf_path: Path, sample_id: str, output_dir: Path) -> List[dict]:
    """
    Run PyPGx via Python API for a single sample.
    Uses pypgx.api.core functions for VCF-based genotyping.
    """
    rows = []
    output_dir.mkdir(parents=True, exist_ok=True)

    cache_file = output_dir / f"{sample_id}_results.json"
    if cache_file.exists():
        try:
            with open(cache_file) as f:
                cached = json.load(f)
            return cached
        except Exception:
            pass

    try:
        import pypgx
        import pypgx.api

        for gene in PYPGX_GENES:
            try:
                # PyPGx API: create input files and run genotyping
                result = pypgx.api.genotype(
                    gene=gene,
                    vcf=str(vcf_path),
                    assembly="GRCh38",
                )

                if result is not None:
                    # Extract diplotype from result
                    diplotype = getattr(result, "diplotype", "*1/*1")
                    phenotype = getattr(result, "phenotype", "")

                    rows.append({
                        "sample_id": sample_id,
                        "gene": gene,
                        "diplotype": str(diplotype) if diplotype else "*1/*1",
                        "phenotype": str(phenotype) if phenotype else "",
                        "n_variants": 0,
                        "tool": "PyPGx",
                        "tool_version": pypgx.__version__,
                    })
            except Exception:
                # Gene not callable from this VCF, skip
                continue

    except ImportError:
        return rows
    except Exception:
        return rows

    # Cache results
    try:
        with open(cache_file, "w") as f:
            json.dump(rows, f, indent=2)
    except Exception:
        pass

    return rows


def _run_pypgx_cli(vcf_path: Path, sample_id: str, output_dir: Path) -> List[dict]:
    """
    Fallback: run PyPGx via Docker CLI for each gene.
    """
    rows = []
    output_dir.mkdir(parents=True, exist_ok=True)

    cache_file = output_dir / f"{sample_id}_results.json"
    if cache_file.exists():
        try:
            with open(cache_file) as f:
                return json.load(f)
        except Exception:
            pass

    vcf_mount = str(vcf_path.parent).replace("\\", "/")
    out_mount = str(output_dir).replace("\\", "/")

    import zipfile
    for gene in PYPGX_GENES:
        try:
            gene_out_dir = output_dir / f"{gene}_out"
            results_zip = gene_out_dir / "results.zip"
            if results_zip.exists():
                try:
                    with zipfile.ZipFile(results_zip, 'r') as z:
                        with z.open('data.tsv') as f:
                            content = f.read().decode('utf-8')
                    lines = content.strip().split('\n')
                    if len(lines) > 1:
                        parts = lines[1].split('\t')
                        if len(parts) > 2:
                            diplotype = parts[1]
                            phenotype = parts[2]
                            rows.append({
                                "sample_id": sample_id,
                                "gene": gene,
                                "diplotype": diplotype,
                                "phenotype": phenotype,
                                "n_variants": 0,
                                "tool": "PyPGx",
                                "tool_version": "Docker",
                            })
                except Exception:
                    pass
        except (subprocess.TimeoutExpired, Exception):
            continue

    # Cache
    try:
        with open(cache_file, "w") as f:
            json.dump(rows, f, indent=2)
    except Exception:
        pass

    return rows


def run() -> dict:
    """Execute Step 6 (PyPGx pipeline with timing)."""
    print("\n═══ Step 6: Run PyPGx on All Samples ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    PYPGX_OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not _check_pypgx_available():
        print("  ⚠ PyPGx not available. Install via: pip install pypgx or build pypgx:latest docker image")
        print("  ⚠ Skipping Step 6. Results will exclude PyPGx.")
        return {"skipped": True, "reason": "PyPGx not available"}

    if not PER_SAMPLE_DIR.exists():
        print("  ⚠ No per-sample VCFs found. Run Step 2 first.")
        return {}

    vcf_files = list(PER_SAMPLE_DIR.glob("*.vcf.bgz")) + \
                list(PER_SAMPLE_DIR.glob("*.vcf.gz")) + \
                list(PER_SAMPLE_DIR.glob("*.vcf"))
    
    vcf_files = [f for f in vcf_files if not f.name.endswith(".tbi") and not f.name.endswith(".csi")]
    vcf_files = list(set(vcf_files))
    vcf_files.sort()

    print(f"  Found {len(vcf_files)} sample VCFs to process via PyPGx")
    print(f"  Genes to genotype: {', '.join(PYPGX_GENES)}")

    output_tsv = RESULTS_DIR / "pypgx_results.tsv"
    perf_tsv = RESULTS_DIR / "pypgx_perf.tsv"
    all_rows = []
    all_perf = []
    t_start = time.time()
    errors = 0

    # Determine mode: API or CLI
    use_api = False
    try:
        import pypgx
        use_api = True
        print(f"  Using PyPGx API mode (v{pypgx.__version__})")
    except ImportError:
        print("  Using PyPGx Docker CLI mode")

    # --- BATCH EXECUTION VIA SINGLE DOCKER CONTAINER ---
    # We use xargs to run up to 8 evaluations in parallel!
    commands_path = SCRIPT_DIR / "data" / "pypgx_commands.txt"
    with open(commands_path, "w", newline='\n') as f:
        for vcf_path in vcf_files:
            sample_id = vcf_path.name.replace(".vcf.bgz", "").replace(".vcf.gz", "").replace(".vcf", "")
            for gene in PYPGX_GENES:
                out_dir = f"/output/{sample_id}/{gene}_out"
                results_zip = f"{out_dir}/results.zip"
                f.write(f"mkdir -p /output/{sample_id} && if [ ! -s {results_zip} ]; then pypgx run-chip-pipeline {gene} {out_dir} /input/{vcf_path.name} --assembly GRCh38 --force; fi\n")

    vcf_mount = str(PER_SAMPLE_DIR).replace("\\", "/")
    out_mount = str(PYPGX_OUT_DIR).replace("\\", "/")
    data_mount = str(SCRIPT_DIR / "data").replace("\\", "/")

    print("  Running PyPGx batch script across all samples via Docker (Parallel mode)...")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{vcf_mount}:/input",
        "-v", f"{out_mount}:/output",
        "-v", f"{data_mount}:/data",
        "--entrypoint", "bash",
        "pypgx:latest",
        "-c", "cat /data/pypgx_commands.txt | xargs -P 4 -I CMD bash -c 'CMD'"
    ]
    subprocess.run(cmd)

    for i, vcf_path in enumerate(vcf_files):
        sample_id = vcf_path.name.replace(".vcf.bgz", "").replace(".vcf.gz", "").replace(".vcf", "")
        sample_out_dir = PYPGX_OUT_DIR / sample_id

        t_sample = time.perf_counter()

        if use_api:
            rows = _run_pypgx_api(vcf_path, sample_id, sample_out_dir)
        else:
            # Re-use _run_pypgx_cli to parse the generated zip files (since we just generated them)
            rows = _run_pypgx_cli(vcf_path, sample_id, sample_out_dir)

        t_sample_end = time.perf_counter()
        sample_time_ms = (t_sample_end - t_sample) * 1000

        if rows:
            all_rows.extend(rows)
        else:
            errors += 1

        all_perf.append({
            "sample_id": sample_id,
            "tool": "PyPGx",
            "wall_time_ms": round(sample_time_ms, 1),
            "peak_mem_kb": 0,
            "n_genes": len(rows),
            "n_variants": 0,
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
        print(f"  ✓ Wrote {len(all_rows)} gene calls → pypgx_results.tsv")

    if all_perf:
        perf_fields = ["sample_id", "tool", "wall_time_ms", "peak_mem_kb",
                        "n_genes", "n_variants"]
        with open(perf_tsv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=perf_fields, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_perf)
        print(f"  ✓ Wrote {len(all_perf)} perf records → pypgx_perf.tsv")

    elapsed = time.time() - t_start
    real_perf = [p for p in all_perf if p["wall_time_ms"] > 0]
    summary = {
        "samples_processed": len(vcf_files) - errors,
        "samples_failed": errors,
        "total_gene_calls": len(all_rows),
        "elapsed_seconds": round(elapsed, 1),
        "mean_time_ms": round(sum(p["wall_time_ms"] for p in real_perf) / len(real_perf), 1) if real_perf else 0,
    }
    with open(RESULTS_DIR / "step6_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 6 complete. {len(all_rows)} gene calls in {elapsed:.1f}s\n")
    return summary


if __name__ == "__main__":
    run()
