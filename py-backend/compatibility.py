"""
Genetic Compatibility Calculator
================================
Calculates Mendelian inheritance probabilities for pharmacogenomic variants
based on two parents' genetic profiles.
"""

import json
import os
from typing import Dict, List, Optional, Tuple
from collections import Counter
from pgx_knowledgebase import (
    ALLELE_FUNCTION, KNOWN_GENES, _function_score, infer_phenotype,
    EXTENSIVE, INTERMEDIATE, POOR, ULTRA_RAPID, INDETERMINATE,
    # Non-metabolizer phenotype constants
    RAPID_ACETYLATOR, INTERMEDIATE_ACETYLATOR, SLOW_ACETYLATOR,
    VKORC1_HIGH_SENSITIVITY, VKORC1_NORMAL_SENSITIVITY,
    HLA_POSITIVE, HLA_NEGATIVE,
    G6PD_DEFICIENT, G6PD_NORMAL, G6PD_INTERMEDIATE,
    ABCG2_POOR_FUNCTION, ABCG2_DECREASED_FUNCTION, ABCG2_NORMAL_FUNCTION,
    IFNL3_FAVORABLE, IFNL3_UNFAVORABLE,
    CYP3A5_EXPRESSER, CYP3A5_INTERMEDIATE, CYP3A5_NON_EXPRESSER,
)

# Genes that don't use standard metabolizer phenotype categories
_NON_METABOLIZER_GENES = {
    "NAT2", "VKORC1", "HLA-B", "HLA-A", "G6PD", "ABCG2", "IFNL3", "CYP3A5",
}



def extract_alleles(gene_data) -> List[str]:
    """
    Extract the two alleles for a gene.
    Supports:
    1. gene_data as dict with "diplotype": "*1/*4"
    2. gene_data as list of variant dicts (detectedAlleles)
    3. gene_data as dict with "detectedAlleles" list
    """
    # Case A: gene_data is a list of variants
    if isinstance(gene_data, list):
        detected_alleles = gene_data
    else:
        # Case B: gene_data is a dict (gene object)
        # 1. Try direct diplotype string
        dip = gene_data.get("diplotype")
        if dip and "/" in dip:
            return dip.split("/")
            
        # 2. Get detected alleles list
        detected_alleles = gene_data.get("detectedAlleles", gene_data.get("detected_alleles", []))

    alleles = []
    
    for v in detected_alleles:
        # If v is not a dict (shouldn't happen if structure is correct), skip
        if not isinstance(v, dict):
            continue
            
        if not v.get("isVariant", v.get("is_variant", False)):
            continue
            
        star = v.get("starAllele", v.get("star_allele"))
        if not star:
            continue
            
        genotype = v.get("genotype", "0/0")
        
        if genotype in ("1/1", "1|1"):
            # Homozygous for this allele
            alleles.append(star)
            alleles.append(star)
        elif genotype in ("0/1", "0|1", "1|0", "1/0"):
            # Heterozygous
            alleles.append(star)
            
    # Fill remaining with *1 (Wild Type)
    while len(alleles) < 2:
        alleles.append("*1")
        
    # If we have more than 2 (complex case), take the first two found variants/wildtypes
    return alleles[:2]


def get_phenotype_for_diplotype(gene: str, allele1: str, allele2: str) -> str:
    """
    Calculate phenotype for a specific pair of alleles using KB logic.
    Handles both standard metabolizer genes and non-metabolizer genes.
    """
    gene_funcs = ALLELE_FUNCTION.get(gene, {})
    func1 = gene_funcs.get(allele1, "normal")
    func2 = gene_funcs.get(allele2, "normal")

    # Non-metabolizer genes use gene-specific phenotype logic
    if gene in _NON_METABOLIZER_GENES:
        return _get_non_metabolizer_phenotype(gene, func1, func2)

    # Standard metabolizer genes use activity-score heuristic
    score1 = _function_score(func1)
    score2 = _function_score(func2)
    total = score1 + score2

    if total >= 2.5:
        return ULTRA_RAPID
    elif total >= 1.5:
        return EXTENSIVE
    elif total >= 1.0:
        return INTERMEDIATE
    else:
        return POOR


def _get_non_metabolizer_phenotype(gene: str, func1: str, func2: str) -> str:
    """Determine phenotype for non-metabolizer genes based on allele functions."""
    funcs = [func1, func2]

    if gene == "NAT2":
        slow_count = sum(1 for f in funcs if f == "slow")
        if slow_count >= 2:
            return SLOW_ACETYLATOR
        elif slow_count == 1:
            return INTERMEDIATE_ACETYLATOR
        return RAPID_ACETYLATOR

    elif gene == "VKORC1":
        if any(f in ("high_sensitivity", "intermediate_sensitivity") for f in funcs):
            return VKORC1_HIGH_SENSITIVITY
        return VKORC1_NORMAL_SENSITIVITY

    elif gene in ("HLA-B", "HLA-A"):
        if any(f == "risk" for f in funcs):
            return HLA_POSITIVE
        return HLA_NEGATIVE

    elif gene == "G6PD":
        if any(f == "deficient" for f in funcs):
            return G6PD_DEFICIENT
        return G6PD_NORMAL

    elif gene == "ABCG2":
        if any(f == "poor" for f in funcs):
            return ABCG2_POOR_FUNCTION
        elif any(f == "decreased" for f in funcs):
            return ABCG2_DECREASED_FUNCTION
        return ABCG2_NORMAL_FUNCTION

    elif gene == "IFNL3":
        if any(f == "unfavorable" for f in funcs):
            return IFNL3_UNFAVORABLE
        elif any(f == "favorable" for f in funcs):
            return IFNL3_FAVORABLE
        return IFNL3_UNFAVORABLE

    elif gene == "CYP3A5":
        normal_count = sum(1 for f in funcs if f == "normal")
        if normal_count >= 2:
            return CYP3A5_EXPRESSER
        elif normal_count == 1:
            return CYP3A5_INTERMEDIATE
        return CYP3A5_NON_EXPRESSER

    return EXTENSIVE  # fallback


