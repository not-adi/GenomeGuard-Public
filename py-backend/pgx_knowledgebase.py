"""
Pharmacogenomics Knowledge Base (CPIC-aligned)
===============================================
Maps gene–star-allele combinations to metabolizer phenotypes,
and maps (gene, drug) pairs to risk predictions and dosing guidance
based on CPIC (Clinical Pharmacogenetics Implementation Consortium)
guidelines.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import cpic_tables

# ---------------------------------------------------------------------------
# Risk levels
# ---------------------------------------------------------------------------
SAFE = "Safe"
ADJUST = "Adjust Dosage"
TOXIC = "Toxic"
INEFFECTIVE = "Ineffective"
UNKNOWN = "Unknown"

# ---------------------------------------------------------------------------
# Metabolizer phenotype definitions
# ---------------------------------------------------------------------------
ULTRA_RAPID = "Ultra-rapid Metabolizer"
EXTENSIVE = "Normal Metabolizer"       # aka Extensive
INTERMEDIATE = "Intermediate Metabolizer"
POOR = "Poor Metabolizer"
INDETERMINATE = "Indeterminate"

# ---------------------------------------------------------------------------
# Non-metabolizer phenotype categories
# ---------------------------------------------------------------------------
# NAT2 (acetylator status)
RAPID_ACETYLATOR = "Rapid Acetylator"
INTERMEDIATE_ACETYLATOR = "Intermediate Acetylator"
SLOW_ACETYLATOR = "Slow Acetylator"

# VKORC1 (warfarin sensitivity)
VKORC1_HIGH_SENSITIVITY = "High Sensitivity"
VKORC1_NORMAL_SENSITIVITY = "Normal Sensitivity"

# HLA-B / HLA-A (risk allele presence)
HLA_POSITIVE = "Positive"
HLA_NEGATIVE = "Negative"

# G6PD (enzyme deficiency)
G6PD_DEFICIENT = "Deficient"
G6PD_NORMAL = "Normal"
G6PD_INTERMEDIATE = "Intermediate (Heterozygous)"

# ABCG2 (transporter function)
ABCG2_POOR_FUNCTION = "Poor Function"
ABCG2_DECREASED_FUNCTION = "Decreased Function"
ABCG2_NORMAL_FUNCTION = "Normal Function"

# IFNL3 (treatment response)
IFNL3_FAVORABLE = "Favorable Response"
IFNL3_UNFAVORABLE = "Unfavorable Response"

# CYP3A5 (expresser status — CPIC uses metabolizer terminology)
CYP3A5_EXPRESSER = "Normal Metabolizer"
CYP3A5_INTERMEDIATE = "Intermediate Metabolizer"
CYP3A5_NON_EXPRESSER = "Poor Metabolizer"

# ---------------------------------------------------------------------------
# Star-allele → function mapping
# ---------------------------------------------------------------------------
# For genes with CPIC Excel tables → loaded from cpic_tables (auto-discovered)
# For genes without tables → hardcoded fallback
_HARDCODED_ALLELE_FUNCTION: Dict[str, Dict[str, str]] = {
    # ── Original 6 genes ──
    "CYP2C19": {
        "*1":  "normal",
        "*2":  "no_function",
        "*3":  "no_function",
        "*4":  "no_function",
        "*17": "increased",
    },
    "CYP2C9": {
        "*1":  "normal",
        "*2":  "decreased",
        "*3":  "decreased",       # CPIC classifies *3 as decreased, not no_function
        "*5":  "decreased",
        "*6":  "no_function",
        "*8":  "decreased",
        "*11": "decreased",
    },
    "SLCO1B1": {
        "*1":  "normal",
        "*5":  "decreased",
        "*15": "decreased",
        "*17": "decreased",
    },
    "TPMT": {
        "*1":  "normal",
        "*2":  "no_function",
        "*3A": "no_function",
        "*3B": "no_function",
        "*3C": "no_function",
    },
    "DPYD": {
        "*1":   "normal",
        "*2A":  "no_function",
        "*13":  "no_function",
        "c.2846A>T":  "decreased",
        "c.1236G>A/HapB3": "decreased",
    },
    # ── NEW: 14 additional genes ──
    # CYP3A5 — tacrolimus dosing, ~70% Indians carry *3
    "CYP3A5": {
        "*1":  "normal",          # expresser
        "*3":  "no_function",     # non-expresser (most common globally)
        "*6":  "no_function",     # non-expresser
        "*7":  "no_function",     # non-expresser
    },
    # CYP3A4 — rifampicin inducer; affects amlodipine, atorvastatin
    "CYP3A4": {
        "*1":  "normal",
        "*22": "decreased",       # reduced expression (intron 6 SNP)
        "*20": "no_function",     # premature stop codon
    },
    # CYP2B6 — efavirenz (HIV), ketamine metabolism
    "CYP2B6": {
        "*1":  "normal",
        "*4":  "increased",
        "*6":  "decreased",       # most common variant globally (Q172H + K262R)
        "*9":  "decreased",
        "*18": "no_function",     # very low activity
    },
    # CYP1A2 — clozapine, theophylline; *1F high in Indians (42-51%)
    "CYP1A2": {
        "*1A": "normal",
        "*1C": "decreased",       # reduced inducibility
        "*1F": "increased",       # high inducibility (very common in Indians)
        "*1K": "decreased",
    },
    # UGT1A1 — irinotecan toxicity, Gilbert's syndrome
    "UGT1A1": {
        "*1":  "normal",
        "*6":  "decreased",       # common in East/South Asians
        "*28": "decreased",       # 7 TA repeats (Gilbert's)
        "*36": "increased",       # 5 TA repeats
        "*37": "no_function",     # 8 TA repeats
    },
    # NUDT15 — thiopurine toxicity, higher risk in South Asians
    "NUDT15": {
        "*1":  "normal",
        "*2":  "no_function",     # p.Arg139Cys homozygous — severe toxicity
        "*3":  "no_function",     # p.Arg139Cys + p.Val18Ile
        "*5":  "uncertain",
        "*6":  "no_function",
    },
    # CYP2C8 — paclitaxel, pioglitazone metabolism
    "CYP2C8": {
        "*1":  "normal",
        "*2":  "decreased",       # lower activity
        "*3":  "decreased",       # R139K + K399R
        "*4":  "decreased",       # I264M
    },
    # NAT2 — isoniazid hepatotoxicity; acetylator status
    "NAT2": {
        "*4":  "rapid",           # wild-type (rapid acetylator)
        "*5A": "slow",            # T341C (most common slow allele globally)
        "*5B": "slow",            # T341C + C481T
        "*5C": "slow",            # T341C + A803G
        "*6A": "slow",            # G590A (common in Indians)
        "*6B": "slow",            # G590A + G857A
        "*7A": "slow",            # G857A
        "*7B": "slow",            # G857A + C282T
        "*12A":"rapid",
        "*13": "rapid",
        "*14": "slow",
    },
    # VKORC1 — warfarin sensitivity (SNP-based, not star-allele)
    "VKORC1": {
        "-1639G>A_AA": "high_sensitivity",     # homozygous A — high warfarin sensitivity
        "-1639G>A_GA": "intermediate_sensitivity",
        "-1639G>A_GG": "normal_sensitivity",    # wild-type — normal warfarin dose
    },
    # HLA-B — SJS/SCAR risk alleles (critical in India)
    "HLA-B": {
        "*15:02": "risk",         # carbamazepine/phenytoin SJS — ~6-8% in Indians
        "*58:01": "risk",         # allopurinol SCAR — ~6-10% in Indians
        "*57:01": "risk",         # abacavir hypersensitivity
        "negative": "normal",     # no risk alleles detected
    },
    # HLA-A — carbamazepine hypersensitivity co-gene
    "HLA-A": {
        "*31:01": "risk",         # carbamazepine DRESS/maculopapular exanthema
        "negative": "normal",     # no risk alleles detected
    },
    # ABCG2 — statin transport, rosuvastatin dosing
    "ABCG2": {
        "rs2231142_CC": "normal",        # wild-type
        "rs2231142_CA": "decreased",     # heterozygous (Q141K)
        "rs2231142_AA": "poor",          # homozygous variant — poor transport
    },
    # IFNL3 (IL28B) — ribavirin/PEG-IFN response in Hepatitis C
    "IFNL3": {
        "rs12979860_CC": "favorable",    # best response to PEG-IFN/ribavirin
        "rs12979860_CT": "intermediate",
        "rs12979860_TT": "unfavorable",  # poor response
    },
    # G6PD — primaquine hemolysis risk (X-linked, enzyme deficiency)
    "G6PD": {
        "B":           "normal",     # wild-type
        "A+":          "normal",     # normal activity variant
        "A-":          "deficient",  # 10-60% activity (Class III)
        "Mediterranean":"deficient", # <10% activity (Class II) — common in India
        "Kerala-Kalyan":"deficient", # Indian-specific variant
        "Orissa":      "deficient",  # Indian-specific variant
        "Mahidol":     "deficient",  # common in Southeast Asia / NE India
    },
}

# Build the merged dict: CPIC tables override hardcoded entries
ALLELE_FUNCTION: Dict[str, Dict[str, str]] = {}
for _gene in set(list(_HARDCODED_ALLELE_FUNCTION.keys()) + cpic_tables.loaded_genes()):
    if cpic_tables.has_gene(_gene):
        ALLELE_FUNCTION[_gene] = cpic_tables.build_legacy_allele_function_dict(_gene)
    elif _gene in _HARDCODED_ALLELE_FUNCTION:
        ALLELE_FUNCTION[_gene] = _HARDCODED_ALLELE_FUNCTION[_gene]

# rsID → (gene, star-allele) lookup for VCFs that lack GENE/STAR INFO tags
# Auto-filled from CPIC tables for all loaded genes, plus hardcoded fallbacks
_HARDCODED_RSIDS: Dict[str, Tuple[str, str]] = {
    # ── Original genes ──
    # CYP2C19
    "rs4244285":  ("CYP2C19", "*2"),
    "rs4986893":  ("CYP2C19", "*3"),
    "rs12248560": ("CYP2C19", "*17"),
    # CYP2C9
    "rs1799853":  ("CYP2C9", "*2"),
    "rs1057910":  ("CYP2C9", "*3"),
    # SLCO1B1
    "rs4149056":  ("SLCO1B1", "*5"),
    # TPMT
    "rs1800462":  ("TPMT", "*2"),
    "rs1800460":  ("TPMT", "*3B"),
    "rs1142345":  ("TPMT", "*3C"),
    # DPYD
    "rs3918290":  ("DPYD", "*2A"),
    "rs55886062": ("DPYD", "*13"),
    "rs67376798": ("DPYD", "c.2846A>T"),

    # ── NEW: 14 additional genes ──
    # CYP3A5
    "rs776746":   ("CYP3A5", "*3"),     # 6986A>G — non-expresser (most impactful)
    "rs10264272": ("CYP3A5", "*6"),     # 14690G>A
    "rs41303343": ("CYP3A5", "*7"),     # 27131_27132insT

    # CYP3A4
    "rs35599367": ("CYP3A4", "*22"),    # intron 6 C>T — decreased expression

    # CYP2B6
    "rs3745274":  ("CYP2B6", "*6"),     # 516G>T (Q172H) — most important variant
    "rs2279343":  ("CYP2B6", "*4"),     # 785A>G (K262R)
    "rs28399499": ("CYP2B6", "*18"),    # 983T>C — very low activity

    # CYP1A2
    "rs762551":   ("CYP1A2", "*1F"),    # -163C>A — high inducibility
    "rs2069514":  ("CYP1A2", "*1C"),    # -3860G>A — decreased inducibility

    # UGT1A1
    "rs4148323":  ("UGT1A1", "*6"),     # 211G>A (G71R) — common in Asians
    "rs8175347":  ("UGT1A1", "*28"),    # (TA)7 repeat — Gilbert's syndrome

    # NUDT15
    "rs116855232": ("NUDT15", "*2"),    # c.415C>T (p.Arg139Cys) — thiopurine toxicity
    "rs186364861": ("NUDT15", "*3"),    # compound variant

    # CYP2C8
    "rs11572103": ("CYP2C8", "*2"),     # 805A>T (I269F)
    "rs10509681": ("CYP2C8", "*3"),     # 416G>A (R139K)
    "rs1058930":  ("CYP2C8", "*4"),     # 792C>G (I264M)

    # NAT2
    "rs1801280":  ("NAT2", "*5A"),      # T341C — most common slow allele
    "rs1799930":  ("NAT2", "*6A"),      # G590A — common in Indians
    "rs1799931":  ("NAT2", "*7A"),      # G857A
    "rs1041983":  ("NAT2", "*5B"),      # C282T (tag SNP for *5B haplotype)
    "rs1208":     ("NAT2", "*4"),       # A803G (rapid acetylator tag)

    # VKORC1
    "rs9923231":  ("VKORC1", "-1639G>A_GA"),  # -1639G>A — warfarin sensitivity

    # HLA-B (sentinel SNPs for risk alleles)
    "rs3909184":  ("HLA-B", "*15:02"),  # tag SNP for HLA-B*15:02 (carbamazepine SJS)
    "rs2395029":  ("HLA-B", "*57:01"),  # tag SNP for HLA-B*57:01 (abacavir)
    "rs9263726":  ("HLA-B", "*58:01"),  # tag SNP for HLA-B*58:01 (allopurinol SCAR)

    # HLA-A
    "rs1061235":  ("HLA-A", "*31:01"),  # tag SNP for HLA-A*31:01 (carbamazepine DRESS)

    # ABCG2
    "rs2231142":  ("ABCG2", "rs2231142_CA"),  # Q141K — decreased transport (het call)

    # IFNL3 (IL28B)
    "rs12979860": ("IFNL3", "rs12979860_CT"),  # IL28B genotype (het call)

    # G6PD (sentinel SNPs for common deficiency variants)
    "rs1050828":  ("G6PD", "A-"),        # 202G>A — G6PD A- variant
    "rs5030868":  ("G6PD", "Mediterranean"),  # 563C>T — G6PD Mediterranean
    "rs137852328": ("G6PD", "Kerala-Kalyan"),  # Indian-specific variant
}

# Merge: CPIC tables first (higher quality), hardcoded only if rsID not already covered
RSID_TO_ALLELE: Dict[str, Tuple[str, str]] = {}
for _gene in cpic_tables.loaded_genes():
    RSID_TO_ALLELE.update(cpic_tables.build_legacy_rsid_to_allele_dict(_gene))
for _rsid, _val in _HARDCODED_RSIDS.items():
    if _rsid not in RSID_TO_ALLELE:
        RSID_TO_ALLELE[_rsid] = _val

# ---------------------------------------------------------------------------
# Phenotype inference
# ---------------------------------------------------------------------------

def _function_score(func: str) -> float:
    return {"normal": 1.0, "decreased": 0.5, "no_function": 0.0, "increased": 1.5}.get(func, 1.0)


def build_diplotype(gene: str, detected_alleles: List[dict],
                    has_coverage: bool = True) -> str:
    """
    Build a diplotype string (e.g. '*1/*4') from detected variant alleles.
    Assumes diploid.  Variant alleles contribute one copy each (het) or
    both copies (hom).  Remaining copies are filled with *1 (wild-type).

    If no variant alleles are found and has_coverage is False (meaning the
    VCF did not contain data at this gene's defining positions), returns
    'Unknown/Unknown' instead of defaulting to '*1/*1'.
    """
    copies: List[str] = []
    for a in detected_alleles:
        star = a.get("star_allele", "")
        gt = a.get("genotype", "0/0")
        if not star:
            continue
        if gt in ("1/1", "1|1"):
            copies.extend([star, star])
        elif gt in ("0/1", "0|1", "1|0", "1/0"):
            copies.append(star)

    # If no variant alleles found and no coverage, return Unknown
    if not copies and not has_coverage:
        return "Unknown/Unknown"

    # Fill remaining with wild-type
    while len(copies) < 2:
        copies.append("*1")

    # Take the first two (most impactful)
    copies = copies[:2]
    # Canonical order: lower allele number first
    def _sort_key(s: str) -> float:
        n = s.lstrip("*").split("x")[0]
        n = n.replace("A", ".1").replace("B", ".2").replace("C", ".3")
        try:
            return float(n)
        except ValueError:
            return 999.0
    copies.sort(key=_sort_key)
    return f"{copies[0]}/{copies[1]}"


def infer_phenotype(gene: str, detected_alleles: List[dict],
                    has_coverage: bool = True) -> str:
    """
    Given detected variant alleles for a gene, infer the metabolizer phenotype.

    Each item in *detected_alleles* should have keys:
      - star_allele: str   (e.g. "*4")
      - genotype: str      (e.g. "0/1" or "1/1")

    If has_coverage is False and no variants are detected, returns
    INDETERMINATE instead of assuming Normal Metabolizer.

    For CYP2D6: first attempts an exact diplotype lookup in the official
    CPIC Diplotype-Phenotype Table (16,836 entries).  Falls back to
    activity-score heuristic if the diplotype is not found.

    For other genes: uses the activity-score heuristic.
    """
    # ── Try official CPIC diplotype table first (for any loaded gene) ──
    if cpic_tables.has_gene(gene):
        diplotype = build_diplotype(gene, detected_alleles, has_coverage)
        if diplotype == "Unknown/Unknown":
            return INDETERMINATE
        cpic_pheno = cpic_tables.infer_phenotype_from_diplotype(gene, diplotype)
        if cpic_pheno:
            return cpic_pheno
        # If not found (rare combo), fall through to heuristic

    # ── Heuristic: activity-score based ──
    gene_funcs = ALLELE_FUNCTION.get(gene, {})

    scores: List[float] = []
    for a in detected_alleles:
        star = a.get("star_allele", "")
        gt = a.get("genotype", "0/0")

        # For genes with CPIC tables, use official activity values
        if cpic_tables.has_gene(gene) and star:
            av = cpic_tables.get_activity_value(gene, star)
        else:
            func = gene_funcs.get(star, "normal")
            av = _function_score(func)

        if gt in ("1/1", "1|1"):
            scores.extend([av, av])
        elif gt in ("0/1", "0|1", "1|0", "1/0"):
            scores.append(av)

    if not scores:
        if not has_coverage:
            return INDETERMINATE  # no data → can't determine
        return EXTENSIVE  # confirmed reference → Normal Metabolizer

    while len(scores) < 2:
        scores.append(1.0)  # wild-type copy

    scores.sort()
    total = scores[0] + scores[1]

    if total >= 2.5:
        return ULTRA_RAPID
    elif total >= 2.0:
        return EXTENSIVE
    elif total >= 1.5:
        return INTERMEDIATE
    else:
        return POOR


# ---------------------------------------------------------------------------
# Drug–Gene interaction database (CPIC-aligned)
# ---------------------------------------------------------------------------

@dataclass
class DrugGeneInteraction:
    drug: str
    gene: str
    phenotype: str           # metabolizer phenotype
    risk: str                # SAFE / ADJUST / TOXIC / INEFFECTIVE
    recommendation: str      # CPIC dosing guidance
    mechanism: str           # biological explanation
    cpic_level: str = ""     # e.g. "A" (strongest evidence)
    guidelines_url: str = ""


# Master drug-gene interaction table
_INTERACTIONS: List[DrugGeneInteraction] = [
    # ── CYP2D6 ──────────────────────────────────────────────────────────
    DrugGeneInteraction("codeine", "CYP2D6", ULTRA_RAPID, TOXIC,
        "AVOID codeine. Use alternative analgesic not metabolized by CYP2D6 (e.g., morphine, non-opioids).",
        "CYP2D6 ultra-rapid metabolizers convert codeine to morphine at extremely high rates, leading to potentially fatal respiratory depression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("codeine", "CYP2D6", EXTENSIVE, SAFE,
        "Use codeine per standard dosing guidelines.",
        "Normal CYP2D6 activity produces expected morphine levels from codeine.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("codeine", "CYP2D6", INTERMEDIATE, ADJUST,
        "Use codeine with caution at reduced dose, or consider alternative analgesic.",
        "Reduced CYP2D6 activity leads to lower morphine formation; analgesic effect may be diminished.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("codeine", "CYP2D6", POOR, INEFFECTIVE,
        "AVOID codeine. Use alternative analgesic. Codeine will provide insufficient pain relief.",
        "CYP2D6 poor metabolizers cannot convert codeine to its active metabolite morphine, rendering it ineffective.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),

    DrugGeneInteraction("tramadol", "CYP2D6", ULTRA_RAPID, TOXIC,
        "AVOID tramadol. Risk of respiratory depression and seizures.",
        "Ultra-rapid CYP2D6 metabolism converts tramadol to O-desmethyltramadol at dangerously high rates.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("tramadol", "CYP2D6", EXTENSIVE, SAFE,
        "Use tramadol per standard dosing.",
        "Normal CYP2D6 metabolism produces expected levels of active metabolite.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("tramadol", "CYP2D6", INTERMEDIATE, ADJUST,
        "Use tramadol with caution; consider lower dose or alternative.",
        "Intermediate CYP2D6 activity may reduce active metabolite formation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),
    DrugGeneInteraction("tramadol", "CYP2D6", POOR, INEFFECTIVE,
        "AVOID tramadol. Consider alternative analgesic.",
        "Poor CYP2D6 metabolism prevents formation of the active O-desmethyltramadol metabolite.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/"),

    DrugGeneInteraction("tamoxifen", "CYP2D6", ULTRA_RAPID, SAFE,
        "Use tamoxifen per standard dosing.",
        "Adequate endoxifen formation with ultra-rapid CYP2D6 metabolism.",
        "A", "https://cpicpgx.org/guidelines/cpic-guideline-for-tamoxifen-based-on-cyp2d6-genotype/"),
    DrugGeneInteraction("tamoxifen", "CYP2D6", EXTENSIVE, SAFE,
        "Use tamoxifen per standard dosing (20 mg/day).",
        "Normal CYP2D6 converts tamoxifen to endoxifen at therapeutic levels.",
        "A", "https://cpicpgx.org/guidelines/cpic-guideline-for-tamoxifen-based-on-cyp2d6-genotype/"),
    DrugGeneInteraction("tamoxifen", "CYP2D6", INTERMEDIATE, ADJUST,
        "Consider higher dose (40 mg/day) or alternative (aromatase inhibitor if post-menopausal).",
        "Reduced CYP2D6 activity decreases endoxifen formation, possibly lowering efficacy for breast cancer treatment.",
        "A", "https://cpicpgx.org/guidelines/cpic-guideline-for-tamoxifen-based-on-cyp2d6-genotype/"),
    DrugGeneInteraction("tamoxifen", "CYP2D6", POOR, INEFFECTIVE,
        "AVOID tamoxifen. Use aromatase inhibitor (if post-menopausal) or alternative endocrine therapy.",
        "CYP2D6 poor metabolizers produce subtherapeutic endoxifen levels, compromising tamoxifen's anti-cancer efficacy.",
        "A", "https://cpicpgx.org/guidelines/cpic-guideline-for-tamoxifen-based-on-cyp2d6-genotype/"),

    # ── CYP2C19 ─────────────────────────────────────────────────────────
    DrugGeneInteraction("clopidogrel", "CYP2C19", ULTRA_RAPID, SAFE,
        "Use clopidogrel per standard dosing.",
        "Ultra-rapid CYP2C19 metabolism provides enhanced activation of clopidogrel to its active thiol metabolite.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("clopidogrel", "CYP2C19", EXTENSIVE, SAFE,
        "Use clopidogrel per standard dosing (75 mg/day).",
        "Normal CYP2C19 function activates clopidogrel adequately for anti-platelet effect.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("clopidogrel", "CYP2C19", INTERMEDIATE, ADJUST,
        "Consider alternative antiplatelet (prasugrel or ticagrelor) if undergoing PCI.",
        "Reduced CYP2C19 function decreases clopidogrel bioactivation, increasing risk of cardiovascular events.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("clopidogrel", "CYP2C19", POOR, INEFFECTIVE,
        "Use ALTERNATIVE antiplatelet agent (prasugrel or ticagrelor). Clopidogrel will not provide adequate platelet inhibition.",
        "CYP2C19 poor metabolizers cannot bioactivate clopidogrel, leading to treatment failure and increased thrombotic risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),

    DrugGeneInteraction("omeprazole", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Increase dose to 2-3× standard or use alternative PPI (rabeprazole).",
        "Ultra-rapid CYP2C19 metabolism clears omeprazole too quickly for adequate acid suppression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("omeprazole", "CYP2C19", EXTENSIVE, SAFE,
        "Use omeprazole per standard dosing (20 mg/day).",
        "Normal CYP2C19 activity provides expected omeprazole pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("omeprazole", "CYP2C19", INTERMEDIATE, SAFE,
        "Use omeprazole per standard dosing. Slightly elevated drug levels are clinically beneficial.",
        "Intermediate CYP2C19 metabolism results in higher omeprazole exposure, which may improve acid suppression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("omeprazole", "CYP2C19", POOR, ADJUST,
        "Consider 50% dose reduction. Monitor for adverse effects.",
        "CYP2C19 poor metabolizers have markedly elevated omeprazole exposure (up to 10×), increasing risk of adverse effects.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),

    DrugGeneInteraction("escitalopram", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Consider alternative SSRI not metabolized by CYP2C19 or increase dose with monitoring.",
        "Ultra-rapid CYP2C19 metabolism may result in subtherapeutic escitalopram levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("escitalopram", "CYP2C19", EXTENSIVE, SAFE,
        "Use escitalopram per standard dosing (10-20 mg/day).",
        "Normal CYP2C19 metabolism provides expected escitalopram exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("escitalopram", "CYP2C19", INTERMEDIATE, SAFE,
        "Use escitalopram per standard dosing.",
        "Intermediate CYP2C19 metabolism has modest impact on escitalopram levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("escitalopram", "CYP2C19", POOR, ADJUST,
        "Reduce dose by 50%. Consider alternative SSRI if adverse effects occur.",
        "CYP2C19 poor metabolizers have significantly elevated escitalopram plasma concentrations, increasing side-effect risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),

    DrugGeneInteraction("voriconazole", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Use alternative antifungal agent or increase dose with therapeutic drug monitoring.",
        "Ultra-rapid CYP2C19 metabolism clears voriconazole too rapidly for adequate antifungal activity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-voriconazole-and-cyp2c19/"),
    DrugGeneInteraction("voriconazole", "CYP2C19", EXTENSIVE, SAFE,
        "Use voriconazole per standard dosing.",
        "Normal CYP2C19 function provides expected voriconazole pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-voriconazole-and-cyp2c19/"),
    DrugGeneInteraction("voriconazole", "CYP2C19", INTERMEDIATE, SAFE,
        "Use voriconazole per standard dosing.",
        "Intermediate CYP2C19 metabolism has minimal clinical impact on voriconazole levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-voriconazole-and-cyp2c19/"),
    DrugGeneInteraction("voriconazole", "CYP2C19", POOR, TOXIC,
        "Reduce dose by 50% or use alternative antifungal. Monitor trough levels closely.",
        "CYP2C19 poor metabolizers have dramatically elevated voriconazole exposure, risking hepatotoxicity and visual disturbances.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-voriconazole-and-cyp2c19/"),

    # ── CYP2C9 ──────────────────────────────────────────────────────────
    DrugGeneInteraction("warfarin", "CYP2C9", EXTENSIVE, SAFE,
        "Use standard warfarin dosing algorithm with INR monitoring.",
        "Normal CYP2C9 metabolism clears S-warfarin at expected rates.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"),
    DrugGeneInteraction("warfarin", "CYP2C9", INTERMEDIATE, ADJUST,
        "Reduce initial dose by 25-50%. Increase INR monitoring frequency.",
        "Reduced CYP2C9 function decreases S-warfarin clearance, increasing bleeding risk at standard doses.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"),
    DrugGeneInteraction("warfarin", "CYP2C9", POOR, TOXIC,
        "Reduce initial dose by 50-80%. Use frequent INR monitoring. Consider alternative anticoagulant (DOAC).",
        "CYP2C9 poor metabolizers accumulate S-warfarin to dangerously high levels, causing severe bleeding risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"),

    DrugGeneInteraction("celecoxib", "CYP2C9", EXTENSIVE, SAFE,
        "Use celecoxib per standard dosing.",
        "Normal CYP2C9 metabolism provides expected celecoxib clearance.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-nsaids-and-cyp2c9/"),
    DrugGeneInteraction("celecoxib", "CYP2C9", INTERMEDIATE, ADJUST,
        "Reduce starting dose by 50%. Use lowest effective dose.",
        "Intermediate CYP2C9 metabolism results in elevated celecoxib exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-nsaids-and-cyp2c9/"),
    DrugGeneInteraction("celecoxib", "CYP2C9", POOR, TOXIC,
        "Reduce dose by 75% or avoid celecoxib. Use alternative NSAID or analgesic.",
        "CYP2C9 poor metabolizers have significantly impaired celecoxib clearance, increasing GI and cardiovascular toxicity risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-nsaids-and-cyp2c9/"),

    DrugGeneInteraction("phenytoin", "CYP2C9", EXTENSIVE, SAFE,
        "Use phenytoin per standard dosing with therapeutic drug monitoring.",
        "Normal CYP2C9 function provides expected phenytoin pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-phenytoin-and-cyp2c9-and-hla-b/"),
    DrugGeneInteraction("phenytoin", "CYP2C9", INTERMEDIATE, ADJUST,
        "Reduce dose by 25%. Monitor phenytoin levels closely.",
        "Reduced CYP2C9 activity leads to higher phenytoin levels and narrower therapeutic window.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-phenytoin-and-cyp2c9-and-hla-b/"),
    DrugGeneInteraction("phenytoin", "CYP2C9", POOR, TOXIC,
        "Reduce dose by 50% or use alternative antiepileptic. Monitor drug levels closely.",
        "CYP2C9 poor metabolizers accumulate phenytoin, risking CNS toxicity (ataxia, nystagmus, seizures).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-phenytoin-and-cyp2c9-and-hla-b/"),

    # ── SLCO1B1 ─────────────────────────────────────────────────────────
    DrugGeneInteraction("simvastatin", "SLCO1B1", "Normal Function", SAFE,
        "Use simvastatin per standard dosing (up to 40 mg/day).",
        "Normal SLCO1B1 transporter function provides adequate hepatic uptake of simvastatin acid.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),
    DrugGeneInteraction("simvastatin", "SLCO1B1", "Decreased Function", ADJUST,
        "Limit simvastatin to ≤20 mg/day or use alternative statin (rosuvastatin/pravastatin).",
        "Reduced SLCO1B1 function increases systemic simvastatin acid exposure, raising myopathy risk (OR ~2.6 per *5 allele).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),
    DrugGeneInteraction("simvastatin", "SLCO1B1", "Poor Function", TOXIC,
        "AVOID simvastatin. Use alternative statin (rosuvastatin or pravastatin at lowest effective dose).",
        "SLCO1B1 poor function causes dramatically elevated simvastatin acid levels, with ~18× increased myopathy risk including rhabdomyolysis.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),

    DrugGeneInteraction("atorvastatin", "SLCO1B1", "Normal Function", SAFE,
        "Use atorvastatin per standard dosing.",
        "Normal SLCO1B1 function provides expected hepatic uptake of atorvastatin.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),
    DrugGeneInteraction("atorvastatin", "SLCO1B1", "Decreased Function", ADJUST,
        "Use lower dose atorvastatin or consider pravastatin/rosuvastatin.",
        "Reduced SLCO1B1 function modestly increases atorvastatin systemic exposure.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),
    DrugGeneInteraction("atorvastatin", "SLCO1B1", "Poor Function", ADJUST,
        "Use lowest effective dose or switch to pravastatin/rosuvastatin. Monitor for muscle symptoms.",
        "Poor SLCO1B1 function significantly increases atorvastatin exposure and myopathy risk.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/"),

    # ── TPMT ────────────────────────────────────────────────────────────
    DrugGeneInteraction("azathioprine", "TPMT", EXTENSIVE, SAFE,
        "Use azathioprine per standard dosing (2-3 mg/kg/day).",
        "Normal TPMT activity provides expected thiopurine metabolism and safe thioguanine nucleotide (TGN) levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("azathioprine", "TPMT", INTERMEDIATE, ADJUST,
        "Reduce dose to 30-70% of standard. Monitor CBC weekly for first months.",
        "Intermediate TPMT activity causes higher TGN accumulation, increasing myelosuppression risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("azathioprine", "TPMT", POOR, TOXIC,
        "Reduce dose to 10% of standard or AVOID. Use alternative immunosuppressant. Mandatory CBC monitoring.",
        "TPMT-deficient patients accumulate lethal TGN concentrations, causing severe/fatal myelosuppression (pancytopenia).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),

    DrugGeneInteraction("mercaptopurine", "TPMT", EXTENSIVE, SAFE,
        "Use mercaptopurine per protocol dosing.",
        "Normal TPMT activity provides safe thiopurine metabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("mercaptopurine", "TPMT", INTERMEDIATE, ADJUST,
        "Reduce dose to 30-70% of standard. Monitor CBC closely.",
        "Intermediate TPMT activity increases TGN accumulation and myelosuppression risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("mercaptopurine", "TPMT", POOR, TOXIC,
        "Reduce dose to 10% of standard or AVOID. Mandatory intensive CBC monitoring.",
        "TPMT deficiency causes dangerous TGN accumulation and life-threatening myelotoxicity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),

    # ── DPYD ────────────────────────────────────────────────────────────
    DrugGeneInteraction("fluorouracil", "DPYD", EXTENSIVE, SAFE,
        "Use 5-fluorouracil per standard dosing.",
        "Normal DPD enzyme activity provides expected fluorouracil catabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),
    DrugGeneInteraction("fluorouracil", "DPYD", INTERMEDIATE, ADJUST,
        "Reduce initial dose by 50%. Titrate based on toxicity and efficacy.",
        "Reduced DPD activity impairs fluorouracil catabolism, increasing exposure and toxicity risk (mucositis, myelosuppression).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),
    DrugGeneInteraction("fluorouracil", "DPYD", POOR, TOXIC,
        "AVOID fluorouracil and all fluoropyrimidines. Use alternative chemotherapy.",
        "DPD-deficient patients cannot catabolize fluorouracil, resulting in severe/fatal toxicity (mucositis, neutropenia, neurotoxicity).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),

    DrugGeneInteraction("capecitabine", "DPYD", EXTENSIVE, SAFE,
        "Use capecitabine per standard dosing.",
        "Normal DPD activity provides expected capecitabine/fluorouracil metabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),
    DrugGeneInteraction("capecitabine", "DPYD", INTERMEDIATE, ADJUST,
        "Reduce initial dose by 50%. Monitor closely for toxicity.",
        "Reduced DPD activity impairs fluoropyrimidine catabolism, increasing toxicity risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),
    DrugGeneInteraction("capecitabine", "DPYD", POOR, TOXIC,
        "AVOID capecitabine. Use alternative chemotherapy regimen.",
        "DPD deficiency causes life-threatening fluoropyrimidine toxicity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/"),

    # ══════════════════════════════════════════════════════════════════════
    # NEW DRUG-GENE INTERACTIONS (India-focused expansion)
    # ══════════════════════════════════════════════════════════════════════

    # ── NAT2 / Isoniazid (Anti-TB) 🇮🇳 ─────────────────────────────────
    DrugGeneInteraction("isoniazid", "NAT2", RAPID_ACETYLATOR, SAFE,
        "Use isoniazid per standard dosing (5 mg/kg/day, max 300 mg).",
        "Rapid NAT2 acetylators clear isoniazid quickly with normal hepatotoxicity risk.",
        "A", "https://www.pharmgkb.org/guidelineAnnotation/PA166181087"),
    DrugGeneInteraction("isoniazid", "NAT2", INTERMEDIATE_ACETYLATOR, SAFE,
        "Use isoniazid per standard dosing. Monitor LFTs monthly.",
        "Intermediate NAT2 acetylators have moderately elevated isoniazid exposure but generally tolerate standard doses.",
        "A", "https://www.pharmgkb.org/guidelineAnnotation/PA166181087"),
    DrugGeneInteraction("isoniazid", "NAT2", SLOW_ACETYLATOR, TOXIC,
        "Consider dose reduction (4 mg/kg/day) or enhanced hepatotoxicity monitoring. Monitor LFTs biweekly for first 2 months.",
        "NAT2 slow acetylators accumulate isoniazid and its hepatotoxic metabolite acetylhydrazine, with 3-4× increased risk of drug-induced liver injury (DILI).",
        "A", "https://www.pharmgkb.org/guidelineAnnotation/PA166181087"),

    # ── CYP2D6 / Metoprolol (Cardiology) ───────────────────────────────
    DrugGeneInteraction("metoprolol", "CYP2D6", ULTRA_RAPID, INEFFECTIVE,
        "Consider higher dose or alternative beta-blocker not metabolized by CYP2D6 (e.g., atenolol, bisoprolol).",
        "Ultra-rapid CYP2D6 metabolism clears metoprolol rapidly, leading to subtherapeutic levels and inadequate heart rate/BP control.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-beta-blockers/"),
    DrugGeneInteraction("metoprolol", "CYP2D6", EXTENSIVE, SAFE,
        "Use metoprolol per standard dosing.",
        "Normal CYP2D6 activity provides expected metoprolol pharmacokinetics.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-beta-blockers/"),
    DrugGeneInteraction("metoprolol", "CYP2D6", INTERMEDIATE, ADJUST,
        "Consider 50% dose reduction. Monitor for bradycardia and hypotension.",
        "Intermediate CYP2D6 metabolism results in higher metoprolol exposure, increasing risk of exaggerated beta-blockade.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-beta-blockers/"),
    DrugGeneInteraction("metoprolol", "CYP2D6", POOR, TOXIC,
        "Reduce dose by 75% or use alternative beta-blocker (atenolol, bisoprolol). Monitor closely for bradycardia.",
        "CYP2D6 poor metabolizers have 4-6× higher metoprolol exposure, risking severe bradycardia and hypotension.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-beta-blockers/"),

    # ── CYP2C9 / Losartan (Cardiology) ─────────────────────────────────
    DrugGeneInteraction("losartan", "CYP2C9", EXTENSIVE, SAFE,
        "Use losartan per standard dosing.",
        "Normal CYP2C9 converts losartan to its active metabolite E-3174 at therapeutic levels.",
        "B", ""),
    DrugGeneInteraction("losartan", "CYP2C9", INTERMEDIATE, ADJUST,
        "Monitor blood pressure closely. Consider alternative ARB if response is inadequate.",
        "Reduced CYP2C9 activity decreases conversion of losartan to active metabolite, potentially reducing antihypertensive effect.",
        "B", ""),
    DrugGeneInteraction("losartan", "CYP2C9", POOR, INEFFECTIVE,
        "Consider alternative ARB (valsartan, irbesartan) not dependent on CYP2C9 activation.",
        "CYP2C9 poor metabolizers cannot efficiently convert losartan to its active metabolite E-3174, leading to reduced efficacy.",
        "B", ""),

    # ── ABCG2 / Rosuvastatin (Cardiology) ──────────────────────────────
    DrugGeneInteraction("rosuvastatin", "ABCG2", ABCG2_NORMAL_FUNCTION, SAFE,
        "Use rosuvastatin per standard dosing.",
        "Normal ABCG2 transporter function provides expected rosuvastatin disposition.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-statins/"),
    DrugGeneInteraction("rosuvastatin", "ABCG2", ABCG2_DECREASED_FUNCTION, ADJUST,
        "Use rosuvastatin ≤20 mg/day. Monitor for myopathy symptoms.",
        "Decreased ABCG2 function (Q141K heterozygous) increases rosuvastatin systemic exposure by ~80%.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-statins/"),
    DrugGeneInteraction("rosuvastatin", "ABCG2", ABCG2_POOR_FUNCTION, TOXIC,
        "Use rosuvastatin ≤10 mg/day or switch to alternative statin. Monitor for myopathy.",
        "Poor ABCG2 function (Q141K homozygous) increases rosuvastatin exposure by ~2.4×, significantly raising myopathy risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-statins/"),

    # ── CYP2C19 / Prasugrel (Cardiology) ───────────────────────────────
    DrugGeneInteraction("prasugrel", "CYP2C19", ULTRA_RAPID, SAFE,
        "Use prasugrel per standard dosing.",
        "Prasugrel activation is minimally affected by CYP2C19 genotype.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("prasugrel", "CYP2C19", EXTENSIVE, SAFE,
        "Use prasugrel per standard dosing (10 mg/day after 60 mg loading).",
        "Normal CYP2C19 function; prasugrel is a recommended alternative to clopidogrel.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("prasugrel", "CYP2C19", INTERMEDIATE, SAFE,
        "Use prasugrel per standard dosing. Preferred over clopidogrel for CYP2C19 intermediate metabolizers.",
        "Prasugrel activation is not significantly dependent on CYP2C19, making it a safer choice than clopidogrel.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("prasugrel", "CYP2C19", POOR, SAFE,
        "Use prasugrel per standard dosing. PREFERRED alternative to clopidogrel for CYP2C19 poor metabolizers.",
        "Prasugrel bypasses CYP2C19 for activation, providing consistent antiplatelet effect regardless of CYP2C19 genotype.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),

    # ── CYP2C19 / Ticagrelor (Cardiology) ──────────────────────────────
    DrugGeneInteraction("ticagrelor", "CYP2C19", ULTRA_RAPID, SAFE,
        "Use ticagrelor per standard dosing.",
        "Ticagrelor is an active drug not requiring CYP2C19 bioactivation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("ticagrelor", "CYP2C19", EXTENSIVE, SAFE,
        "Use ticagrelor per standard dosing (90 mg BID).",
        "Ticagrelor does not require CYP2C19-mediated bioactivation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("ticagrelor", "CYP2C19", INTERMEDIATE, SAFE,
        "Use ticagrelor per standard dosing. Preferred over clopidogrel for CYP2C19 intermediate metabolizers.",
        "Ticagrelor is CYP2C19-independent, making it a safer choice than clopidogrel.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),
    DrugGeneInteraction("ticagrelor", "CYP2C19", POOR, SAFE,
        "Use ticagrelor per standard dosing. PREFERRED alternative to clopidogrel for CYP2C19 poor metabolizers.",
        "Ticagrelor provides CYP2C19-independent antiplatelet activity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/"),

    # ── CYP2C8 / Pioglitazone (Diabetes) 🇮🇳 ──────────────────────────
    DrugGeneInteraction("pioglitazone", "CYP2C8", EXTENSIVE, SAFE,
        "Use pioglitazone per standard dosing (15-45 mg/day).",
        "Normal CYP2C8 metabolism provides expected pioglitazone clearance.",
        "B", ""),
    DrugGeneInteraction("pioglitazone", "CYP2C8", INTERMEDIATE, ADJUST,
        "Consider starting at lower dose (15 mg/day). Monitor for edema and weight gain.",
        "Reduced CYP2C8 activity leads to higher pioglitazone exposure, increasing risk of fluid retention.",
        "B", ""),
    DrugGeneInteraction("pioglitazone", "CYP2C8", POOR, TOXIC,
        "AVOID pioglitazone or use minimum dose (15 mg/day) with close monitoring. Consider alternative antidiabetic.",
        "CYP2C8 poor metabolizers have significantly elevated pioglitazone levels, increasing risks of edema, heart failure, and fractures.",
        "B", ""),

    # ── CYP2C19 / Pantoprazole (PPIs) 🇮🇳 ──────────────────────────────
    DrugGeneInteraction("pantoprazole", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Increase dose to 40-80 mg/day or use alternative PPI (rabeprazole).",
        "Ultra-rapid CYP2C19 metabolism clears pantoprazole too quickly for adequate acid suppression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("pantoprazole", "CYP2C19", EXTENSIVE, SAFE,
        "Use pantoprazole per standard dosing (40 mg/day).",
        "Normal CYP2C19 activity provides expected pantoprazole pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("pantoprazole", "CYP2C19", INTERMEDIATE, SAFE,
        "Use pantoprazole per standard dosing.",
        "Intermediate CYP2C19 metabolism results in slightly higher pantoprazole exposure, which is clinically beneficial for acid suppression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("pantoprazole", "CYP2C19", POOR, ADJUST,
        "Consider dose reduction to 20 mg/day. Monitor for adverse effects.",
        "CYP2C19 poor metabolizers have elevated pantoprazole exposure, increasing risk of adverse effects with long-term use.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),

    # ── CYP2C19 / Lansoprazole (PPIs) 🇮🇳 ──────────────────────────────
    DrugGeneInteraction("lansoprazole", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Increase dose to 60 mg/day or use alternative PPI (rabeprazole).",
        "Ultra-rapid CYP2C19 metabolism results in subtherapeutic lansoprazole levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("lansoprazole", "CYP2C19", EXTENSIVE, SAFE,
        "Use lansoprazole per standard dosing (30 mg/day).",
        "Normal CYP2C19 function provides expected lansoprazole metabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("lansoprazole", "CYP2C19", INTERMEDIATE, SAFE,
        "Use lansoprazole per standard dosing.",
        "Intermediate CYP2C19 metabolism has modest impact on lansoprazole levels, generally beneficial for acid suppression.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),
    DrugGeneInteraction("lansoprazole", "CYP2C19", POOR, ADJUST,
        "Reduce dose to 15 mg/day. Monitor for adverse effects.",
        "CYP2C19 poor metabolizers have significantly elevated lansoprazole exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/"),

    # ── CYP2C19 / Sertraline (Antidepressant) ─────────────────────────
    DrugGeneInteraction("sertraline", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Consider alternative SSRI or increase dose with therapeutic drug monitoring.",
        "Ultra-rapid CYP2C19 metabolism may result in subtherapeutic sertraline levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("sertraline", "CYP2C19", EXTENSIVE, SAFE,
        "Use sertraline per standard dosing (50-200 mg/day).",
        "Normal CYP2C19 metabolism provides expected sertraline pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("sertraline", "CYP2C19", INTERMEDIATE, SAFE,
        "Use sertraline per standard dosing.",
        "Intermediate CYP2C19 metabolism has modest clinical impact on sertraline levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("sertraline", "CYP2C19", POOR, ADJUST,
        "Consider 50% dose reduction or alternative SSRI. Monitor for adverse effects.",
        "CYP2C19 poor metabolizers have elevated sertraline plasma concentrations, increasing side-effect risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),

    # ── CYP2D6 + CYP2C19 / Amitriptyline (Antidepressant) ─────────────
    DrugGeneInteraction("amitriptyline", "CYP2D6", ULTRA_RAPID, INEFFECTIVE,
        "AVOID amitriptyline. Consider alternative not metabolized by CYP2D6 (e.g., SSRI, SNRI).",
        "Ultra-rapid CYP2D6 metabolism reduces amitriptyline exposure, likely resulting in therapeutic failure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2D6", EXTENSIVE, SAFE,
        "Use amitriptyline per standard dosing.",
        "Normal CYP2D6 activity provides expected amitriptyline and nortriptyline levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2D6", INTERMEDIATE, ADJUST,
        "Consider 25% dose reduction. Monitor TCA plasma levels.",
        "Intermediate CYP2D6 metabolism results in higher amitriptyline exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2D6", POOR, TOXIC,
        "AVOID amitriptyline or reduce dose by 50%. Monitor TCA plasma levels. Consider alternative.",
        "CYP2D6 poor metabolizers accumulate amitriptyline, increasing risk of cardiotoxicity, sedation, and anticholinergic effects.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2C19", ULTRA_RAPID, ADJUST,
        "Consider 25% dose increase or monitor TCA levels for efficacy.",
        "Ultra-rapid CYP2C19 metabolism increases amitriptyline clearance via N-demethylation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2C19", EXTENSIVE, SAFE,
        "Use amitriptyline per standard dosing guidelines.",
        "Normal CYP2C19 activity provides expected amitriptyline N-demethylation rates.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2C19", INTERMEDIATE, SAFE,
        "Use amitriptyline per standard dosing guidelines.",
        "Intermediate CYP2C19 metabolism has minimal clinical impact on amitriptyline levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("amitriptyline", "CYP2C19", POOR, ADJUST,
        "Consider 50% dose reduction of amitriptyline. Monitor plasma levels.",
        "CYP2C19 poor metabolizers have reduced N-demethylation, increasing amitriptyline exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),

    # ── CYP2D6 / Nortriptyline (Antidepressant) ───────────────────────
    DrugGeneInteraction("nortriptyline", "CYP2D6", ULTRA_RAPID, INEFFECTIVE,
        "AVOID nortriptyline. Use alternative antidepressant.",
        "Ultra-rapid CYP2D6 metabolism leads to subtherapeutic nortriptyline levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("nortriptyline", "CYP2D6", EXTENSIVE, SAFE,
        "Use nortriptyline per standard dosing. Target plasma level 50-150 ng/mL.",
        "Normal CYP2D6 metabolism provides expected nortriptyline pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("nortriptyline", "CYP2D6", INTERMEDIATE, ADJUST,
        "Consider 25% dose reduction. Monitor plasma levels.",
        "Intermediate CYP2D6 metabolism results in higher nortriptyline exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("nortriptyline", "CYP2D6", POOR, TOXIC,
        "AVOID nortriptyline or reduce dose by 50%. Mandatory plasma level monitoring.",
        "CYP2D6 poor metabolizers accumulate nortriptyline to toxic levels, risking cardiac arrhythmias and CNS toxicity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tricyclic-antidepressants-and-cyp2d6-and-cyp2c19/"),

    # ── CYP2D6 / Fluvoxamine (Antidepressant) ─────────────────────────
    DrugGeneInteraction("fluvoxamine", "CYP2D6", ULTRA_RAPID, ADJUST,
        "Consider dose increase with monitoring, or use alternative SSRI.",
        "Ultra-rapid CYP2D6 metabolism may reduce fluvoxamine levels, though CYP2D6 is a minor pathway.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("fluvoxamine", "CYP2D6", EXTENSIVE, SAFE,
        "Use fluvoxamine per standard dosing.",
        "Normal CYP2D6 activity provides expected fluvoxamine metabolism.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("fluvoxamine", "CYP2D6", INTERMEDIATE, SAFE,
        "Use fluvoxamine per standard dosing.",
        "Intermediate CYP2D6 metabolism has minimal clinical impact on fluvoxamine.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("fluvoxamine", "CYP2D6", POOR, ADJUST,
        "Consider 25-50% dose reduction. Monitor for adverse effects.",
        "CYP2D6 poor metabolizers may have modestly elevated fluvoxamine levels.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),

    # ── CYP2D6 / Paroxetine (Antidepressant) ──────────────────────────
    DrugGeneInteraction("paroxetine", "CYP2D6", ULTRA_RAPID, INEFFECTIVE,
        "Consider alternative SSRI not primarily metabolized by CYP2D6.",
        "Ultra-rapid CYP2D6 metabolism may result in subtherapeutic paroxetine levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("paroxetine", "CYP2D6", EXTENSIVE, SAFE,
        "Use paroxetine per standard dosing (20-50 mg/day).",
        "Normal CYP2D6 metabolism provides expected paroxetine pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("paroxetine", "CYP2D6", INTERMEDIATE, SAFE,
        "Use paroxetine per standard dosing.",
        "Paroxetine inhibits its own metabolism (autoinhibition), minimizing the impact of CYP2D6 genotype in intermediate metabolizers.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("paroxetine", "CYP2D6", POOR, ADJUST,
        "Consider 50% dose reduction. Monitor for adverse effects (serotonergic, GI, sexual).",
        "CYP2D6 poor metabolizers have elevated paroxetine plasma concentrations, increasing side-effect risk despite autoinhibition.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),

    # ── CYP2C19 / Citalopram (Antidepressant) ─────────────────────────
    DrugGeneInteraction("citalopram", "CYP2C19", ULTRA_RAPID, INEFFECTIVE,
        "Consider alternative SSRI or increase dose with monitoring.",
        "Ultra-rapid CYP2C19 metabolism may result in subtherapeutic citalopram levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("citalopram", "CYP2C19", EXTENSIVE, SAFE,
        "Use citalopram per standard dosing (20-40 mg/day).",
        "Normal CYP2C19 metabolism provides expected citalopram exposure.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("citalopram", "CYP2C19", INTERMEDIATE, SAFE,
        "Use citalopram per standard dosing.",
        "Intermediate CYP2C19 metabolism has modest impact on citalopram levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),
    DrugGeneInteraction("citalopram", "CYP2C19", POOR, ADJUST,
        "Reduce dose by 50% (max 20 mg/day). Risk of QTc prolongation at higher levels.",
        "CYP2C19 poor metabolizers have significantly elevated citalopram plasma concentrations, increasing QTc prolongation risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-selective-serotonin-reuptake-inhibitors-and-cyp2d6-and-cyp2c19/"),

    # ── HLA-B / Carbamazepine (Antiepileptic) ─────────────────────────
    DrugGeneInteraction("carbamazepine", "HLA-B", HLA_POSITIVE, TOXIC,
        "AVOID carbamazepine. HLA-B*15:02 positive — HIGH RISK of Stevens-Johnson Syndrome (SJS) and Toxic Epidermal Necrolysis (TEN). Use alternative antiepileptic.",
        "HLA-B*15:02 carriers have ~100× increased risk of carbamazepine-induced SJS/TEN, a potentially fatal skin reaction. Prevalence is 6-8% in Indian populations.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),
    DrugGeneInteraction("carbamazepine", "HLA-B", HLA_NEGATIVE, SAFE,
        "Use carbamazepine per standard dosing. HLA-B*15:02 negative — normal SJS risk.",
        "Absence of HLA-B*15:02 allele indicates standard risk for carbamazepine-induced SJS/TEN.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),

    # ── HLA-A / Carbamazepine (Antiepileptic — co-gene) ────────────────
    DrugGeneInteraction("carbamazepine", "HLA-A", HLA_POSITIVE, TOXIC,
        "AVOID carbamazepine. HLA-A*31:01 positive — increased risk of DRESS syndrome and maculopapular exanthema. Use alternative antiepileptic.",
        "HLA-A*31:01 carriers have ~9× increased risk of carbamazepine-induced DRESS syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),
    DrugGeneInteraction("carbamazepine", "HLA-A", HLA_NEGATIVE, SAFE,
        "HLA-A*31:01 negative — standard risk for carbamazepine hypersensitivity.",
        "Absence of HLA-A*31:01 indicates standard risk for carbamazepine-induced DRESS.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),

    # ── HLA-B / Oxcarbazepine (Antiepileptic) ─────────────────────────
    DrugGeneInteraction("oxcarbazepine", "HLA-B", HLA_POSITIVE, TOXIC,
        "AVOID oxcarbazepine. HLA-B*15:02 positive — risk of SJS/TEN (cross-reactivity with carbamazepine). Use alternative antiepileptic.",
        "HLA-B*15:02 carriers have increased SJS/TEN risk with oxcarbazepine due to structural similarity to carbamazepine.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),
    DrugGeneInteraction("oxcarbazepine", "HLA-B", HLA_NEGATIVE, SAFE,
        "Use oxcarbazepine per standard dosing. HLA-B*15:02 negative — normal risk.",
        "Absence of HLA-B*15:02 indicates standard risk for oxcarbazepine-induced SJS/TEN.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-carbamazepine-and-hla-b/"),

    # ── CYP2C9 / Lamotrigine (Antiepileptic) ──────────────────────────
    DrugGeneInteraction("lamotrigine", "CYP2C9", EXTENSIVE, SAFE,
        "Use lamotrigine per standard dosing with standard titration schedule.",
        "Normal metabolism provides expected lamotrigine clearance via glucuronidation (CYP2C9 is a minor pathway).",
        "C", ""),
    DrugGeneInteraction("lamotrigine", "CYP2C9", INTERMEDIATE, SAFE,
        "Use lamotrigine per standard dosing. CYP2C9 is a minor metabolic pathway for lamotrigine.",
        "Reduced CYP2C9 activity has minimal clinical impact on lamotrigine clearance.",
        "C", ""),
    DrugGeneInteraction("lamotrigine", "CYP2C9", POOR, ADJUST,
        "Consider slower titration and lower maintenance dose. Monitor for rash.",
        "CYP2C9 poor metabolizers may have modestly elevated lamotrigine levels, slightly increasing rash risk during titration.",
        "C", ""),

    # ── UGT1A1 / Irinotecan (Oncology) ─────────────────────────────────
    DrugGeneInteraction("irinotecan", "UGT1A1", EXTENSIVE, SAFE,
        "Use irinotecan per standard dosing.",
        "Normal UGT1A1 activity provides expected glucuronidation of SN-38 (active metabolite).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-irinotecan-and-ugt1a1/"),
    DrugGeneInteraction("irinotecan", "UGT1A1", INTERMEDIATE, ADJUST,
        "Consider reducing initial dose by 25-30%. Monitor closely for neutropenia and diarrhea.",
        "Intermediate UGT1A1 activity (e.g., *1/*28) reduces SN-38 glucuronidation, increasing toxicity risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-irinotecan-and-ugt1a1/"),
    DrugGeneInteraction("irinotecan", "UGT1A1", POOR, TOXIC,
        "Reduce initial dose by 50% or more. High risk of severe/fatal neutropenia and diarrhea. Mandatory CBC monitoring.",
        "UGT1A1 poor function (*28/*28 or *6/*6) causes dangerous SN-38 accumulation, with significantly increased risk of severe neutropenia (grade ≥3) and diarrhea.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-irinotecan-and-ugt1a1/"),

    # ── CYP2C8 / Paclitaxel (Oncology) ─────────────────────────────────
    DrugGeneInteraction("paclitaxel", "CYP2C8", EXTENSIVE, SAFE,
        "Use paclitaxel per standard dosing.",
        "Normal CYP2C8 metabolism provides expected paclitaxel clearance.",
        "B", ""),
    DrugGeneInteraction("paclitaxel", "CYP2C8", INTERMEDIATE, ADJUST,
        "Consider dose reduction or enhanced monitoring for neuropathy.",
        "Reduced CYP2C8 activity leads to higher paclitaxel exposure, increasing peripheral neuropathy risk.",
        "B", ""),
    DrugGeneInteraction("paclitaxel", "CYP2C8", POOR, TOXIC,
        "Reduce dose by 25-50%. Monitor closely for severe neuropathy and myelosuppression.",
        "CYP2C8 poor metabolizers have significantly elevated paclitaxel exposure, increasing risk of dose-limiting peripheral neuropathy.",
        "B", ""),

    # ── CYP3A5 / Tacrolimus (Transplant) 🇮🇳 ──────────────────────────
    DrugGeneInteraction("tacrolimus", "CYP3A5", CYP3A5_EXPRESSER, ADJUST,
        "INCREASE starting dose to 0.3 mg/kg/day (1.5-2× standard). Monitor trough levels closely — target 10-15 ng/mL initially.",
        "CYP3A5 expressers (*1/*1 or *1/*3) metabolize tacrolimus rapidly, requiring higher doses to achieve therapeutic trough levels. ~30% of Indians are expressers.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),
    DrugGeneInteraction("tacrolimus", "CYP3A5", CYP3A5_INTERMEDIATE, ADJUST,
        "Use standard starting dose (0.2 mg/kg/day). Monitor trough levels — may need upward adjustment.",
        "CYP3A5 intermediate expressers (*1/*3) have moderately increased tacrolimus clearance.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),
    DrugGeneInteraction("tacrolimus", "CYP3A5", CYP3A5_NON_EXPRESSER, SAFE,
        "Use standard starting dose (0.15-0.2 mg/kg/day). Standard trough level monitoring.",
        "CYP3A5 non-expressers (*3/*3) have reduced tacrolimus clearance, achieving therapeutic levels at standard doses. ~70% of Indians are non-expressers.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),

    # ── CYP2B6 / Efavirenz (HIV) ───────────────────────────────────────
    DrugGeneInteraction("efavirenz", "CYP2B6", ULTRA_RAPID, INEFFECTIVE,
        "Consider higher dose or alternative antiretroviral. Monitor viral load closely.",
        "Ultra-rapid CYP2B6 metabolism may result in subtherapeutic efavirenz levels.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-efavirenz-and-cyp2b6/"),
    DrugGeneInteraction("efavirenz", "CYP2B6", EXTENSIVE, SAFE,
        "Use efavirenz per standard dosing (600 mg/day).",
        "Normal CYP2B6 metabolism provides expected efavirenz pharmacokinetics.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-efavirenz-and-cyp2b6/"),
    DrugGeneInteraction("efavirenz", "CYP2B6", INTERMEDIATE, ADJUST,
        "Consider dose reduction to 400 mg/day. Monitor for CNS side effects.",
        "Intermediate CYP2B6 metabolism (*1/*6) results in higher efavirenz exposure, increasing CNS toxicity risk (vivid dreams, dizziness, depression).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-efavirenz-and-cyp2b6/"),
    DrugGeneInteraction("efavirenz", "CYP2B6", POOR, TOXIC,
        "Reduce dose to 200-400 mg/day or use alternative antiretroviral (dolutegravir). High risk of CNS toxicity.",
        "CYP2B6 poor metabolizers (*6/*6) have 3-4× higher efavirenz plasma levels, causing severe CNS toxicity, suicidality risk, and hepatotoxicity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-efavirenz-and-cyp2b6/"),

    # ── UGT1A1 / Atazanavir (HIV) ──────────────────────────────────────
    DrugGeneInteraction("atazanavir", "UGT1A1", EXTENSIVE, SAFE,
        "Use atazanavir per standard dosing (300 mg + ritonavir 100 mg daily).",
        "Normal UGT1A1 activity provides expected bilirubin conjugation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-atazanavir-and-ugt1a1/"),
    DrugGeneInteraction("atazanavir", "UGT1A1", INTERMEDIATE, ADJUST,
        "Use atazanavir with monitoring. Warn patient about jaundice risk. Consider alternative if cosmetically unacceptable.",
        "Intermediate UGT1A1 function increases risk of atazanavir-induced unconjugated hyperbilirubinemia (jaundice).",
        "A", "https://cpicpgx.org/guidelines/guideline-for-atazanavir-and-ugt1a1/"),
    DrugGeneInteraction("atazanavir", "UGT1A1", POOR, TOXIC,
        "Consider alternative antiretroviral. HIGH risk of severe jaundice and treatment discontinuation.",
        "UGT1A1 poor function (*28/*28) causes severe unconjugated hyperbilirubinemia with atazanavir, leading to jaundice in >60% and frequent treatment discontinuation.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-atazanavir-and-ugt1a1/"),

    # ── HLA-B / Allopurinol (Anti-gout) 🇮🇳 ───────────────────────────
    DrugGeneInteraction("allopurinol", "HLA-B", HLA_POSITIVE, TOXIC,
        "AVOID allopurinol. HLA-B*58:01 positive — HIGH RISK of Severe Cutaneous Adverse Reactions (SCAR). Use febuxostat as alternative.",
        "HLA-B*58:01 carriers have ~80-100× increased risk of allopurinol-induced SCAR (SJS/TEN/DRESS). Prevalence is 6-10% in Indian populations.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-allopurinol-and-hla-b/"),
    DrugGeneInteraction("allopurinol", "HLA-B", HLA_NEGATIVE, SAFE,
        "Use allopurinol per standard dosing. HLA-B*58:01 negative — normal risk.",
        "Absence of HLA-B*58:01 allele indicates standard risk for allopurinol-induced SCAR.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-allopurinol-and-hla-b/"),

    # ── G6PD / Primaquine (Antimalarial) 🇮🇳 ──────────────────────────
    DrugGeneInteraction("primaquine", "G6PD", G6PD_NORMAL, SAFE,
        "Use primaquine per standard dosing for P. vivax radical cure (0.25-0.5 mg/kg/day × 14 days).",
        "Normal G6PD enzyme activity allows safe primaquine use without hemolysis risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),
    DrugGeneInteraction("primaquine", "G6PD", G6PD_INTERMEDIATE, ADJUST,
        "Use primaquine at reduced dose (0.75 mg/kg weekly × 8 weeks). Monitor for hemolysis (hemoglobin, reticulocyte count).",
        "G6PD intermediate (heterozygous females) may have partial enzyme deficiency, with moderate hemolysis risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),
    DrugGeneInteraction("primaquine", "G6PD", G6PD_DEFICIENT, TOXIC,
        "AVOID primaquine. HIGH RISK of severe hemolytic anemia. Use tafenoquine alternative only if G6PD >70%, otherwise chloroquine prophylaxis only.",
        "G6PD-deficient patients develop acute hemolytic anemia with primaquine, potentially fatal. Mediterranean and Kerala-Kalyan variants (common in India) have <10% enzyme activity — most severe risk.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),

    # ── G6PD / Rasburicase (Misc) ──────────────────────────────────────
    DrugGeneInteraction("rasburicase", "G6PD", G6PD_NORMAL, SAFE,
        "Use rasburicase per standard dosing for tumor lysis syndrome.",
        "Normal G6PD activity allows safe rasburicase use.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),
    DrugGeneInteraction("rasburicase", "G6PD", G6PD_INTERMEDIATE, TOXIC,
        "AVOID rasburicase. Use alternative urate-lowering therapy (allopurinol/febuxostat).",
        "Even partial G6PD deficiency poses risk of severe hemolysis with rasburicase-generated hydrogen peroxide.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),
    DrugGeneInteraction("rasburicase", "G6PD", G6PD_DEFICIENT, TOXIC,
        "CONTRAINDICATED. NEVER use rasburicase in G6PD-deficient patients. Use allopurinol for tumor lysis syndrome.",
        "Rasburicase generates hydrogen peroxide which G6PD-deficient RBCs cannot detoxify, causing severe/fatal methemoglobinemia and hemolytic anemia.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-rasburicase-and-g6pd/"),

    # ── CYP1A2 / Clozapine (Psychiatry) ────────────────────────────────
    DrugGeneInteraction("clozapine", "CYP1A2", ULTRA_RAPID, INEFFECTIVE,
        "Consider higher dose with therapeutic drug monitoring. Target trough 350-600 ng/mL.",
        "Ultra-rapid CYP1A2 metabolism (induced by smoking + *1F/*1F) may result in subtherapeutic clozapine levels.",
        "B", ""),
    DrugGeneInteraction("clozapine", "CYP1A2", EXTENSIVE, SAFE,
        "Use clozapine per standard dosing. Monitor trough levels.",
        "Normal CYP1A2 activity provides expected clozapine metabolism.",
        "B", ""),
    DrugGeneInteraction("clozapine", "CYP1A2", INTERMEDIATE, SAFE,
        "Use clozapine per standard dosing.",
        "Intermediate CYP1A2 activity has modest clinical impact on clozapine levels.",
        "B", ""),
    DrugGeneInteraction("clozapine", "CYP1A2", POOR, TOXIC,
        "Reduce dose by 50%. Monitor closely for agranulocytosis, seizures, and metabolic effects. Mandatory TDM.",
        "CYP1A2 poor metabolizers have significantly elevated clozapine levels, increasing risk of seizures, sedation, and potentially fatal agranulocytosis.",
        "B", ""),

    # ── CYP1A2 / Theophylline (Respiratory) ────────────────────────────
    DrugGeneInteraction("theophylline", "CYP1A2", ULTRA_RAPID, INEFFECTIVE,
        "Consider higher dose with therapeutic drug monitoring. Target 10-20 mcg/mL.",
        "Ultra-rapid CYP1A2 metabolism clears theophylline rapidly, potentially resulting in subtherapeutic levels.",
        "B", ""),
    DrugGeneInteraction("theophylline", "CYP1A2", EXTENSIVE, SAFE,
        "Use theophylline per standard dosing with TDM.",
        "Normal CYP1A2 function provides expected theophylline metabolism.",
        "B", ""),
    DrugGeneInteraction("theophylline", "CYP1A2", INTERMEDIATE, SAFE,
        "Use theophylline per standard dosing.",
        "Intermediate CYP1A2 activity has modest impact on theophylline levels.",
        "B", ""),
    DrugGeneInteraction("theophylline", "CYP1A2", POOR, TOXIC,
        "Reduce dose by 50%. Narrow therapeutic window — HIGH risk of toxicity. Mandatory TDM.",
        "CYP1A2 poor metabolizers have markedly elevated theophylline levels, risking seizures, cardiac arrhythmias, and death.",
        "B", ""),

    # ── IFNL3 / Ribavirin (Hepatitis) ──────────────────────────────────
    DrugGeneInteraction("ribavirin", "IFNL3", IFNL3_FAVORABLE, SAFE,
        "Use PEG-IFN + ribavirin per standard protocol. Favorable response expected (SVR ~70-80%).",
        "IFNL3 rs12979860 CC genotype predicts high sustained virological response (SVR) to PEG-IFN/ribavirin in Hepatitis C.",
        "A", ""),
    DrugGeneInteraction("ribavirin", "IFNL3", IFNL3_UNFAVORABLE, ADJUST,
        "Consider DAA-based therapy (sofosbuvir-based) instead of PEG-IFN/ribavirin. Lower SVR expected with IFN-based regimens.",
        "IFNL3 rs12979860 TT genotype predicts poor response to PEG-IFN/ribavirin (SVR ~30-40%). DAA regimens are preferred.",
        "A", ""),

    # ── NUDT15 / Azathioprine (Immunosuppressant — co-gene with TPMT) ──
    DrugGeneInteraction("azathioprine", "NUDT15", EXTENSIVE, SAFE,
        "NUDT15 normal — use azathioprine per TPMT-guided dosing.",
        "Normal NUDT15 function provides expected thiopurine nucleotide metabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("azathioprine", "NUDT15", INTERMEDIATE, ADJUST,
        "Reduce azathioprine dose to 25-50% of standard regardless of TPMT status. Monitor CBC weekly.",
        "NUDT15 intermediate function increases thioguanine nucleotide accumulation, causing myelosuppression even with normal TPMT.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("azathioprine", "NUDT15", POOR, TOXIC,
        "AVOID azathioprine or use 10% of standard dose. NUDT15-deficient — extremely high myelotoxicity risk.",
        "NUDT15 poor function causes severe/fatal myelosuppression with standard thiopurine doses. Higher prevalence of risk alleles in South Asian populations.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),

    # ── NUDT15 / Mercaptopurine (co-gene with TPMT) ───────────────────
    DrugGeneInteraction("mercaptopurine", "NUDT15", EXTENSIVE, SAFE,
        "NUDT15 normal — use mercaptopurine per TPMT-guided dosing.",
        "Normal NUDT15 function provides expected thiopurine metabolism.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("mercaptopurine", "NUDT15", INTERMEDIATE, ADJUST,
        "Reduce mercaptopurine dose to 25-50% regardless of TPMT status. Monitor CBC weekly.",
        "NUDT15 intermediate function increases myelosuppression risk with mercaptopurine.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),
    DrugGeneInteraction("mercaptopurine", "NUDT15", POOR, TOXIC,
        "AVOID mercaptopurine or use 10% of standard dose. Extremely high myelotoxicity risk.",
        "NUDT15 deficiency causes life-threatening myelosuppression with standard mercaptopurine doses.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt-and-nudt15/"),

    # ── UGT1A1 / Mycophenolate (Immunosuppressant) ────────────────────
    DrugGeneInteraction("mycophenolate", "UGT1A1", EXTENSIVE, SAFE,
        "Use mycophenolate per standard dosing.",
        "Normal UGT1A1 glucuronidation provides expected mycophenolic acid clearance.",
        "C", ""),
    DrugGeneInteraction("mycophenolate", "UGT1A1", INTERMEDIATE, SAFE,
        "Use mycophenolate per standard dosing. Minor increase in exposure.",
        "Intermediate UGT1A1 activity has modest impact on mycophenolic acid glucuronidation.",
        "C", ""),
    DrugGeneInteraction("mycophenolate", "UGT1A1", POOR, ADJUST,
        "Consider dose reduction. Monitor for GI toxicity (diarrhea, nausea).",
        "UGT1A1 poor function may increase mycophenolic acid exposure, increasing GI adverse effects.",
        "C", ""),

    # ── VKORC1 / Warfarin (co-gene with CYP2C9) ──────────────────────
    DrugGeneInteraction("warfarin", "VKORC1", VKORC1_HIGH_SENSITIVITY, TOXIC,
        "Reduce warfarin dose by 50-75%. VKORC1 -1639 AA — high sensitivity. Use pharmacogenomic dosing algorithm.",
        "VKORC1 -1639G>A homozygous (AA) individuals have reduced VKORC1 expression, requiring substantially lower warfarin doses to achieve therapeutic INR.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"),
    DrugGeneInteraction("warfarin", "VKORC1", VKORC1_NORMAL_SENSITIVITY, SAFE,
        "Use standard warfarin dosing algorithm with INR monitoring.",
        "VKORC1 -1639 GG — normal VKORC1 expression and standard warfarin sensitivity.",
        "A", "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/"),

    # ── CYP3A4 / Tacrolimus (co-gene with CYP3A5) ────────────────────
    DrugGeneInteraction("tacrolimus", "CYP3A4", EXTENSIVE, SAFE,
        "CYP3A4 normal — dose per CYP3A5-guided recommendation.",
        "Normal CYP3A4 activity; tacrolimus dosing primarily guided by CYP3A5 genotype.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),
    DrugGeneInteraction("tacrolimus", "CYP3A4", INTERMEDIATE, ADJUST,
        "CYP3A4*22 carrier — may need 15-30% dose reduction in addition to CYP3A5-guided dosing. Monitor trough levels.",
        "CYP3A4*22 reduces tacrolimus metabolism, potentially requiring lower doses especially when combined with CYP3A5 non-expresser status.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),
    DrugGeneInteraction("tacrolimus", "CYP3A4", POOR, ADJUST,
        "Significant CYP3A4 impairment — reduce dose and monitor trough levels closely.",
        "CYP3A4 poor function leads to reduced tacrolimus clearance, requiring dose reduction.",
        "B", "https://cpicpgx.org/guidelines/guideline-for-tacrolimus-and-cyp3a5/"),
]

# Build fast lookup:  (drug_lower, gene_upper, phenotype) → interaction
_INTERACTION_INDEX: Dict[Tuple[str, str, str], DrugGeneInteraction] = {}
for _ix in _INTERACTIONS:
    _key = (_ix.drug.lower(), _ix.gene.upper(), _ix.phenotype)
    _INTERACTION_INDEX[_key] = _ix

# All drug names in the knowledge base
KNOWN_DRUGS = sorted({ix.drug for ix in _INTERACTIONS})

# All gene names in the knowledge base
KNOWN_GENES = sorted({ix.gene for ix in _INTERACTIONS})

# Drug → list of relevant genes
DRUG_GENES: Dict[str, List[str]] = {}
for _ix in _INTERACTIONS:
    DRUG_GENES.setdefault(_ix.drug.lower(), [])
    if _ix.gene not in DRUG_GENES[_ix.drug.lower()]:
        DRUG_GENES[_ix.drug.lower()].append(_ix.gene)


def lookup_interaction(drug: str, gene: str, phenotype: str) -> Optional[DrugGeneInteraction]:
    """Look up a drug–gene interaction by drug name, gene, and metabolizer phenotype."""
    return _INTERACTION_INDEX.get((drug.lower(), gene.upper(), phenotype))


def get_genes_for_drug(drug: str) -> List[str]:
    """Return the gene(s) relevant to a drug."""
    return DRUG_GENES.get(drug.lower(), [])


def get_all_drugs() -> List[str]:
    """Return all supported drug names."""
    return KNOWN_DRUGS

# ---------------------------------------------------------------------------
# Coordinate to Gene / rsID Mapping for Unannotated VCFs
# ---------------------------------------------------------------------------
RSID_GRCH38 = {
    "rs4244285":   ("chr10", 94781859),
    "rs4986893":   ("chr10", 94780653),
    "rs12248560":  ("chr10", 94761900),
    "rs1799853":   ("chr10", 94942290),
    "rs1057910":   ("chr10", 94981297),
    "rs4149056":   ("chr12", 21178615),
    "rs1800462":   ("chr6",  18130918),
    "rs1800460":   ("chr6",  18130687),
    "rs1142345":   ("chr6",  18130348),
    "rs3918290":   ("chr1",  97515839),
    "rs55886062":  ("chr1",  97573943),
    "rs67376798":  ("chr1",  97547947),
    "rs776746":    ("chr7",  99672916),
    "rs10264272":  ("chr7",  99652770),
    "rs41303343":  ("chr7",  99648390),
    "rs35599367":  ("chr7",  99768693),
    "rs3745274":   ("chr19", 41006936),
    "rs2279343":   ("chr19", 41009358),
    "rs28399499":  ("chr19", 41010006),
    "rs762551":    ("chr15", 74749576),
    "rs2069514":   ("chr15", 74752837),
    "rs4148323":   ("chr2",  233760498),
    "rs8175347":   ("chr2",  233760233),
    "rs116855232": ("chr13", 48037825),
    "rs186364861": ("chr13", 48037885),
    "rs11572103":  ("chr10", 95038992),
    "rs10509681":  ("chr10", 95058012),
    "rs1058930":   ("chr10", 95060344),
    "rs1801280":   ("chr8",  18257854),
    "rs1799930":   ("chr8",  18258103),
    "rs1799931":   ("chr8",  18258370),
    "rs1041983":   ("chr8",  18257795),
    "rs1208":      ("chr8",  18258316),
    "rs9923231":   ("chr16", 31096368),
    "rs3909184":   ("chr6",  31272735),
    "rs2395029":   ("chr6",  31271836),
    "rs9263726":   ("chr6",  31277801),
    "rs1061235":   ("chr6",  29944050),
    "rs2231142":   ("chr4",  88131171),
    "rs12979860":  ("chr19", 39248147),
    "rs1050828":   ("chrX",  154535277),
    "rs5030868":   ("chrX",  154536002),
    "rs137852328": ("chrX",  154535623),
    # CYP2D6 key defining variants (GRCh38 coordinates on chr22)
    "rs3892097":   ("chr22", 42128945),
    "rs1065852":   ("chr22", 42130692),
    "rs16947":     ("chr22", 42126611),
    "rs1135840":   ("chr22", 42126938),
    "rs28371725":  ("chr22", 42127941),
    "rs5030655":   ("chr22", 42127803),
    "rs59421388":  ("chr22", 42126763),
    "rs28371706":  ("chr22", 42129132),
}

GENE_FOR_RSID = {
    "rs4244285": "CYP2C19", "rs4986893": "CYP2C19", "rs12248560": "CYP2C19",
    "rs1799853": "CYP2C9", "rs1057910": "CYP2C9",
    "rs3892097": "CYP2D6", "rs1065852": "CYP2D6", "rs16947": "CYP2D6",
    "rs1135840": "CYP2D6", "rs28371725": "CYP2D6", "rs5030655": "CYP2D6",
    "rs59421388": "CYP2D6", "rs28371706": "CYP2D6",
    "rs4149056": "SLCO1B1",
    "rs1800462": "TPMT", "rs1800460": "TPMT", "rs1142345": "TPMT",
    "rs3918290": "DPYD", "rs55886062": "DPYD", "rs67376798": "DPYD",
    "rs776746": "CYP3A5", "rs10264272": "CYP3A5", "rs41303343": "CYP3A5",
    "rs35599367": "CYP3A4",
    "rs3745274": "CYP2B6", "rs2279343": "CYP2B6", "rs28399499": "CYP2B6",
    "rs762551": "CYP1A2", "rs2069514": "CYP1A2",
    "rs4148323": "UGT1A1", "rs8175347": "UGT1A1",
    "rs116855232": "NUDT15", "rs186364861": "NUDT15",
    "rs11572103": "CYP2C8", "rs10509681": "CYP2C8", "rs1058930": "CYP2C8",
    "rs1801280": "NAT2", "rs1799930": "NAT2", "rs1799931": "NAT2", "rs1041983": "NAT2", "rs1208": "NAT2",
    "rs9923231": "VKORC1",
    "rs3909184": "HLA-B", "rs2395029": "HLA-B", "rs9263726": "HLA-B",
    "rs1061235": "HLA-A",
    "rs2231142": "ABCG2",
    "rs12979860": "IFNL3",
    "rs1050828": "G6PD", "rs5030868": "G6PD", "rs137852328": "G6PD",
}

CHROM_POS_MAP = {
    v: (GENE_FOR_RSID[k], k) for k, v in RSID_GRCH38.items()
}

