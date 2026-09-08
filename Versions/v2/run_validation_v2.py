"""
GenomeGuard v2 Validation Study — Master Orchestrator
=======================================================
Runs the full 8-step pipeline end-to-end:

  Step 1: Fetch global (non-SAS) sample list + PGx positions
  Step 2: Download & extract PGx VCFs from 1000 Genomes
  Step 3: Run GenomeGuard engine on all samples (with profiling)
  Step 4: Run PharmCAT via Docker on all samples
  Step 5: Run Aldy on all samples
  Step 6: Run PyPGx on all samples
  Step 7: Compute multi-tool concordance + statistical analysis
  Step 8: Performance benchmarking + generate preprint

Each step is idempotent — re-running skips completed substeps.

Usage:
    python run_validation_v2.py           # Run all steps
    python run_validation_v2.py 1         # Run only Step 1
    python run_validation_v2.py 1 3       # Run Steps 1 through 3
    python run_validation_v2.py --pilot   # Run all steps on 20 samples
"""

from __future__ import annotations
import argparse
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))


def main():
    parser = argparse.ArgumentParser(
        description="GenomeGuard v2 Validation Study Pipeline"
    )
    parser.add_argument(
        "start", nargs="?", type=int, default=1,
        help="First step to run (1-8)"
    )
    parser.add_argument(
        "end", nargs="?", type=int, default=8,
        help="Last step to run (1-8)"
    )
    parser.add_argument(
        "--pilot", action="store_true",
        help="Run on 20 samples only (smoke test, 5 per superpopulation)"
    )
    args = parser.parse_args()

    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  GenomeGuard v2 — Multi-Population, Multi-Tool Validation  ║")
    print("║  Benchmarking: GenomeGuard · PharmCAT · Aldy · PyPGx       ║")
    print("║  Dataset: 1000 Genomes 30x (AFR, EUR, EAS, AMR)           ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()

    t_start = time.time()
    steps_to_run = range(args.start, args.end + 1)

    # ── Step 1: Fetch samples ──
    if 1 in steps_to_run:
        import fetch_global_samples
        summary = fetch_global_samples.run()
        if args.pilot and summary:
            # Truncate to 20 samples (5 per superpopulation)
            import csv
            data_dir = SCRIPT_DIR / "data"
            samples_file = data_dir / "global_samples.txt"
            meta_path = data_dir / "global_sample_metadata.tsv"

            pilot_samples = []
            superpop_counts = {}
            with open(meta_path, "r") as f:
                for row in csv.DictReader(f, delimiter="\t"):
                    sp = row["superpopulation"]
                    if superpop_counts.get(sp, 0) < 5:
                        pilot_samples.append(row["sample"])
                        superpop_counts[sp] = superpop_counts.get(sp, 0) + 1

            with open(samples_file, "w") as f:
                for s in pilot_samples:
                    f.write(s + "\n")

            # Update metadata file too
            all_meta = []
            with open(meta_path, "r") as f:
                for row in csv.DictReader(f, delimiter="\t"):
                    if row["sample"] in pilot_samples:
                        all_meta.append(row)
            with open(meta_path, "w", newline="") as f:
                w = csv.DictWriter(f, fieldnames=["sample", "sex", "population", "superpopulation"], delimiter="\t")
                w.writeheader()
                w.writerows(all_meta)

            print(f"\n  🧪 PILOT MODE: Reduced to {len(pilot_samples)} samples "
                  f"({dict(superpop_counts)})")

    # ── Step 2: Download VCFs ──
    if 2 in steps_to_run:
        import download_pgx_vcfs
        download_pgx_vcfs.run()

    # ── Step 3: GenomeGuard ──
    if 3 in steps_to_run:
        import run_genomeguard
        run_genomeguard.run()

    # ── Step 4: PharmCAT ──
    if 4 in steps_to_run:
        import run_pharmcat
        run_pharmcat.run()

    # ── Step 5: Aldy ──
    if 5 in steps_to_run:
        import run_aldy
        run_aldy.run()

    # ── Step 6: PyPGx ──
    if 6 in steps_to_run:
        import run_pypgx
        run_pypgx.run()

    # ── Step 7: Concordance ──
    if 7 in steps_to_run:
        import concordance
        concordance.run()

    # ── Step 8: Performance + Preprint ──
    if 8 in steps_to_run:
        import performance_profiler
        performance_profiler.run()

        import generate_preprint
        generate_preprint.run()

    elapsed = time.time() - t_start
    print(f"\n{'='*64}")
    print(f"  Pipeline complete! Total time: {elapsed:.0f}s ({elapsed/60:.1f} min)")
    print(f"  Results: {SCRIPT_DIR / 'results'}")
    print(f"{'='*64}\n")


if __name__ == "__main__":
    main()
