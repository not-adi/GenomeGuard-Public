import json
import sys
from pathlib import Path

# Add backend to path
sys.path.append(r"c:\Users\mstar\OneDrive\Desktop\gg\GenomeGuard\py-backend")

import pgx_knowledgebase as kb
import cpic_tables

RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)

# We want to synthetically validate the 7 genes that didn't get head-to-head PharmCAT validation
SYNTHETIC_GENES = ["CYP1A2", "CYP2C8", "NAT2"]
OUTSIDE_CALL_GENES = ["CYP2D6", "HLA-A", "HLA-B", "G6PD"]

results = {
    "synthetic": {},
    "outside_call": {}
}

def test_gene(gene, test_cases, mode):
    results[mode][gene] = {
        "cases": [],
        "pass": True,
        "total": len(test_cases)
    }
    for alleles, expected_pheno in test_cases:
        if len(alleles) == 0:
            mock_detected = []
        elif len(alleles) == 1:
            mock_detected = [{"star_allele": alleles[0], "genotype": "1/1"}]
        elif len(alleles) == 2:
            if alleles[0] == alleles[1]:
                mock_detected = [{"star_allele": alleles[0], "genotype": "1/1"}]
            else:
                mock_detected = [{"star_allele": a, "genotype": "0/1"} for a in alleles]
        else:
            mock_detected = [{"star_allele": a, "genotype": "0/1"} for a in alleles]
            
        # Test diplotype building
        diplotype = kb.build_diplotype(gene, mock_detected, has_coverage=True)
        
        # Test phenotype inference
        base_pheno = kb.infer_phenotype(gene, mock_detected, has_coverage=True)
        
        import analyzer
        phenotype = analyzer._infer_non_metabolizer_phenotype(gene, mock_detected, has_coverage=True)
        if phenotype == "Unknown": # analyzer returns Unknown if it doesn't override, fall back
            phenotype = base_pheno
            
        passed = (phenotype == expected_pheno)
        if not passed:
            results[mode][gene]["pass"] = False
            
        results[mode][gene]["cases"].append({
            "alleles": alleles,
            "diplotype": diplotype,
            "inferred_phenotype": phenotype,
            "expected_phenotype": expected_pheno,
            "passed": passed
        })
        
        # Fast exit for massive lists (like CYP2D6 if we tested all 16k, but we'll do a subset)
        if len(results[mode][gene]["cases"]) >= 1000:
            break

# 1. CYP1A2
test_gene("CYP1A2", [
    ([], "Normal Metabolizer"),
    (["*1F"], "Ultra-rapid Metabolizer"),
    (["*1K"], "Poor Metabolizer")
], "synthetic")

# 2. CYP2C8
test_gene("CYP2C8", [
    ([], "Normal Metabolizer"),
    (["*2"], "Poor Metabolizer"), # Homozygous *2/*2 is Poor
    (["*3", "*3"], "Poor Metabolizer"),
], "synthetic")

# 3. NAT2
test_gene("NAT2", [
    ([], "Rapid Acetylator"),
    (["*5A"], "Slow Acetylator"), # Homozygous *5A/*5A is Slow
    (["*6A", "*7B"], "Slow Acetylator"),
], "synthetic")

# 4. G6PD (Tier 2 - sex aware proxy testing)
test_gene("G6PD", [
    ([], "Normal"),
    (["Mediterranean"], "Deficient"), # Homozygous/Hemizygous mutated
    (["A-"], "Deficient")
], "outside_call")

# 5. CYP2D6 (Tier 2 - outside call inference)
# We test a few representative CPIC table entries
test_gene("CYP2D6", [
    ([], "Normal Metabolizer"),
    (["*4", "*5"], "Poor Metabolizer"), 
    (["*1", "*2x2"], "Ultrarapid Metabolizer"), # Spelled without hyphen in CPIC
    (["*17", "*41"], "Intermediate Metabolizer")
], "outside_call")

# 6. HLA-A (Tier 2 - outside call inference)
test_gene("HLA-A", [
    ([], "Negative"),
    (["*31:01"], "Positive")
], "outside_call")

# 7. HLA-B (Tier 2 - outside call inference)
test_gene("HLA-B", [
    ([], "Negative"),
    (["*15:02"], "Positive"),
    (["*58:01"], "Positive")
], "outside_call")

with open(RESULTS_DIR / "synthetic_validation.json", "w") as f:
    json.dump(results, f, indent=2)

print("Synthetic validation and outside-call inference tests complete.")
