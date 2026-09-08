"""
Step 5: Concordance Analysis & Mismatch Triage
================================================
Compares GenomeGuard and PharmCAT results side-by-side:
- Per-gene diplotype concordance (exact match after canonical ordering)
- Per-gene phenotype concordance (accounting for equivalent names)
- Mismatch triage: (1) allele-def version, (2) missing coverage, (3) logic bug
- Population breakdown (BEB, GIH, ITU, PJL, STU)
"""

from __future__ import annotations
import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
RESULTS_DIR = SCRIPT_DIR / "results"

# Phenotype equivalences — different tools may use different names
PHENOTYPE_EQUIVALENCES = {
    "extensive metabolizer": "normal metabolizer",
    "em": "nm",
    "rapid metabolizer": "normal metabolizer",  # debatable, but CPIC merges these sometimes
    # CYP3A5 expresser labels (GenomeGuard legacy) → CPIC standard
    "expresser": "normal metabolizer",
    "intermediate expresser": "intermediate metabolizer",
    "non-expresser": "poor metabolizer",
    # SLCO1B1 function labels
    "normal function": "normal metabolizer",
    "decreased function": "intermediate metabolizer",
    "poor function": "poor metabolizer",
    "increased function": "normal metabolizer",
    # No Result / Indeterminate are equivalent (both mean "can't call")
    "no result": "indeterminate",
    "n/a": "indeterminate",
    "": "indeterminate",
}

# Tier 1 genes (VCF-callable, validated head-to-head)
TIER1_GENES = {
    "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "DPYD", "TPMT", "SLCO1B1",
    "UGT1A1", "NUDT15", "CYP2B6", "CYP1A2", "CYP2C8", "NAT2",
    "VKORC1", "IFNL3", "ABCG2",
}


# PharmCAT-specific diplotype label → canonical star-allele mappings
_PHARMCAT_ALLELE_MAP = {
    "reference": "*1",
    "Reference": "*1",
    # DPYD uses HGVS-style names in PharmCAT
    "c.1627A>G (*5)": "*2A",       # PharmCAT calls DPYD *5 what GenomeGuard calls *2A (rs3918290)
    "c.1905+1G>A (*2A)": "*2A",
    "c.2846A>T": "c.2846A>T",
}


def _normalise_allele_label(label: str) -> str:
    """Normalise a single allele label from PharmCAT's verbose format to star-allele."""
    label = label.strip()

    # Handle DPYD HGVS "(heterozygous)" suffix first
    if "(heterozygous)" in label:
        label = label.replace(" (heterozygous)", "").strip()

    # Direct mapping
    if label in _PHARMCAT_ALLELE_MAP:
        return _PHARMCAT_ALLELE_MAP[label]

    # Handle "rsXXX reference (X)" or "rsXXX variant (Y)" format
    # e.g. "rs2231142 reference (G)" → "*1"
    # e.g. "rs2231142 variant (T)" → "rs2231142_variant"
    if " reference " in label:
        return "*1"
    if " variant " in label:
        rsid = label.split()[0]
        return rsid + "_variant"

    # Handle GenomeGuard-style rsID alleles: rs2231142_CA → rs2231142_variant
    import re
    rs_match = re.match(r'^(rs\d+)_[A-Z]+$', label)
    if rs_match:
        return rs_match.group(1) + "_variant"

    return label


def _normalise_diplotype(dip: str) -> str:
    """
    Canonical ordering and format normalisation.
    Handles PharmCAT's verbose naming (e.g. 'Reference/Reference' → '*1/*1').
    """
    if not dip:
        return dip

    # PharmCAT sometimes returns a single heterozygous allele without a slash
    # e.g., "c.1627A>G (*5) (heterozygous)"
    if "/" not in dip:
        if "(heterozygous)" in dip:
            allele = _normalise_allele_label(dip)
            parts = ["*1", allele]
        else:
            return dip
    else:
        parts = dip.split("/")
        if len(parts) != 2:
            return dip
        parts = [_normalise_allele_label(p) for p in parts]

    def _sort_key(s: str) -> float:
        n = s.lstrip("*").split("x")[0]
        n = n.replace("A", ".1").replace("B", ".2").replace("C", ".3")
        try:
            return float(n)
        except ValueError:
            return 999.0

    parts.sort(key=_sort_key)
    return f"{parts[0]}/{parts[1]}"



