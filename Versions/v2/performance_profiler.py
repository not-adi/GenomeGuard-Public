"""
Step 8a: Performance Benchmarking
===================================
Aggregates per-sample timing and memory data from all tools
to produce a comprehensive performance comparison.

Metrics:
  - Throughput: samples/sec, genes/sec
  - Latency: mean, median, P50, P95, P99
  - Memory: peak, mean per-sample
  - Speedup factors relative to each tool
"""

from __future__ import annotations
import csv
import json
import statistics
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = SCRIPT_DIR / "results"

TOOL_PERF_FILES = {
    "GenomeGuard": "genomeguard_perf.tsv",
    "PharmCAT": "pharmcat_perf.tsv",
    "Aldy": "aldy_perf.tsv",
    "PyPGx": "pypgx_perf.tsv",
}

TOOL_SUMMARY_FILES = {
    "GenomeGuard": "step3_summary.json",
    "PharmCAT": "step4_summary.json",
    "Aldy": "step5_summary.json",
    "PyPGx": "step6_summary.json",
}


def _load_perf_data(path: Path) -> List[dict]:
    """Load performance TSV data."""
    if not path.exists():
        return []
    rows = []
    with open(path, "r") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            row["wall_time_ms"] = float(row.get("wall_time_ms", 0))
            row["peak_mem_kb"] = float(row.get("peak_mem_kb", 0))
            row["n_genes"] = int(row.get("n_genes", 0))
            rows.append(row)
    return rows


def _percentile(data: List[float], p: float) -> float:
    """Compute the p-th percentile of a list."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * (p / 100)
    f = int(k)
    c = f + 1
    if c >= len(sorted_data):
        return sorted_data[-1]
    d0 = sorted_data[f] * (c - k)
    d1 = sorted_data[c] * (k - f)
    return d0 + d1


def run() -> dict:
    """Execute Step 8a (performance benchmarking)."""
    print("\n═══ Step 8a: Performance Benchmarking ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    benchmark = {}

    for tool_name, perf_file in TOOL_PERF_FILES.items():
        perf_data = _load_perf_data(RESULTS_DIR / perf_file)

        if not perf_data:
            # Try to get from summary file
            summary_file = RESULTS_DIR / TOOL_SUMMARY_FILES.get(tool_name, "")
            if summary_file.exists():
                with open(summary_file) as f:
                    summary = json.load(f)
                if summary.get("skipped"):
                    print(f"  {tool_name}: skipped (not available)")
                    continue
                benchmark[tool_name] = {
                    "samples_processed": summary.get("samples_processed", 0),
                    "total_elapsed_s": summary.get("elapsed_seconds", 0),
                    "mean_time_ms": summary.get("mean_time_ms", 0),
                    "note": "limited data - from summary only",
                }
            continue

        # Filter out cached entries (wall_time_ms == 0)
        real_data = [d for d in perf_data if d["wall_time_ms"] > 0]
        if not real_data:
            real_data = perf_data  # Use all if none are non-zero

        times = [d["wall_time_ms"] for d in real_data]
        mems = [d["peak_mem_kb"] for d in real_data if d["peak_mem_kb"] > 0]

        # Load total elapsed from summary
        summary_file = RESULTS_DIR / TOOL_SUMMARY_FILES.get(tool_name, "")
        total_elapsed = 0
        if summary_file.exists():
            with open(summary_file) as f:
                summary = json.load(f)
            total_elapsed = summary.get("elapsed_seconds", 0)

        n_samples = len(perf_data)
        total_genes = sum(d["n_genes"] for d in perf_data)

        benchmark[tool_name] = {
            "samples_processed": n_samples,
            "total_elapsed_s": total_elapsed,
            "total_gene_calls": total_genes,
            "throughput": {
                "samples_per_sec": round(n_samples / total_elapsed, 2) if total_elapsed > 0 else 0,
                "genes_per_sec": round(total_genes / total_elapsed, 2) if total_elapsed > 0 else 0,
            },
            "latency_ms": {
                "mean": round(statistics.mean(times), 3) if times else 0,
                "median": round(statistics.median(times), 3) if times else 0,
                "stdev": round(statistics.stdev(times), 3) if len(times) > 1 else 0,
                "min": round(min(times), 3) if times else 0,
                "max": round(max(times), 3) if times else 0,
                "p50": round(_percentile(times, 50), 3),
                "p95": round(_percentile(times, 95), 3),
                "p99": round(_percentile(times, 99), 3),
            },
            "memory_kb": {
                "mean": round(statistics.mean(mems), 1) if mems else 0,
                "peak": round(max(mems), 1) if mems else 0,
                "min": round(min(mems), 1) if mems else 0,
            } if mems else {"mean": 0, "peak": 0, "min": 0, "note": "memory not tracked"},
        }

        print(f"  {tool_name}:")
        print(f"    Samples: {n_samples}")
        print(f"    Total time: {total_elapsed:.1f}s")
        if total_elapsed > 0:
            print(f"    Throughput: {n_samples / total_elapsed:.1f} samples/sec")
        print(f"    Latency: mean={statistics.mean(times):.1f}ms, "
              f"median={statistics.median(times):.1f}ms, "
              f"P95={_percentile(times, 95):.1f}ms")
        if mems:
            print(f"    Memory: mean={statistics.mean(mems):.0f}KB, "
                  f"peak={max(mems):.0f}KB")

    # Compute speedup factors
    if "GenomeGuard" in benchmark and benchmark["GenomeGuard"].get("total_elapsed_s", 0) > 0:
        gg_time = benchmark["GenomeGuard"]["total_elapsed_s"]
        for tool_name, data in benchmark.items():
            if tool_name != "GenomeGuard" and data.get("total_elapsed_s", 0) > 0:
                speedup = data["total_elapsed_s"] / gg_time
                data["speedup_vs_genomeguard"] = round(speedup, 1)
                print(f"\n  GenomeGuard is {speedup:.0f}x faster than {tool_name}")

    with open(RESULTS_DIR / "performance_benchmark.json", "w") as f:
        json.dump(benchmark, f, indent=2)

    print(f"\n  ✓ Performance benchmark → performance_benchmark.json\n")
    return benchmark


if __name__ == "__main__":
    run()
