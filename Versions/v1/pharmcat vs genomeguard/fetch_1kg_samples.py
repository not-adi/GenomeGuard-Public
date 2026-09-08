"""
Step 1: Fetch 1000 Genomes South Asian Sample List & Build PGx Positions
=========================================================================
Reads the IGSR sample metadata TSV (already in py-backend/data/) and filters
for the 5 South Asian populations. Also builds a BED-like regions file of all
pharmacogenomically-relevant positions from GenomeGuard's RSID_TO_ALLELE map
using GRCh38 coordinates.
"""

from __future__ import annotations
import csv
import json
import os
from pathlib import Path
from typing import Dict, List, Set, Tuple

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
BACKEND_DIR = SCRIPT_DIR.parent / "py-backend"
IGSR_TSV = BACKEND_DIR / "data" / "igsr_samples.tsv"

SAS_POPULATIONS = {"BEB", "GIH", "ITU", "PJL", "STU"}
SAS_SUPERPOP = "SAS"

# ---------------------------------------------------------------------------
# rsID → GRCh38 position mapping (curated from dbSNP / CPIC)
# These are the defining variants GenomeGuard tracks.
# Format: rsID → (chrom_with_chr_prefix, 1-based_position)
# ---------------------------------------------------------------------------
RSID_GRCH38: Dict[str, Tuple[str, int]] = {
    # CYP2C19
    "rs4244285":   ("chr10", 94781859),
    "rs4986893":   ("chr10", 94780653),
    "rs12248560":  ("chr10", 94761900),
    # CYP2C9
    "rs1799853":   ("chr10", 94942290),
    "rs1057910":   ("chr10", 94981297),
    # SLCO1B1
    "rs4149056":   ("chr12", 21178615),
    # TPMT
    "rs1800462":   ("chr6",  18130918),
    "rs1800460":   ("chr6",  18130687),
    "rs1142345":   ("chr6",  18130348),
    # DPYD
    "rs3918290":   ("chr1",  97515839),
    "rs55886062":  ("chr1",  97573943),
    "rs67376798":  ("chr1",  97547947),
    # CYP3A5
    "rs776746":    ("chr7",  99672916),
    "rs10264272":  ("chr7",  99652770),
    "rs41303343":  ("chr7",  99648390),
    # CYP3A4
    "rs35599367":  ("chr7",  99768693),
    # CYP2B6
    "rs3745274":   ("chr19", 41006936),
    "rs2279343":   ("chr19", 41009358),
    "rs28399499":  ("chr19", 41010006),
    # CYP1A2
    "rs762551":    ("chr15", 74749576),
    "rs2069514":   ("chr15", 74752837),
    # UGT1A1
    "rs4148323":   ("chr2",  233760498),
    "rs8175347":   ("chr2",  233760233),
    # NUDT15
    "rs116855232": ("chr13", 48037825),
    "rs186364861": ("chr13", 48037885),
    # CYP2C8
    "rs11572103":  ("chr10", 95038992),
    "rs10509681":  ("chr10", 95058012),
    "rs1058930":   ("chr10", 95060344),
    # NAT2
    "rs1801280":   ("chr8",  18257854),
    "rs1799930":   ("chr8",  18258103),
    "rs1799931":   ("chr8",  18258370),
    "rs1041983":   ("chr8",  18257795),
    "rs1208":      ("chr8",  18258316),
    # VKORC1
    "rs9923231":   ("chr16", 31096368),
    # HLA-B (tag SNPs — Tier 2 but included for completeness)
    "rs3909184":   ("chr6",  31272735),
    "rs2395029":   ("chr6",  31271836),
    "rs9263726":   ("chr6",  31277801),
    # HLA-A
    "rs1061235":   ("chr6",  29944050),
    # ABCG2
    "rs2231142":   ("chr4",  88131171),
    # IFNL3
    "rs12979860":  ("chr19", 39248147),
    # G6PD (X-linked)
    "rs1050828":   ("chrX",  154535277),
    "rs5030868":   ("chrX",  154536002),
    "rs137852328": ("chrX",  154535623),
}

# Which genes are Tier 1 (VCF-callable, head-to-head validation)
TIER1_GENES = {
    "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "DPYD", "TPMT", "SLCO1B1",
    "UGT1A1", "NUDT15", "CYP2B6", "CYP1A2", "CYP2C8", "NAT2",
    "VKORC1", "IFNL3", "ABCG2",
}

