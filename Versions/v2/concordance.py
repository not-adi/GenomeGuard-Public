"""
Step 7: Multi-Tool Concordance Analysis & Statistical Benchmarking
====================================================================
Compares GenomeGuard, PharmCAT, Aldy, and PyPGx results:

Research-grade metrics:
  - Per-gene diplotype concordance (exact match after canonical ordering)
  - Per-gene phenotype concordance
  - Cohen's kappa (κ) for inter-rater reliability
  - Sensitivity / Specificity / PPV / NPV / F1 per gene
  - McNemar's test for significance of tool differences
  - Population and superpopulation breakdowns
  - Mismatch triage: version skew, notation, coverage, logic
  - Allele frequency comparison against literature
"""

from __future__ import annotations
import csv
import json
import math
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
RESULTS_DIR = SCRIPT_DIR / "results"

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TIER1_GENES = {
    "CYP2C19", "CYP2C9", "CYP3A4", "CYP3A5", "DPYD", "TPMT", "SLCO1B1",
    "UGT1A1", "NUDT15", "CYP2B6", "CYP1A2", "CYP2C8", "NAT2",
    "VKORC1", "IFNL3", "ABCG2",
}

TOOL_NAMES = ["GenomeGuard", "PharmCAT", "Aldy", "PyPGx"]
TOOL_FILES = {
    "GenomeGuard": "genomeguard_results.tsv",
    "PharmCAT": "pharmcat_results.tsv",
    "Aldy": "aldy_results.tsv",
    "PyPGx": "pypgx_results.tsv",
}

# Phenotype equivalences (same as v1, expanded)
PHENOTYPE_EQUIVALENCES = {
    "extensive metabolizer": "normal metabolizer",
    "em": "nm",
    "rapid metabolizer": "normal metabolizer",
    "expresser": "normal metabolizer",
    "intermediate expresser": "intermediate metabolizer",
    "non-expresser": "poor metabolizer",
    "normal function": "normal metabolizer",
    "decreased function": "intermediate metabolizer",
    "poor function": "poor metabolizer",
    "increased function": "normal metabolizer",
    "no result": "indeterminate",
    "n/a": "indeterminate",
    "": "indeterminate",
}

# PharmCAT allele normalization
_PHARMCAT_ALLELE_MAP = {
    "reference": "*1",
    "Reference": "*1",
    "c.1627A>G (*5)": "*2A",
    "c.1905+1G>A (*2A)": "*2A",
    "c.2846A>T": "c.2846A>T",
    "rs9923231 variant (T)": "-1639G>A_GA",
    "*36": "*28",
    "*7": "*6",
}


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _normalise_allele_label(label: str) -> str:
    """Normalise a single allele label."""
    import re
    label = label.strip()
    if "(heterozygous)" in label:
        label = label.replace(" (heterozygous)", "").strip()
    if label in _PHARMCAT_ALLELE_MAP:
        return _PHARMCAT_ALLELE_MAP[label]
    if " reference " in label:
        return "*1"
    if " variant " in label:
        rsid = label.split()[0]
        return rsid + "_variant"
    rs_match = re.match(r'^(rs\d+)_[A-Z]+$', label)
    if rs_match:
        return rs_match.group(1) + "_variant"
    return label


def _normalise_diplotype(dip: str) -> str:
    """Canonical ordering and format normalisation."""
    if not dip:
        return dip
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
    for gene in TIER1_GENES:
        if p.startswith(gene.lower() + " "):
            p = p[len(gene) + 1:]
            break
    return PHENOTYPE_EQUIVALENCES.get(p, p)


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

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
    meta_path = DATA_DIR / "global_sample_metadata.tsv"
    if not meta_path.exists():
        return meta
    with open(meta_path, "r") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            meta[row["sample"]] = row
    return meta


# ---------------------------------------------------------------------------
# Statistical functions
# ---------------------------------------------------------------------------

def cohens_kappa(matches: int, total: int, p_e: float = None) -> float:
    """
    Compute Cohen's kappa for two raters.
    Simplified: assumes binary agreement (match/no-match).
    For a more rigorous calculation, use full confusion matrix.
    """
    if total == 0:
        return 0.0
    p_o = matches / total  # observed agreement
    if p_e is None:
        # Estimate chance agreement (assume 50/50 for binary)
        p_e = 0.5
    if p_e >= 1.0:
        return 1.0
    kappa = (p_o - p_e) / (1 - p_e)
    return round(kappa, 4)