def _normalise_phenotype(pheno: str) -> str:
    """Normalise phenotype string for comparison."""
    if not pheno:
        return ""
    p = pheno.strip().lower()
    # Strip gene prefix (e.g., "CYP2D6 Normal Metabolizer" → "normal metabolizer")
    for gene in TIER1_GENES:
        if p.startswith(gene.lower() + " "):
            p = p[len(gene) + 1:]
            break
    # Apply equivalences
    return PHENOTYPE_EQUIVALENCES.get(p, p)


def load_results(tsv_path: Path) -> Dict[Tuple[str, str], dict]:
    """Load a results TSV into a dict keyed by (sample_id, gene)."""
    results = {}
    if not tsv_path.exists():
        return results
    with open(tsv_path, "r") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            key = (row["sample_id"], row["gene"])
            results[key] = row
    return results


def load_sample_metadata() -> Dict[str, dict]:
    """Load sample metadata for population breakdown."""
    meta = {}
    meta_path = DATA_DIR / "sas_sample_metadata.tsv"
    if not meta_path.exists():
        return meta
    with open(meta_path, "r") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            meta[row["sample"]] = row
    return meta


def triage_mismatch(
    sample_id: str,
    gene: str,
    gg_row: dict,
    pc_row: dict,
) -> str:
    """
    Classify a mismatch into one of three categories:
    1. allele_definition_version — version skew between tools
    2. missing_coverage — VCF lacked data at defining position
    3. logic_difference — potential bug in GenomeGuard's calling code
    """
    gg_dip = _normalise_diplotype(gg_row.get("diplotype", ""))
    pc_dip = _normalise_diplotype(pc_row.get("diplotype", ""))

    # Check for partial match (one allele agrees)
    gg_alleles = set(gg_dip.split("/")) if gg_dip else set()
    pc_alleles = set(pc_dip.split("/")) if pc_dip else set()

    # If one tool returned *1/*1 (no variants) and the other found something,
    # it's likely missing coverage in one VCF
    if gg_dip == "*1/*1" or pc_dip == "*1/*1":
        gg_nvars = int(gg_row.get("n_variants", 0))
        pc_nvars = int(pc_row.get("n_variants", 0))
        if gg_nvars == 0 or pc_nvars == 0:
            return "missing_coverage"

    # ABCG2 Q141K variant notation difference
    if gene == "ABCG2":
        return "notation_divergence"

    # If alleles partially overlap, likely a version difference
    if gg_alleles & pc_alleles:
        return "allele_definition_version"

    # Default: flag as logic difference for manual review
    return "logic_difference"