# Tier 2: require structural-variant-aware methods
TIER2_GENES = {"CYP2D6", "HLA-A", "HLA-B", "G6PD"}


def fetch_sas_samples() -> List[dict]:
    """Parse IGSR metadata and return SAS sample records."""
    samples = []
    with open(IGSR_TSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            pop = row.get("Population code", "").strip()
            superpop = row.get("Superpopulation code", "").strip()
            collections = row.get("Data collections", "")
            # Only samples in SAS superpopulation with 30x data
            if superpop == SAS_SUPERPOP and "1000 Genomes 30x on GRCh38" in collections:
                samples.append({
                    "sample": row["Sample name"].strip(),
                    "sex": row.get("Sex", "").strip(),
                    "population": pop,
                    "superpopulation": superpop,
                })
    return samples


def write_sample_list(samples: List[dict], outpath: Path) -> None:
    """Write one sample ID per line."""
    outpath.parent.mkdir(parents=True, exist_ok=True)
    with open(outpath, "w") as f:
        for s in samples:
            f.write(s["sample"] + "\n")
    print(f"  Wrote {len(samples)} sample IDs → {outpath}")


def write_sample_metadata(samples: List[dict], outpath: Path) -> None:
    """Write full sample metadata as TSV."""
    outpath.parent.mkdir(parents=True, exist_ok=True)
    with open(outpath, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["sample", "sex", "population", "superpopulation"], delimiter="\t")
        w.writeheader()
        w.writerows(samples)
    print(f"  Wrote sample metadata → {outpath}")


def write_regions_file(outpath: Path) -> None:
    """Write a regions file (chr\\tpos-1\\tpos) for bcftools -R."""
    outpath.parent.mkdir(parents=True, exist_ok=True)
    entries = []
    for rsid, (chrom, pos) in sorted(RSID_GRCH38.items(), key=lambda x: (x[1][0], x[1][1])):
        entries.append((chrom, pos - 1, pos, rsid))  # BED is 0-based start

    with open(outpath, "w") as f:
        for chrom, start, end, rsid in entries:
            f.write(f"{chrom}\t{start}\t{end}\t{rsid}\n")
    print(f"  Wrote {len(entries)} PGx positions → {outpath}")


def write_rsid_list(outpath: Path) -> None:
    """Write just the rsIDs, one per line (for bcftools --include filtering)."""
    outpath.parent.mkdir(parents=True, exist_ok=True)
    with open(outpath, "w") as f:
        for rsid in sorted(RSID_GRCH38.keys()):
            f.write(rsid + "\n")
    print(f"  Wrote {len(RSID_GRCH38)} rsIDs → {outpath}")


def write_chromosomes_needed(outpath: Path) -> None:
    """Write the set of chromosomes that contain PGx positions."""
    chroms = sorted(set(chrom for chrom, _ in RSID_GRCH38.values()))
    outpath.parent.mkdir(parents=True, exist_ok=True)
    with open(outpath, "w") as f:
        json.dump(chroms, f)
    print(f"  Chromosomes needed: {chroms}")


def run() -> dict:
    """Execute Step 1 and return summary stats."""
    print("\n═══ Step 1: Fetch SAS Samples & Build PGx Positions ═══\n")

    samples = fetch_sas_samples()
    print(f"  Found {len(samples)} SAS samples with 30x coverage")

    # Population breakdown
    pop_counts = {}
    for s in samples:
        pop_counts[s["population"]] = pop_counts.get(s["population"], 0) + 1
    for pop, count in sorted(pop_counts.items()):
        print(f"    {pop}: {count} samples")

    # Write outputs
    write_sample_list(samples, DATA_DIR / "sas_samples.txt")
    write_sample_metadata(samples, DATA_DIR / "sas_sample_metadata.tsv")
    write_regions_file(DATA_DIR / "pgx_positions.bed")
    write_rsid_list(DATA_DIR / "pgx_rsids.txt")
    write_chromosomes_needed(DATA_DIR / "chromosomes_needed.json")

    summary = {
        "total_samples": len(samples),
        "populations": pop_counts,
        "pgx_positions": len(RSID_GRCH38),
        "tier1_genes": sorted(TIER1_GENES),
        "tier2_genes": sorted(TIER2_GENES),
    }

    with open(DATA_DIR / "step1_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n  ✓ Step 1 complete. {len(samples)} samples, {len(RSID_GRCH38)} PGx positions.\n")
    return summary


if __name__ == "__main__":
    run()