def _risk_from_phenotype(phenotype: str) -> str:
    """Map any phenotype (metabolizer or non-metabolizer) to a risk label."""
    _RISK_MAP = {
        # Standard metabolizer
        EXTENSIVE: "normal",
        INTERMEDIATE: "caution",
        POOR: "danger",
        ULTRA_RAPID: "warning",
        # NAT2
        RAPID_ACETYLATOR: "normal",
        INTERMEDIATE_ACETYLATOR: "caution",
        SLOW_ACETYLATOR: "danger",
        # VKORC1
        VKORC1_NORMAL_SENSITIVITY: "normal",
        VKORC1_HIGH_SENSITIVITY: "warning",
        # HLA
        HLA_NEGATIVE: "normal",
        HLA_POSITIVE: "danger",
        # G6PD
        G6PD_NORMAL: "normal",
        G6PD_INTERMEDIATE: "caution",
        G6PD_DEFICIENT: "danger",
        # ABCG2
        ABCG2_NORMAL_FUNCTION: "normal",
        ABCG2_DECREASED_FUNCTION: "caution",
        ABCG2_POOR_FUNCTION: "danger",
        # IFNL3
        IFNL3_FAVORABLE: "normal",
        IFNL3_UNFAVORABLE: "caution",
        # CYP3A5
        CYP3A5_EXPRESSER: "caution",      # needs higher tacrolimus dose
        CYP3A5_INTERMEDIATE: "caution",
        CYP3A5_NON_EXPRESSER: "normal",
    }
    return _RISK_MAP.get(phenotype, "normal")


def calculate_inheritance(parent1_genes: List[dict], parent2_genes: List[dict]) -> Dict[str, dict]:
    """
    Calculate inheritance probabilities for all known genes.
    
    parent_genes: List of gene objects from AnalysisResult (or dicts)
    """
    # Convert lists to dicts for easy lookup
    p1_map = {g.get("gene"): g.get("detectedAlleles", g.get("detected_alleles", [])) for g in parent1_genes}
    p2_map = {g.get("gene"): g.get("detectedAlleles", g.get("detected_alleles", [])) for g in parent2_genes}
    
    results = {}
    
    for gene in KNOWN_GENES:
        # Get alleles for both parents
        # If gene not in analysis, assume *1/*1 (User might not have data, but we proceed with WT assumption for now)
        p1_alleles = extract_alleles(p1_map.get(gene, []))
        p2_alleles = extract_alleles(p2_map.get(gene, []))
        
        # Punnett Square (2x2)
        # Mother (p1) x Father (p2)
        # Combinations:
        # 1. p1[0] - p2[0]
        # 2. p1[0] - p2[1]
        # 3. p1[1] - p2[0]
        # 4. p1[1] - p2[1]
        
        offspring_genotypes = [
            tuple(sorted((p1_alleles[0], p2_alleles[0]))),
            tuple(sorted((p1_alleles[0], p2_alleles[1]))),
            tuple(sorted((p1_alleles[1], p2_alleles[0]))),
            tuple(sorted((p1_alleles[1], p2_alleles[1])))
        ]
        
        # Calculate outcomes
        # We want to aggregate by Diplotype and Phenotype
        
        outcome_stats = []
        
        for a1, a2 in offspring_genotypes:
             phenotype = get_phenotype_for_diplotype(gene, a1, a2)
             outcome_stats.append({
                 "diplotype": f"{a1}/{a2}",
                 "phenotype": phenotype,
                 "risk": _risk_from_phenotype(phenotype)
             })

        # Aggregate counts
        # Identify unique outcomes and their probabilities (each is 25%)
        # But we group by (Diplotype, Phenotype)
        
        grouped = {}
        for outcome in outcome_stats:
            key = (outcome["diplotype"], outcome["phenotype"], outcome["risk"])
            grouped[key] = grouped.get(key, 0) + 0.25
            
        # Format for frontend
        child_risks = []
        for (dip, phen, risk), prob in grouped.items():
            child_risks.append({
                "diplotype": dip,
                "phenotype": phen,
                "probability": prob,
                "risk": risk
            })
            
        # Sort by probability desc
        child_risks.sort(key=lambda x: x["probability"], reverse=True)
        
        results[gene] = {
            "parent1_diplotype": f"{p1_alleles[0]}/{p1_alleles[1]}",
            "parent2_diplotype": f"{p2_alleles[0]}/{p2_alleles[1]}",
            "child_risks": child_risks
        }
        
    return results

if __name__ == "__main__":
    # Test Case
    print("Testing Compatibility Calculator...")
    
    # Mock Parent 1: CYP2D6 *1/*4 (IM)
    p1_data = [{
        "gene": "CYP2D6",
        "detectedAlleles": [{"starAllele": "*4", "genotype": "0/1", "isVariant": True}]
    }]
    
    # Mock Parent 2: CYP2D6 *4/*4 (PM)
    p2_data = [{
        "gene": "CYP2D6",
        "detectedAlleles": [{"starAllele": "*4", "genotype": "1/1", "isVariant": True}]
    }]
    
    res = calculate_inheritance(p1_data, p2_data)
    import json
    print(json.dumps(res, indent=2))
