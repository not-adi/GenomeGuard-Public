"""
Pharmacogenomic Analysis Engine
================================
Takes parsed VCF data + a list of drugs and produces risk assessments,
dosing recommendations, and clinical explanations.

"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from parser import VCFFile, Variant
from pgx_knowledgebase import (
    ALLELE_FUNCTION,
    KNOWN_GENES,
    RSID_TO_ALLELE,
    SAFE,
    ADJUST,
    TOXIC,
    INEFFECTIVE,
    UNKNOWN,
    INDETERMINATE,
    DrugGeneInteraction,
    build_diplotype,
    get_genes_for_drug,
    infer_phenotype,
    lookup_interaction,
    RSID_GRCH38,
    GENE_FOR_RSID,
    # Non-metabolizer phenotype constants
    RAPID_ACETYLATOR, INTERMEDIATE_ACETYLATOR, SLOW_ACETYLATOR,
    VKORC1_HIGH_SENSITIVITY, VKORC1_NORMAL_SENSITIVITY,
    HLA_POSITIVE, HLA_NEGATIVE,
    G6PD_DEFICIENT, G6PD_NORMAL, G6PD_INTERMEDIATE,
    ABCG2_POOR_FUNCTION, ABCG2_DECREASED_FUNCTION, ABCG2_NORMAL_FUNCTION,
    IFNL3_FAVORABLE, IFNL3_UNFAVORABLE,
    CYP3A5_EXPRESSER, CYP3A5_INTERMEDIATE, CYP3A5_NON_EXPRESSER,
)

# ---------------------------------------------------------------------------
# Data structures for analysis results
# ---------------------------------------------------------------------------

@dataclass
class DetectedVariant:
    gene: str
    star_allele: str
    rsid: str
    chrom: str
    pos: int
    ref: str
    alt: List[str]
    genotype: str
    is_variant: bool
    function: str            # "normal" / "decreased" / "no_function"

    def to_dict(self) -> dict:
        return {
            "gene": self.gene,
            "starAllele": self.star_allele,
            "rsid": self.rsid,
            "chrom": self.chrom,
            "pos": self.pos,
            "ref": self.ref,
            "alt": self.alt,
            "genotype": self.genotype,
            "isVariant": self.is_variant,
            "function": self.function,
        }


@dataclass
class GenePhenotype:
    gene: str
    phenotype: str
    detected_alleles: List[DetectedVariant]
    activity_score_description: str = ""

    def to_dict(self) -> dict:
        return {
            "gene": self.gene,
            "phenotype": self.phenotype,
            "activityScoreDescription": self.activity_score_description,
            "detectedAlleles": [a.to_dict() for a in self.detected_alleles],
        }


def _severity_from_risk(risk: str) -> str:
    """Map risk label to severity level."""
    return {
        SAFE: "none",
        ADJUST: "moderate",
        TOXIC: "critical",
        INEFFECTIVE: "high",
        UNKNOWN: "low",
    }.get(risk, "low")


def _confidence_from_cpic(cpic_level: str, risk: str) -> float:
    """Derive a confidence score from CPIC evidence level."""
    base = {"A": 0.95, "B": 0.80, "C": 0.60, "D": 0.40}.get(cpic_level, 0.50)
    if risk == UNKNOWN:
        return round(base * 0.5, 2)
    return base


@dataclass
class DrugResult:
    drug: str
    risk: str                      # Safe / Adjust Dosage / Toxic / Ineffective / Unknown
    gene: str
    phenotype: str
    recommendation: str
    mechanism: str
    clinical_explanation: str      # LLM-generated or template
    cpic_level: str = ""
    guidelines_url: str = ""
    variants_cited: List[DetectedVariant] = field(default_factory=list)
    diplotype: str = ""           # e.g. "*1/*4"

    def to_dict(self) -> dict:
        """Legacy compact format — kept for backward compat."""
        return {
            "drug": self.drug,
            "risk": self.risk,
            "gene": self.gene,
            "phenotype": self.phenotype,
            "recommendation": self.recommendation,
            "mechanism": self.mechanism,
            "clinicalExplanation": self.clinical_explanation,
            "cpicLevel": self.cpic_level,
            "guidelinesUrl": self.guidelines_url,
            "variantsCited": [v.to_dict() for v in self.variants_cited],
        }

    def to_structured_dict(self, patient_id: str, timestamp: str) -> dict:
        """
        Full structured output matching the required JSON schema.
        """
        severity = _severity_from_risk(self.risk)
        confidence = _confidence_from_cpic(self.cpic_level, self.risk)

        # Phenotype abbreviation
        pheno_abbr = {
            "Ultra-rapid Metabolizer": "URM",
            "Rapid Metabolizer": "RM",
            "Normal Metabolizer": "NM",
            "Intermediate Metabolizer": "IM",
            "Poor Metabolizer": "PM",
            "Indeterminate": "Unknown",
            "Normal Function": "NM",
            "Increased Function": "URM",
            "Decreased Function": "IM",
            "Poor Function": "PM",
            "Possible Decreased Function": "IM",
            # Non-metabolizer phenotypes
            RAPID_ACETYLATOR: "Rapid",
            INTERMEDIATE_ACETYLATOR: "Intermediate",
            SLOW_ACETYLATOR: "Slow",
            VKORC1_HIGH_SENSITIVITY: "High",
            VKORC1_NORMAL_SENSITIVITY: "Normal",
            HLA_POSITIVE: "Positive",
            HLA_NEGATIVE: "Negative",
            G6PD_DEFICIENT: "Deficient",
            G6PD_NORMAL: "Normal",
            G6PD_INTERMEDIATE: "Intermediate",
            ABCG2_POOR_FUNCTION: "PM",
            ABCG2_DECREASED_FUNCTION: "IM",
            ABCG2_NORMAL_FUNCTION: "NM",
            IFNL3_FAVORABLE: "Favorable",
            IFNL3_UNFAVORABLE: "Unfavorable",
            CYP3A5_EXPRESSER: "Expresser",
            CYP3A5_INTERMEDIATE: "Intermediate",
            CYP3A5_NON_EXPRESSER: "Non-expresser",
        }.get(self.phenotype, "Unknown")

        return {
            "patient_id": patient_id,
            "drug": self.drug,
            "timestamp": timestamp,
            "risk_assessment": {
                "risk_label": self.risk,
                "confidence_score": confidence,
                "severity": severity,
            },
            "pharmacogenomic_profile": {
                "primary_gene": self.gene,
                "diplotype": self.diplotype or "*1/*1",
                "phenotype": pheno_abbr,
                "detected_variants": [
                    {
                        "rsid": v.rsid,
                        "gene": v.gene,
                        "star_allele": v.star_allele,
                        "chrom": v.chrom,
                        "pos": v.pos,
                        "ref": v.ref,
                        "alt": v.alt,
                        "genotype": v.genotype,
                        "is_variant": v.is_variant,
                        "functional_impact": v.function,
                    }
                    for v in self.variants_cited
                ],
            },
            "clinical_recommendation": {
                "action": self.recommendation,
                "cpic_guideline_level": self.cpic_level or "N/A",
                "guidelines_url": self.guidelines_url or "",
                "alternative_drugs": [],   # can be extended
            },
            "mechanism": self.mechanism,
            "clinical_explanation": self.clinical_explanation,
        }


@dataclass
class AnalysisResult:
    patient_id: str
    genes: List[GenePhenotype]
    drug_results: List[DrugResult]
    summary: dict = field(default_factory=dict)
    _parse_time_ms: float = 0.0
    _analysis_time_ms: float = 0.0
    _vcf_variant_count: int = 0

    def to_dict(self) -> dict:
        """Structured output matching the EXACT required JSON schema."""
        timestamp = datetime.now(timezone.utc).isoformat()

        results = []
        for dr in self.drug_results:
            entry = dr.to_structured_dict(self.patient_id, timestamp)
            # Attach quality_metrics per drug entry
            entry["quality_metrics"] = {
                "vcf_parsing_success": True,
                "vcf_format_version": "VCFv4.2",
                "total_variants_in_file": self._vcf_variant_count,
                "pharmacogenomic_variants_detected": sum(
                    len(g.detected_alleles) for g in self.genes
                ),
                "genes_screened": len(self.genes),
                "parse_time_ms": round(self._parse_time_ms, 1),
                "analysis_time_ms": round(self._analysis_time_ms, 1),
            }
            results.append(entry)

        return {
            "patient_id": self.patient_id,
            "timestamp": timestamp,
            "results": results,
            "genes": [g.to_dict() for g in self.genes],
            "summary": self.summary,
        }


# ---------------------------------------------------------------------------
# Core analysis logic
# ---------------------------------------------------------------------------

def _extract_pharmacogenomic_variants(vcf: VCFFile, sample: Optional[str] = None) -> List[DetectedVariant]:
    """
    Scan every variant in the VCF and identify pharmacogenomically relevant ones.
    Uses INFO GENE/STAR tags when available, otherwise falls back to rsID lookup.
    """
    if sample is None and vcf.samples:
        sample = vcf.samples[0]

    detected: List[DetectedVariant] = []

    for v in vcf.variants:
        gene = v.gene
        star = v.star_allele
        rsid = v.rsid or ""

        # Fallback: look up by rsID if GENE/STAR not in INFO
        if (not gene or not star) and rsid:
            # Handle compound rsIDs (e.g. "rs123;chrX_456_A_G;rs123")
            for rs_part in rsid.split(";"):
                rs_part = rs_part.strip()
                if rs_part in RSID_TO_ALLELE:
                    gene, star = RSID_TO_ALLELE[rs_part]
                    break

        if not gene or gene.upper() not in [g.upper() for g in KNOWN_GENES]:
            continue

        # Get genotype for the target sample
        gt_raw = "0/0"
        is_variant = False
        if sample:
            for g in v.genotypes:
                if g.sample == sample:
                    gt_raw = g.raw
                    is_variant = g.is_variant
                    break
        elif v.genotypes:
            gt_raw = v.genotypes[0].raw
            is_variant = v.genotypes[0].is_variant

        func_map = ALLELE_FUNCTION.get(gene.upper(), {})
        func = func_map.get(star, "normal") if star else "normal"

        detected.append(DetectedVariant(
            gene=gene.upper() if gene else "",
            star_allele=star or "",
            rsid=rsid,
            chrom=v.chrom,
            pos=v.pos,
            ref=v.ref,
            alt=v.alt,
            genotype=gt_raw,
            is_variant=is_variant,
            function=func,
        ))

    return detected


def _group_by_gene(variants: List[DetectedVariant]) -> Dict[str, List[DetectedVariant]]:
    grouped: Dict[str, List[DetectedVariant]] = {}
    for v in variants:
        grouped.setdefault(v.gene, []).append(v)
    return grouped


def _build_clinical_explanation(
    drug: str,
    interaction: DrugGeneInteraction,
    phenotype: str,
    variants: List[DetectedVariant],
) -> str:
    """Build a deterministic clinical explanation with variant citations."""
    variant_citations = []
    for v in variants:
        if v.is_variant:
            variant_citations.append(
                f"{v.gene} {v.star_allele} ({v.rsid}, {v.chrom}:{v.pos} "
                f"{v.ref}>{','.join(v.alt)}, genotype {v.genotype})"
            )

    citations_text = ""
    if variant_citations:
        citations_text = "Detected variant(s): " + "; ".join(variant_citations) + ". "

    explanation = (
        f"{citations_text}"
        f"The patient is classified as a {phenotype} for {interaction.gene}. "
        f"{interaction.mechanism} "
        f"Based on CPIC guidelines (evidence level {interaction.cpic_level}): "
        f"{interaction.recommendation}"
    )
    return explanation


# ---------------------------------------------------------------------------
# Non-metabolizer gene phenotype inference
# ---------------------------------------------------------------------------

def _wildtype_function(gene: str) -> str:
    """Return the function string for the wild-type allele of a gene."""
    if gene == "NAT2":
        return "rapid"
    elif gene == "VKORC1":
        return "normal_sensitivity"
    elif gene == "IFNL3":
        return "favorable"
    return "normal"


def _infer_non_metabolizer_phenotype(gene: str, allele_info: list,
                                     has_coverage: bool = True) -> str:
    """
    Infer phenotype for genes that don't use the standard
    Poor/Intermediate/Normal/Ultra-rapid Metabolizer system.
    """
    func_map = ALLELE_FUNCTION.get(gene, {})

    if not allele_info:
        if not has_coverage:
            return INDETERMINATE  # no data at defining positions
        # Confirmed reference at defining positions — return default phenotype
        return _default_phenotype(gene)

    # Collect functional annotations for detected alleles based on genotype
    functions = []
    for a in allele_info:
        star = a.get("star_allele", "")
        gt = a.get("genotype", "0/0")
        if star:
            func = func_map.get(star, "normal")
            if gt in ("1/1", "1|1"):
                functions.extend([func, func])
            elif gt in ("0/1", "0|1", "1|0", "1/0"):
                functions.append(func)

    # Pad remaining alleles with the wild-type function for a diploid call
    wt_func = _wildtype_function(gene)
    while len(functions) < 2:
        functions.append(wt_func)

    # Truncate to 2 in case of complex genotypes
    functions = functions[:2]

    # Gene-specific phenotype mapping
    if gene == "NAT2":
        slow_count = sum(1 for f in functions if f == "slow")
        rapid_count = sum(1 for f in functions if f == "rapid")
        if slow_count >= 2:
            return SLOW_ACETYLATOR
        elif slow_count == 1 and rapid_count >= 1:
            return INTERMEDIATE_ACETYLATOR
        else:
            return RAPID_ACETYLATOR

    elif gene == "VKORC1":
        # VKORC1 alleles encode sensitivity directly
        for f in functions:
            if f == "high_sensitivity":
                return VKORC1_HIGH_SENSITIVITY
            elif f == "intermediate_sensitivity":
                return VKORC1_HIGH_SENSITIVITY  # clinical guidance treats GA as sensitive
        return VKORC1_NORMAL_SENSITIVITY

    elif gene in ("HLA-B", "HLA-A"):
        # Any risk allele detected = positive
        if any(f == "risk" for f in functions):
            return HLA_POSITIVE
        return HLA_NEGATIVE

    elif gene == "G6PD":
        if any(f == "deficient" for f in functions):
            return G6PD_DEFICIENT
        return G6PD_NORMAL

    elif gene == "ABCG2":
        if any(f == "poor" for f in functions):
            return ABCG2_POOR_FUNCTION
        elif any(f == "decreased" for f in functions):
            return ABCG2_DECREASED_FUNCTION
        return ABCG2_NORMAL_FUNCTION

    elif gene == "IFNL3":
        if any(f == "unfavorable" for f in functions):
            return IFNL3_UNFAVORABLE
        elif any(f == "favorable" for f in functions):
            return IFNL3_FAVORABLE
        return IFNL3_UNFAVORABLE  # intermediate treated as unfavorable clinically

    elif gene == "CYP3A5":
        if any(f == "normal" for f in functions):
            # At least one *1 allele — expresser
            no_func_count = sum(1 for f in functions if f == "no_function")
            if no_func_count >= 1:
                return CYP3A5_INTERMEDIATE
            return CYP3A5_EXPRESSER
        return CYP3A5_NON_EXPRESSER

    # Fallback: use standard metabolizer inference
    return infer_phenotype(gene, allele_info)


def _default_phenotype(gene: str) -> str:
    """Return the default (no-variant-detected) phenotype for a gene."""
    defaults = {
        "NAT2": RAPID_ACETYLATOR,
        "VKORC1": VKORC1_NORMAL_SENSITIVITY,
        "HLA-B": HLA_NEGATIVE,
        "HLA-A": HLA_NEGATIVE,
        "G6PD": G6PD_NORMAL,
        "ABCG2": ABCG2_NORMAL_FUNCTION,
        "IFNL3": IFNL3_FAVORABLE,
        "CYP3A5": CYP3A5_EXPRESSER,  # confirmed *1/*1 reference = Normal Metabolizer
    }
    return defaults.get(gene, "Normal Metabolizer")


def _default_activity_desc(gene: str) -> str:
    """Return a descriptive string when no variants are detected for non-metabolizer genes."""
    descs = {
        "NAT2": "No NAT2 slow-acetylator variants detected — assumed rapid acetylator",
        "VKORC1": "No VKORC1 sensitivity variants detected — assumed normal sensitivity",
        "HLA-B": "No HLA-B risk alleles detected (*15:02, *58:01, *57:01 negative)",
        "HLA-A": "No HLA-A risk alleles detected (*31:01 negative)",
        "G6PD": "No G6PD deficiency variants detected — assumed normal enzyme activity",
        "ABCG2": "No ABCG2 transport variants detected — assumed normal function",
        "IFNL3": "No IFNL3 response variants detected — assumed favorable response",
        "CYP3A5": "No CYP3A5 expresser variants detected — assumed non-expresser (*3/*3)",
    }
    return descs.get(gene, f"No actionable {gene} variants detected")


# ---------------------------------------------------------------------------
# Main analysis function
# ---------------------------------------------------------------------------

def analyze(vcf: VCFFile, drugs: List[str], sample: Optional[str] = None) -> AnalysisResult:
    """
    Run pharmacogenomic analysis.

    Parameters
    ----------
    vcf : VCFFile
        Parsed VCF data.
    drugs : list[str]
        Drug names to assess (e.g. ["codeine", "warfarin", "simvastatin"]).
    sample : str, optional
        Sample/patient ID to analyze. Defaults to first sample in VCF.

    Returns
    -------
    AnalysisResult
        Complete analysis with gene phenotypes, drug risks, and explanations.
    """
    t_analysis_start = time.perf_counter()
    patient_id = sample or (vcf.samples[0] if vcf.samples else "UNKNOWN")

    # Step 1: Extract all pharmacogenomic variants
    all_variants = _extract_pharmacogenomic_variants(vcf, sample)
    gene_variants = _group_by_gene(all_variants)

    # Step 2: Infer phenotype for each gene
    gene_phenotypes: List[GenePhenotype] = []
    phenotype_map: Dict[str, str] = {}

    # Genes that use non-metabolizer phenotype systems
    _NON_METABOLIZER_GENES = {
        "NAT2", "VKORC1", "HLA-B", "HLA-A", "G6PD", "ABCG2", "IFNL3", "CYP3A5",
    }

    # Build a set of (chrom, pos) pairs present in this VCF for coverage detection
    vcf_positions = set()
    vcf_rsids = set()
    for v in vcf.variants:
        chrom_norm = v.chrom if v.chrom.startswith('chr') else f'chr{v.chrom}'
        vcf_positions.add((chrom_norm, v.pos))
        if v.rsid:
            for rs_part in v.rsid.split(";"):
                rs_part = rs_part.strip()
                if rs_part.startswith("rs"):
                    vcf_rsids.add(rs_part)

    # Build per-gene expected positions from RSID_GRCH38
    gene_expected_positions: Dict[str, set] = {}
    for rsid, (chrom, pos) in RSID_GRCH38.items():
        g = GENE_FOR_RSID.get(rsid)
        if g:
            gene_expected_positions.setdefault(g, set()).add((chrom, pos))

    # Build per-gene expected rsIDs from RSID_TO_ALLELE (covers ALL genes incl. CYP2D6)
    gene_expected_rsids: Dict[str, set] = {}
    for rsid, (gene_name, _allele) in RSID_TO_ALLELE.items():
        gene_expected_rsids.setdefault(gene_name.upper(), set()).add(rsid)

    for gene in KNOWN_GENES:
        variants = gene_variants.get(gene, [])
        # Build allele info for phenotype inference
        allele_info = []
        for v in variants:
            if v.is_variant:
                allele_info.append({
                    "star_allele": v.star_allele,
                    "genotype": v.genotype,
                })

        # Determine coverage: does the VCF have data at ANY defining position for this gene?
        # Check both positional (RSID_GRCH38) and rsID-based (RSID_TO_ALLELE) coverage
        expected_pos = gene_expected_positions.get(gene, set())
        expected_rs = gene_expected_rsids.get(gene, set())
        has_coverage = (
            bool(expected_pos & vcf_positions)
            or bool(expected_rs & vcf_rsids)
            or bool(allele_info)
            or bool(variants)  # If variants were found for this gene, we have coverage
        )

        # Use gene-specific phenotype inference for non-metabolizer genes
        if gene in _NON_METABOLIZER_GENES:
            phenotype = _infer_non_metabolizer_phenotype(gene, allele_info, has_coverage)
        else:
            phenotype = infer_phenotype(gene, allele_info, has_coverage)
        phenotype_map[gene] = phenotype

        # Activity description
        if allele_info:
            allele_descs = [f"{a['star_allele']} ({a['genotype']})" for a in allele_info]
            activity_desc = f"Detected: {', '.join(allele_descs)}"
        elif not has_coverage:
            activity_desc = f"No data at {gene} defining positions — insufficient coverage"
        else:
            if gene in _NON_METABOLIZER_GENES:
                activity_desc = _default_activity_desc(gene)
            else:
                activity_desc = "No actionable variants detected — assumed wild-type (*1/*1)"

        gene_phenotypes.append(GenePhenotype(
            gene=gene,
            phenotype=phenotype,
            detected_alleles=variants,
            activity_score_description=activity_desc,
        ))

    # Step 3: Assess each drug
    drug_results: List[DrugResult] = []

    for drug in drugs:
        drug_clean = drug.strip().lower()
        if not drug_clean:
            continue

        relevant_genes = get_genes_for_drug(drug_clean)

        if not relevant_genes:
            drug_results.append(DrugResult(
                drug=drug_clean,
                risk=UNKNOWN,
                gene="",
                phenotype="",
                recommendation=f"No pharmacogenomic data available for {drug_clean} in our knowledge base.",
                mechanism="",
                clinical_explanation=f"The drug '{drug_clean}' is not currently in our pharmacogenomic database. "
                    f"This does not mean it is safe — consult standard prescribing guidelines.",
            ))
            continue

        for gene in relevant_genes:
            phenotype = phenotype_map.get(gene, "Normal Metabolizer")
            gene_vars = gene_variants.get(gene, [])

            interaction = lookup_interaction(drug_clean, gene, phenotype)

            # Build diplotype string using the knowledge base function
            allele_info_for_diplo = [
                {"star_allele": v.star_allele, "genotype": v.genotype}
                for v in gene_vars if v.is_variant and v.star_allele
            ]
            diplotype = build_diplotype(gene, allele_info_for_diplo)

            if interaction:
                clinical_explanation = _build_clinical_explanation(
                    drug_clean, interaction, phenotype, gene_vars
                )

                drug_results.append(DrugResult(
                    drug=drug_clean,
                    risk=interaction.risk,
                    gene=gene,
                    phenotype=phenotype,
                    recommendation=interaction.recommendation,
                    mechanism=interaction.mechanism,
                    clinical_explanation=clinical_explanation,
                    cpic_level=interaction.cpic_level,
                    guidelines_url=interaction.guidelines_url,
                    variants_cited=[v for v in gene_vars if v.is_variant],
                    diplotype=diplotype,
                ))
            else:
                drug_results.append(DrugResult(
                    drug=drug_clean,
                    risk=UNKNOWN,
                    gene=gene,
                    phenotype=phenotype,
                    recommendation=f"No specific CPIC guideline found for {drug_clean} with {phenotype} {gene}.",
                    mechanism="",
                    clinical_explanation=f"The patient is classified as a {phenotype} for {gene}, "
                        f"but no specific interaction data is available for {drug_clean} with this phenotype.",
                ))

    # Step 4: Build summary
    risk_counts = {}
    for dr in drug_results:
        risk_counts[dr.risk] = risk_counts.get(dr.risk, 0) + 1

    critical_alerts = [
        dr for dr in drug_results if dr.risk in (TOXIC, INEFFECTIVE)
    ]

    summary = {
        "patientId": patient_id,
        "drugsAnalyzed": len(drugs),
        "totalInteractions": len(drug_results),
        "riskDistribution": risk_counts,
        "criticalAlerts": len(critical_alerts),
        "criticalDrugs": [
            {"drug": a.drug, "risk": a.risk, "gene": a.gene}
            for a in critical_alerts
        ],
        "genesScreened": len(gene_phenotypes),
    }

    t_analysis_end = time.perf_counter()

    return AnalysisResult(
        patient_id=patient_id,
        genes=gene_phenotypes,
        drug_results=drug_results,
        summary=summary,
        _analysis_time_ms=(t_analysis_end - t_analysis_start) * 1000,
        _vcf_variant_count=len(vcf.variants),
    )