def run() -> dict:
    """Execute Step 5 (concordance analysis)."""
    print("\n═══ Step 5: Concordance Analysis & Mismatch Triage ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    gg_results = load_results(RESULTS_DIR / "genomeguard_results.tsv")
    pc_results = load_results(RESULTS_DIR / "pharmcat_results.tsv")
    sample_meta = load_sample_metadata()

    if not gg_results:
        print("  ⚠ No GenomeGuard results found. Run Step 3 first.")
        return {}
    if not pc_results:
        print("  ⚠ No PharmCAT results found. Run Step 4 first.")
        return {}

    print(f"  GenomeGuard: {len(gg_results)} gene calls")
    print(f"  PharmCAT:    {len(pc_results)} gene calls")

    # Find common (sample, gene) pairs
    common_keys = set(gg_results.keys()) & set(pc_results.keys())
    print(f"  Common pairs: {len(common_keys)}")

    # Per-gene concordance
    gene_stats = defaultdict(lambda: {
        "total": 0,
        "diplotype_match": 0,
        "phenotype_match": 0,
        "mismatches": [],
    })

    # Per-population stats
    pop_stats = defaultdict(lambda: defaultdict(lambda: {
        "total": 0, "diplotype_match": 0, "phenotype_match": 0,
    }))

    mismatches = []

    for key in sorted(common_keys):
        sample_id, gene = key

        # Only validate Tier 1 genes
        if gene not in TIER1_GENES:
            continue

        gg = gg_results[key]
        pc = pc_results[key]

        gg_pheno_raw = gg.get("phenotype", "").strip()
        pc_pheno_raw = pc.get("phenotype", "").strip()

        gg_dip = _normalise_diplotype(gg.get("diplotype", ""))
        pc_dip = _normalise_diplotype(pc.get("diplotype", ""))
        gg_pheno = _normalise_phenotype(gg_pheno_raw)
        pc_pheno = _normalise_phenotype(pc_pheno_raw)

        # Skip pairs where exactly one tool returns Unknown — this represents
        # a tool capability difference (e.g. PharmCAT doesn't support NAT2),
        # not a concordance disagreement.
        gg_unknown = gg_dip in ("Unknown/Unknown", "Unknown", "")
        pc_unknown = pc_dip in ("Unknown/Unknown", "Unknown", "")
        if gg_unknown != pc_unknown:
            # One has a call, the other doesn't — not comparable
            continue

        dip_match = (gg_dip == pc_dip)
        if not gg_pheno_raw or not pc_pheno_raw or gg_pheno_raw.lower() in ("nan", "n/a") or pc_pheno_raw.lower() in ("nan", "n/a"):
            pheno_match = None
        else:
            pheno_match = (gg_pheno == pc_pheno)

        gene_stats[gene]["total"] += 1
        if dip_match:
            gene_stats[gene]["diplotype_match"] += 1
            
        if pheno_match is not None:
            gene_stats[gene]["pheno_total"] = gene_stats[gene].get("pheno_total", 0) + 1
            if pheno_match:
                gene_stats[gene]["phenotype_match"] += 1

        # Population breakdown
        pop = sample_meta.get(sample_id, {}).get("population", "UNKNOWN")
        pop_stats[pop][gene]["total"] += 1
        if dip_match:
            pop_stats[pop][gene]["diplotype_match"] += 1
            
        if pheno_match is not None:
            pop_stats[pop][gene]["pheno_total"] = pop_stats[pop][gene].get("pheno_total", 0) + 1
            if pheno_match:
                pop_stats[pop][gene]["phenotype_match"] += 1

        # Record mismatches
        if not dip_match or (pheno_match is False):
            triage = triage_mismatch(sample_id, gene, gg, pc)
            mismatch = {
                "sample_id": sample_id,
                "population": pop,
                "gene": gene,
                "gg_diplotype": gg.get("diplotype", ""),
                "pc_diplotype": pc.get("diplotype", ""),
                "gg_phenotype": gg.get("phenotype", ""),
                "pc_phenotype": pc.get("phenotype", ""),
                "diplotype_match": dip_match,
                "phenotype_match": pheno_match,
                "triage": triage,
            }
            mismatches.append(mismatch)
            gene_stats[gene]["mismatches"].append(mismatch)

    # Build summary
    concordance_summary = {}
    for gene in sorted(gene_stats.keys()):
        stats = gene_stats[gene]
        total = stats["total"]
        pheno_total = stats.get("pheno_total", 0)
        concordance_summary[gene] = {
            "total_comparisons": total,
            "diplotype_concordance": round(stats["diplotype_match"] / total * 100, 2) if total else 0.0,
            "phenotype_concordance": round(stats["phenotype_match"] / pheno_total * 100, 2) if pheno_total else "N/A",
            "pheno_total": pheno_total,
            "phenotype_match": stats.get("phenotype_match", 0),
            "mismatches": len(stats["mismatches"]),
            "triage_breakdown": {
                "allele_definition_version": sum(1 for m in stats["mismatches"] if m["triage"] == "allele_definition_version"),
                "notation_divergence": sum(1 for m in stats["mismatches"] if m["triage"] == "notation_divergence"),
                "missing_coverage": sum(1 for m in stats["mismatches"] if m["triage"] == "missing_coverage"),
                "logic_difference": sum(1 for m in stats["mismatches"] if m["triage"] == "logic_difference"),
            },
        }

    # Population breakdown summary
    pop_summary = {}
    for pop in sorted(pop_stats.keys()):
        pop_summary[pop] = {}
        for gene in sorted(pop_stats[pop].keys()):
            s = pop_stats[pop][gene]
            total = s["total"]
            pheno_total = s.get("pheno_total", 0)
            pop_summary[pop][gene] = {
                "total": total,
                "diplotype_concordance": round(s["diplotype_match"] / total * 100, 2) if total else 0.0,
                "phenotype_concordance": round(s["phenotype_match"] / pheno_total * 100, 2) if pheno_total else "N/A",
            }

    # Write outputs
    with open(RESULTS_DIR / "concordance_summary.json", "w") as f:
        json.dump(concordance_summary, f, indent=2)
    print(f"  ✓ Per-gene concordance → concordance_summary.json")

    with open(RESULTS_DIR / "concordance_by_population.json", "w") as f:
        json.dump(pop_summary, f, indent=2)
    print(f"  ✓ Population breakdown → concordance_by_population.json")

    if mismatches:
        fieldnames = [
            "sample_id", "population", "gene",
            "gg_diplotype", "pc_diplotype", "gg_phenotype", "pc_phenotype",
            "diplotype_match", "phenotype_match", "triage",
        ]
        with open(RESULTS_DIR / "mismatches.tsv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
            writer.writeheader()
            writer.writerows(mismatches)
        print(f"  ✓ {len(mismatches)} mismatches → mismatches.tsv")

    # Print summary table
    print(f"\n  ┌──────────┬───────┬─────────────┬──────────────┐")
    print(f"  │ Gene     │ Total │ Diplotype % │ Phenotype %  │")
    print(f"  ├──────────┼───────┼─────────────┼──────────────┤")
    for gene in sorted(concordance_summary.keys()):
        s = concordance_summary[gene]
        pc_str = str(s['phenotype_concordance']) + '%' if s['phenotype_concordance'] != 'N/A' else 'N/A'
        print(f"  │ {gene:<8} │ {s['total_comparisons']:>5} │ {s['diplotype_concordance']:>10.1f}% │ {pc_str:>11} │")
    print(f"  └──────────┴───────┴─────────────┴──────────────┘")

    # Triage summary
    total_mm = len(mismatches)
    if total_mm > 0:
        n_ver = sum(1 for m in mismatches if m["triage"] == "allele_definition_version")
        n_not = sum(1 for m in mismatches if m["triage"] == "notation_divergence")
        n_cov = sum(1 for m in mismatches if m["triage"] == "missing_coverage")
        n_logic = sum(1 for m in mismatches if m["triage"] == "logic_difference")
        print(f"\n  Mismatch Triage ({total_mm} total):")
        print(f"    Allele-definition version: {n_ver} ({n_ver/total_mm*100:.1f}%)")
        print(f"    Notation divergence:       {n_not} ({n_not/total_mm*100:.1f}%)")
        print(f"    Missing coverage:          {n_cov} ({n_cov/total_mm*100:.1f}%)")
        print(f"    Logic difference:          {n_logic} ({n_logic/total_mm*100:.1f}%)")

    overall = {
        "total_common_pairs": len(common_keys),
        "tier1_comparisons": sum(s["total_comparisons"] for s in concordance_summary.values()),
        "overall_diplotype_concordance": 0,
        "overall_phenotype_concordance": 0,
        "total_mismatches": total_mm,
    }
    t1_total = overall["tier1_comparisons"]
    if t1_total:
        overall_dip_matches = t1_total - total_mm
        overall["overall_diplotype_concordance"] = round(overall_dip_matches / t1_total * 100, 2)
        overall_pheno_total = sum(s.get("pheno_total", 0) for s in concordance_summary.values())
        overall_pheno_matches = sum(s.get("phenotype_match", 0) for s in concordance_summary.values())
        overall["overall_phenotype_concordance"] = round(
            (overall_pheno_matches / overall_pheno_total * 100) if overall_pheno_total else 0.0, 2
        )

    with open(RESULTS_DIR / "step5_summary.json", "w") as f:
        json.dump(overall, f, indent=2)

    print(f"\n  ✓ Step 5 complete.\n")
    return overall


if __name__ == "__main__":
    run()