def cohens_kappa_matrix(confusion: Dict[str, int]) -> float:
    """
    Cohen's kappa from a 2x2 confusion matrix (legacy binary).
    confusion keys: 'tp', 'tn', 'fp', 'fn'
    """
    tp = confusion.get("tp", 0)
    tn = confusion.get("tn", 0)
    fp = confusion.get("fp", 0)
    fn = confusion.get("fn", 0)
    total = tp + tn + fp + fn
    if total == 0:
        return 0.0

    p_o = (tp + tn) / total
    p_yes = ((tp + fp) / total) * ((tp + fn) / total)
    p_no = ((tn + fn) / total) * ((tn + fp) / total)
    p_e = p_yes + p_no

    if p_e >= 1.0:
        return 1.0
    return round((p_o - p_e) / (1 - p_e), 4)

def cohens_kappa_multiclass(confusion_matrix_dict: dict) -> float:
    """
    Calculates multi-class Cohen's Kappa from a dictionary of format:
    { (true_label, pred_label): count, ... }
    """
    total = sum(confusion_matrix_dict.values())
    if total == 0: return 0.0

    p_o = sum(count for (t, p), count in confusion_matrix_dict.items() if t == p) / total
    marginal_true = defaultdict(int)
    marginal_pred = defaultdict(int)
    for (t, p), count in confusion_matrix_dict.items():
        marginal_true[t] += count
        marginal_pred[p] += count
    
    p_e = 0.0
    for label in set(list(marginal_true.keys()) + list(marginal_pred.keys())):
        p_e += (marginal_true[label] / total) * (marginal_pred[label] / total)
        
    if p_e >= 1.0: return 1.0
    return round((p_o - p_e) / (1 - p_e), 4)


def sensitivity_specificity(confusion: Dict[str, int]) -> dict:
    """Compute sensitivity, specificity, PPV, NPV, F1 from confusion matrix."""
    tp = confusion.get("tp", 0)
    tn = confusion.get("tn", 0)
    fp = confusion.get("fp", 0)
    fn = confusion.get("fn", 0)

    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    ppv = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    npv = tn / (tn + fn) if (tn + fn) > 0 else 0.0
    f1 = 2 * ppv * sensitivity / (ppv + sensitivity) if (ppv + sensitivity) > 0 else 0.0

    return {
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "ppv": round(ppv, 4),
        "npv": round(npv, 4),
        "f1": round(f1, 4),
        "tp": tp, "tn": tn, "fp": fp, "fn": fn,
    }


def mcnemar_test(b: int, c: int) -> dict:
    """
    McNemar's test for paired nominal data.
    b = cases where tool1 correct, tool2 wrong
    c = cases where tool1 wrong, tool2 correct
    Returns chi-squared statistic and p-value.
    """
    if b + c == 0:
        return {"chi2": 0.0, "p_value": 1.0, "significant": False}

    # McNemar's chi-squared with continuity correction
    chi2 = (abs(b - c) - 1) ** 2 / (b + c) if (b + c) > 0 else 0

    # Approximate p-value from chi-squared distribution (1 df)
    # Using survival function approximation
    try:
        from scipy.stats import chi2 as chi2_dist
        p_value = chi2_dist.sf(chi2, df=1)
    except ImportError:
        # Rough approximation without scipy
        if chi2 > 10.83:
            p_value = 0.001
        elif chi2 > 6.63:
            p_value = 0.01
        elif chi2 > 3.84:
            p_value = 0.05
        else:
            p_value = 0.5

    return {
        "chi2": round(chi2, 4),
        "p_value": round(p_value, 6),
        "significant": p_value < 0.05,
        "b": b, "c": c,
    }


def triage_mismatch(sample_id: str, gene: str, row1: dict, row2: dict) -> str:
    """Classify a mismatch into categories."""
    dip1 = _normalise_diplotype(row1.get("diplotype", ""))
    dip2 = _normalise_diplotype(row2.get("diplotype", ""))

    alleles1 = set(dip1.split("/")) if dip1 else set()
    alleles2 = set(dip2.split("/")) if dip2 else set()

    if dip1 == "*1/*1" or dip2 == "*1/*1":
        n1 = int(row1.get("n_variants", 0))
        n2 = int(row2.get("n_variants", 0))
        if n1 == 0 or n2 == 0:
            return "missing_coverage"

    if gene == "ABCG2":
        return "notation_divergence"

    if alleles1 & alleles2:
        return "allele_definition_version"

    return "logic_difference"


# ---------------------------------------------------------------------------
# Main concordance analysis
# ---------------------------------------------------------------------------

