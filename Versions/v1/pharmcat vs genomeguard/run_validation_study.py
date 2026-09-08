"""
GenomeGuard Retrospective Validation Study — Master Orchestrator
=================================================================
Runs the full 6-step pipeline end-to-end:

  Step 1: Fetch SAS sample list + PGx positions
  Step 2: Download & extract PGx VCFs from 1000 Genomes
  Step 3: Run GenomeGuard engine on all samples
  Step 4: Run PharmCAT via Docker on all samples
  Step 5: Compute concordance + triage mismatches
  Step 6: Generate the validation whitepaper

Each step is idempotent — re-running skips completed substeps.

Usage:
    python run_validation_study.py           # Run all steps
    python run_validation_study.py 1         # Run only Step 1
    python run_validation_study.py 1 3       # Run Steps 1 through 3
    python run_validation_study.py --pilot   # Run all steps on 5 samples only
"""

from __future__ import annotations
import argparse
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description="GenomeGuard Validation Study Pipeline")
    parser.add_argument("start", nargs="?", type=int, default=1, help="First step to run (1-6)")
    parser.add_argument("end", nargs="?", type=int, default=6, help="Last step to run (1-6)")
    parser.add_argument("--pilot", action="store_true", help="Run on 5 samples only (smoke test)")
    args = parser.parse_args()

    print("╔════════════════════════════════════════════════════════╗")
    print("║  GenomeGuard Retrospective Validation Study Pipeline  ║")
    print("║  Benchmarking against PharmCAT · 1000 Genomes SAS     ║")
    print("╚════════════════════════════════════════════════════════╝")
    print()

    t_start = time.time()
    steps_to_run = range(args.start, args.end + 1)

    if 1 in steps_to_run:
        import fetch_1kg_samples
        summary = fetch_1kg_samples.run()
        if args.pilot and summary:
            # Truncate sample list to 5 for pilot
            data_dir = SCRIPT_DIR / "data"
            samples_file = data_dir / "sas_samples.txt"
            with open(samples_file, "r") as f:
                all_samples = f.readlines()
            # Take 1 from each population
            import csv
            meta_path = data_dir / "sas_sample_metadata.tsv"
            pilot_samples = []
            seen_pops = set()
            with open(meta_path, "r") as f:
                for row in csv.DictReader(f, delimiter="\t"):
                    pop = row["population"]
                    if pop not in seen_pops and len(pilot_samples) < 5:
                        pilot_samples.append(row["sample"])
                        seen_pops.add(pop)
            with open(samples_file, "w") as f:
                for s in pilot_samples:
                    f.write(s + "\n")
            print(f"\n  🧪 PILOT MODE: Reduced to {len(pilot_samples)} samples")

    if 2 in steps_to_run:
        import download_pgx_vcfs
        download_pgx_vcfs.run()

    if 3 in steps_to_run:
        import run_genomeguard
        run_genomeguard.run()

    if 4 in steps_to_run:
        import run_pharmcat
        run_pharmcat.run()

    if 5 in steps_to_run:
        import concordance
        concordance.run()

    if 6 in steps_to_run:
        import generate_report
        generate_report.run()

    elapsed = time.time() - t_start
    print(f"\n{'='*60}")
    print(f"  Pipeline complete! Total time: {elapsed:.0f}s ({elapsed/60:.1f} min)")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