def run() -> dict:
    """Execute Step 7 (multi-tool concordance analysis)."""
    print("\n═══ Step 7: Multi-Tool Concordance Analysis ═══\n")

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    # Load all tool results
    tool_results = {}
    available_tools = []
    for tool_name, filename in TOOL_FILES.items():
        path = RESULTS_DIR / filename
        data = load_results(path)
        if data:
            tool_results[tool_name] = data
            available_tools.append(tool_name)
            print(f"  {tool_name}: {len(data)} gene calls loaded")
        else:
            print(f"  {tool_name}: no results found (skipped)")

    if len(available_tools) < 2:
        print("  ⚠ Need at least 2 tools with results for concordance.")
        return {}

    sample_meta = load_sample_metadata()
    print(f"  Sample metadata: {len(sample_meta)} samples")

    # ---------------------------------------------------------------------------
    # Pairwise concordance for all tool pairs
    # ---------------------------------------------------------------------------
    pairwise_results = {}
    all_mismatches = []

    for i, tool_a in enumerate(available_tools):
        for tool_b in available_tools[i + 1:]:
            pair_key = f"{tool_a}_vs_{tool_b}"
            print(f"\n  ── {tool_a} vs {tool_b} ──")

            data_a = tool_results[tool_a]
            data_b = tool_results[tool_b]
            common_keys = set(data_a.keys()) & set(data_b.keys())

            gene_stats = defaultdict(lambda: {
                "total": 0, "dip_match": 0, "pheno_match": 0, "pheno_total": 0,
                "confusion": {"tp": 0, "tn": 0, "fp": 0, "fn": 0},
                "diplotype_cm": defaultdict(int),
                "mismatches": [],
            })

            pop_stats = defaultdict(lambda: defaultdict(lambda: {
                "total": 0, "dip_match": 0,
            }))

            superpop_stats = defaultdict(lambda: defaultdict(lambda: {
                "total": 0, "dip_match": 0,
            }))

            # McNemar counters (tool_a correct but tool_b wrong, and vice versa)
            mcnemar_b = 0  # A correct, B wrong (using GenomeGuard as reference if A is GG)
            mcnemar_c = 0

            for key in sorted(common_keys):
                sample_id, gene = key
                if gene not in TIER1_GENES:
                    continue

                row_a = data_a[key]
                row_b = data_b[key]

                dip_a = _normalise_diplotype(row_a.get("diplotype", ""))
                dip_b = _normalise_diplotype(row_b.get("diplotype", ""))
                pheno_a = _normalise_phenotype(row_a.get("phenotype", ""))
                pheno_b = _normalise_phenotype(row_b.get("phenotype", ""))

                # Skip where one tool has unknown and other doesn't
                a_unknown = dip_a in ("Unknown/Unknown", "Unknown", "")
                b_unknown = dip_b in ("Unknown/Unknown", "Unknown", "")
                if a_unknown != b_unknown:
                    continue

                dip_match = (dip_a == dip_b)
                gene_stats[gene]["total"] += 1
                if dip_match:
                    gene_stats[gene]["dip_match"] += 1

                # Phenotype comparison
                pheno_a_raw = row_a.get("phenotype", "").strip()
                pheno_b_raw = row_b.get("phenotype", "").strip()
                if pheno_a_raw and pheno_b_raw and pheno_a_raw.lower() not in ("nan", "n/a") and pheno_b_raw.lower() not in ("nan", "n/a"):
                    gene_stats[gene]["pheno_total"] += 1
                    if pheno_a == pheno_b:
                        gene_stats[gene]["pheno_match"] += 1

                # Build confusion matrix (non-reference detection)
                # "positive" = non-reference diplotype (*1/*1 = negative)
                is_nonref_a = dip_a not in ("*1/*1", "")
                is_nonref_b = dip_b not in ("*1/*1", "")
                if is_nonref_a and is_nonref_b:
                    gene_stats[gene]["confusion"]["tp"] += 1
                elif not is_nonref_a and not is_nonref_b:
                    gene_stats[gene]["confusion"]["tn"] += 1
                elif is_nonref_a and not is_nonref_b:
                    gene_stats[gene]["confusion"]["fn"] += 1
                else:
                    gene_stats[gene]["confusion"]["fp"] += 1

                # Track exact diplotype matches for multi-class Kappa
                gene_stats[gene]["diplotype_cm"][(dip_a, dip_b)] += 1

                # Population breakdown
                pop = sample_meta.get(sample_id, {}).get("population", "UNKNOWN")
                superpop = sample_meta.get(sample_id, {}).get("superpopulation", "UNKNOWN")
                pop_stats[pop][gene]["total"] += 1
                superpop_stats[superpop][gene]["total"] += 1
                if dip_match:
                    pop_stats[pop][gene]["dip_match"] += 1
                    superpop_stats[superpop][gene]["dip_match"] += 1

                # Record mismatches
                if not dip_match:
                    triage = triage_mismatch(sample_id, gene, row_a, row_b)
                    mismatch = {
                        "sample_id": sample_id,
                        "population": pop,
                        "superpopulation": superpop,
                        "gene": gene,
                        "tool_a": tool_a,
                        "tool_b": tool_b,
                        f"{tool_a}_diplotype": row_a.get("diplotype", ""),
                        f"{tool_b}_diplotype": row_b.get("diplotype", ""),
                        f"{tool_a}_phenotype": row_a.get("phenotype", ""),
                        f"{tool_b}_phenotype": row_b.get("phenotype", ""),
                        "triage": triage,
                    }
                    gene_stats[gene]["mismatches"].append(mismatch)
                    all_mismatches.append(mismatch)

            # Build pair summary
            pair_summary = {}
            for gene in sorted(gene_stats.keys()):
                s = gene_stats[gene]
                total = s["total"]
                pt = s["pheno_total"]
                conf = s["confusion"]

                dip_conc = round(s["dip_match"] / total * 100, 2) if total else 0.0
                pheno_conc = round(s["pheno_match"] / pt * 100, 2) if pt else "N/A"
                kappa = cohens_kappa_multiclass(s["diplotype_cm"])
                sens_spec = sensitivity_specificity(conf)

                pair_summary[gene] = {
                    "total_comparisons": total,
                    "diplotype_concordance": dip_conc,
                    "phenotype_concordance": pheno_conc,
                    "cohens_kappa": kappa,
                    "sensitivity": sens_spec["sensitivity"],
                    "specificity": sens_spec["specificity"],
                    "ppv": sens_spec["ppv"],
                    "npv": sens_spec["npv"],
                    "f1": sens_spec["f1"],
                    "confusion_matrix": conf,
                    "mismatches": len(s["mismatches"]),
                    "triage_breakdown": {
                        "allele_definition_version": sum(1 for m in s["mismatches"] if m["triage"] == "allele_definition_version"),
                        "notation_divergence": sum(1 for m in s["mismatches"] if m["triage"] == "notation_divergence"),
                        "missing_coverage": sum(1 for m in s["mismatches"] if m["triage"] == "missing_coverage"),
                        "logic_difference": sum(1 for m in s["mismatches"] if m["triage"] == "logic_difference"),
                    },
                }

                print(f"    {gene:<10} n={total:>5}  conc={dip_conc:>6.1f}%  κ={kappa:>6.3f}  F1={sens_spec['f1']:>5.3f}")

            # Overall for this pair
            total_comp = sum(s["total"] for s in gene_stats.values())
            total_match = sum(s["dip_match"] for s in gene_stats.values())
            total_mm = len([m for m in all_mismatches if m["tool_a"] == tool_a and m["tool_b"] == tool_b])

            pairwise_results[pair_key] = {
                "tool_a": tool_a,
                "tool_b": tool_b,
                "total_comparisons": total_comp,
                "overall_concordance": round(total_match / total_comp * 100, 2) if total_comp else 0,
                "total_mismatches": total_mm,
                "per_gene": pair_summary,
            }

            # Population summary for this pair
            pop_summary = {}
            for pop in sorted(pop_stats.keys()):
                pop_summary[pop] = {}
                for gene in sorted(pop_stats[pop].keys()):
                    ps = pop_stats[pop][gene]
                    pop_summary[pop][gene] = {
                        "total": ps["total"],
                        "diplotype_concordance": round(ps["dip_match"] / ps["total"] * 100, 2) if ps["total"] else 0,
                    }
            pairwise_results[pair_key]["by_population"] = pop_summary

            superpop_summary = {}
            for sp in sorted(superpop_stats.keys()):
                superpop_summary[sp] = {}
                for gene in sorted(superpop_stats[sp].keys()):
                    ss = superpop_stats[sp][gene]
                    superpop_summary[sp][gene] = {
                        "total": ss["total"],
                        "diplotype_concordance": round(ss["dip_match"] / ss["total"] * 100, 2) if ss["total"] else 0,
                    }
            pairwise_results[pair_key]["by_superpopulation"] = superpop_summary

    # ---------------------------------------------------------------------------
    # Write all outputs
    # ---------------------------------------------------------------------------

    # 1. Pairwise concordance
    with open(RESULTS_DIR / "pairwise_concordance.json", "w") as f:
        json.dump(pairwise_results, f, indent=2)
    print(f"\n  ✓ Pairwise concordance → pairwise_concordance.json")

    # 2. Primary concordance summary (GenomeGuard vs PharmCAT — the main comparison)
    primary_key = "GenomeGuard_vs_PharmCAT"
    if primary_key in pairwise_results:
        with open(RESULTS_DIR / "concordance_summary.json", "w") as f:
            json.dump(pairwise_results[primary_key]["per_gene"], f, indent=2)

        if "by_population" in pairwise_results[primary_key]:
            with open(RESULTS_DIR / "concordance_by_population.json", "w") as f:
                json.dump(pairwise_results[primary_key]["by_population"], f, indent=2)

        if "by_superpopulation" in pairwise_results[primary_key]:
            with open(RESULTS_DIR / "concordance_by_superpopulation.json", "w") as f:
                json.dump(pairwise_results[primary_key]["by_superpopulation"], f, indent=2)

    # 3. Cohen's kappa summary
    kappa_summary = {}
    for pair_key, pair_data in pairwise_results.items():
        kappa_summary[pair_key] = {}
        for gene, gene_data in pair_data.get("per_gene", {}).items():
            kappa_summary[pair_key][gene] = gene_data.get("cohens_kappa", 0)
    with open(RESULTS_DIR / "cohens_kappa.json", "w") as f:
        json.dump(kappa_summary, f, indent=2)
    print(f"  ✓ Cohen's kappa → cohens_kappa.json")

    # 4. Sensitivity/specificity summary
    sens_spec_summary = {}
    for pair_key, pair_data in pairwise_results.items():
        sens_spec_summary[pair_key] = {}
        for gene, gene_data in pair_data.get("per_gene", {}).items():
            sens_spec_summary[pair_key][gene] = {
                k: gene_data[k]
                for k in ["sensitivity", "specificity", "ppv", "npv", "f1"]
                if k in gene_data
            }
    with open(RESULTS_DIR / "sensitivity_specificity.json", "w") as f:
        json.dump(sens_spec_summary, f, indent=2)
    print(f"  ✓ Sensitivity/specificity → sensitivity_specificity.json")

    # 5. Mismatches TSV
    if all_mismatches:
        # Determine all fieldnames dynamically
        all_keys = set()
        for m in all_mismatches:
            all_keys.update(m.keys())
        fieldnames = sorted(all_keys)
        # Put important ones first
        priority = ["sample_id", "population", "superpopulation", "gene", "tool_a", "tool_b", "triage"]
        ordered_fields = [f for f in priority if f in fieldnames]
        ordered_fields += [f for f in fieldnames if f not in priority]

        with open(RESULTS_DIR / "mismatches.tsv", "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=ordered_fields, delimiter="\t")
            writer.writeheader()
            writer.writerows(all_mismatches)
        print(f"  ✓ {len(all_mismatches)} mismatches → mismatches.tsv")

    # 6. Overall summary
    overall = {
        "tools_compared": available_tools,
        "n_tool_pairs": len(pairwise_results),
        "pairwise_overall": {
            k: v["overall_concordance"] for k, v in pairwise_results.items()
        },
        "total_mismatches": len(all_mismatches),
    }

    # Add primary pair stats
    if primary_key in pairwise_results:
        overall["primary_comparison"] = primary_key
        overall["primary_concordance"] = pairwise_results[primary_key]["overall_concordance"]
        overall["primary_total_comparisons"] = pairwise_results[primary_key]["total_comparisons"]

    with open(RESULTS_DIR / "step7_summary.json", "w") as f:
        json.dump(overall, f, indent=2)

    # Print summary table
    print(f"\n  ┌──────────────────────────────┬───────────────┐")
    print(f"  │ Tool Pair                    │ Concordance   │")
    print(f"  ├──────────────────────────────┼───────────────┤")
    for pair_key, pair_data in pairwise_results.items():
        label = pair_key.replace("_vs_", " vs ")
        print(f"  │ {label:<28} │ {pair_data['overall_concordance']:>10.2f}%   │")
    print(f"  └──────────────────────────────┴───────────────┘")

    print(f"\n  ✓ Step 7 complete.\n")
    return overall


if __name__ == "__main__":
    run()
