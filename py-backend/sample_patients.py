"""
Sample Patients — Pre-built patient profiles for demo / quick analysis.
Each patient has an Indian name, a brief clinical context, and a VCF file
with pharmacogenomically relevant variants producing distinct analysis outcomes.
"""

from __future__ import annotations

# ── VCF header shared by all sample files ──────────────────────────────────
_VCF_HEADER = """\
##fileformat=VCFv4.2
##fileDate=20260401
##source=GenomeGuard_SampleGenerator_v1.0
##reference=GRCh38.p13
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele designation">
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">
##FILTER=<ID=PASS,Description="All filters passed">
"""

def _vcf(sample_name: str, rows: list[tuple]) -> str:
    """Build a VCF string from a list of (chrom, pos, rsid, ref, alt, gene, star, gt) tuples."""
    lines = [_VCF_HEADER.strip()]
    lines.append(f"#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t{sample_name}")
    for chrom, pos, rsid, ref, alt, gene, star, gt in rows:
        info = f"GENE={gene};STAR={star};RS={rsid}"
        lines.append(f"{chrom}\t{pos}\t{rsid}\t{ref}\t{alt}\t99\tPASS\t{info}\tGT\t{gt}")
    return "\n".join(lines) + "\n"


# ── Variant row presets ────────────────────────────────────────────────────
# CYP2D6
CYP2D6_4  = ("chr22", "42524175", "rs3892097", "C", "T", "CYP2D6", "*4")
CYP2D6_10 = ("chr22", "42522613", "rs1065852", "G", "A", "CYP2D6", "*10")
CYP2D6_41 = ("chr22", "42126611", "rs28371725", "C", "T", "CYP2D6", "*41")
CYP2D6_6  = ("chr22", "42127941", "rs5030655", "G", "A", "CYP2D6", "*6")

# CYP2C19
CYP2C19_2  = ("chr10", "96541616", "rs4244285", "G", "A", "CYP2C19", "*2")
CYP2C19_3  = ("chr10", "96540410", "rs4986893", "G", "A", "CYP2C19", "*3")
CYP2C19_17 = ("chr10", "94842866", "rs12769205", "A", "G", "CYP2C19", "*17")

# CYP2C9
CYP2C9_2 = ("chr10", "94942290", "rs1799853", "C", "T", "CYP2C9", "*2")
CYP2C9_3 = ("chr10", "94981296", "rs1057910", "A", "C", "CYP2C9", "*3")

# SLCO1B1
SLCO1B1_5 = ("chr12", "21178615", "rs4149056", "T", "C", "SLCO1B1", "*5")

# TPMT
TPMT_2 = ("chr6", "18143955", "rs1800462", "G", "C", "TPMT", "*2")
TPMT_3A = ("chr6", "18133885", "rs1800460", "G", "A", "TPMT", "*3A")

# DPYD
DPYD_2A = ("chr1", "97915614", "rs3918290", "C", "T", "DPYD", "*2A")
DPYD_13 = ("chr1", "97740410", "rs67376798", "T", "A", "DPYD", "*13")

# ── NEW GENE PRESETS ──

# NAT2
NAT2_5A = ("chr8", "18257854", "rs1801280", "T", "C", "NAT2", "*5A")
NAT2_6A = ("chr8", "18258103", "rs1799930", "G", "A", "NAT2", "*6A")
NAT2_7A = ("chr8", "18258370", "rs1799931", "G", "A", "NAT2", "*7A")

# CYP3A5
CYP3A5_3 = ("chr7", "99672916", "rs776746", "A", "G", "CYP3A5", "*3")

# CYP3A4
CYP3A4_22 = ("chr7", "99361466", "rs35599367", "C", "T", "CYP3A4", "*22")

# CYP2B6
CYP2B6_6 = ("chr19", "41512841", "rs3745274", "G", "T", "CYP2B6", "*6")

# CYP1A2
CYP1A2_1F = ("chr15", "75041917", "rs762551", "C", "A", "CYP1A2", "*1F")

# UGT1A1
UGT1A1_28 = ("chr2", "233760233", "rs8175347", "C", "CATAT", "UGT1A1", "*28")
UGT1A1_6  = ("chr2", "233759924", "rs4148323", "G", "A", "UGT1A1", "*6")

# NUDT15
NUDT15_2 = ("chr13", "48037825", "rs116855232", "C", "T", "NUDT15", "*2")

# CYP2C8
CYP2C8_3 = ("chr10", "96818119", "rs10509681", "G", "A", "CYP2C8", "*3")

# VKORC1
VKORC1_GA = ("chr16", "31107689", "rs9923231", "C", "T", "VKORC1", "-1639G>A_GA")

# HLA-B
HLAB_1502 = ("chr6", "31356806", "rs3909184", "G", "A", "HLA-B", "*15:02")
HLAB_5801 = ("chr6", "31356960", "rs9263726", "C", "T", "HLA-B", "*58:01")

# HLA-A
HLAA_3101 = ("chr6", "29942854", "rs1061235", "T", "C", "HLA-A", "*31:01")

# ABCG2
ABCG2_Q141K = ("chr4", "89052323", "rs2231142", "G", "T", "ABCG2", "rs2231142_CA")

# IFNL3
IFNL3_CT = ("chr19", "39738787", "rs12979860", "C", "T", "IFNL3", "rs12979860_CT")

# G6PD
G6PD_MED = ("chrX", "154536002", "rs5030868", "C", "T", "G6PD", "Mediterranean")
G6PD_A   = ("chrX", "154535277", "rs1050828", "G", "A", "G6PD", "A-")


def _row(preset, gt):
    """Combine a preset tuple with a genotype."""
    return preset + (gt,)


# ═══════════════════════════════════════════════════════════════════════════
# Patient definitions
# ═══════════════════════════════════════════════════════════════════════════

SAMPLE_PATIENTS = [
    {
        "id": "SP001",
        "name": "Aarav Sharma",
        "age": 34,
        "sex": "Male",
        "condition": "Post-surgical pain management",
        "description": "No actionable pharmacogenomic variants detected — normal metabolizer across all tested genes.",
        "suggested_drugs": ["CODEINE", "WARFARIN", "SIMVASTATIN"],
        "vcf": _vcf("AARAV_SHARMA", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP002",
        "name": "Priya Patel",
        "age": 28,
        "sex": "Female",
        "condition": "Chronic migraine with codeine prescription",
        "description": "Heterozygous CYP2D6*4 carrier — intermediate metabolizer for codeine and related opioids.",
        "suggested_drugs": ["CODEINE", "WARFARIN"],
        "vcf": _vcf("PRIYA_PATEL", [
            _row(CYP2D6_4,  "0/1"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP003",
        "name": "Vikram Reddy",
        "age": 52,
        "sex": "Male",
        "condition": "Coronary stent — clopidogrel therapy",
        "description": "CYP2C19*2 heterozygote — intermediate metabolizer, reduced clopidogrel activation.",
        "suggested_drugs": ["CLOPIDOGREL", "SIMVASTATIN"],
        "vcf": _vcf("VIKRAM_REDDY", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/1"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/1"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP004",
        "name": "Ananya Gupta",
        "age": 45,
        "sex": "Female",
        "condition": "Breast cancer — fluorouracil chemotherapy",
        "description": "DPYD*2A heterozygote — high risk of severe 5-FU toxicity. Dose reduction critical.",
        "suggested_drugs": ["FLUOROURACIL", "CODEINE"],
        "vcf": _vcf("ANANYA_GUPTA", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/1"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP005",
        "name": "Rohan Mehta",
        "age": 61,
        "sex": "Male",
        "condition": "Atrial fibrillation — warfarin anticoagulation",
        "description": "CYP2C9*2 and *3 heterozygote — requires significant warfarin dose reduction.",
        "suggested_drugs": ["WARFARIN", "CLOPIDOGREL"],
        "vcf": _vcf("ROHAN_MEHTA", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/1"), _row(CYP2C9_3,  "0/1"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP006",
        "name": "Sneha Iyer",
        "age": 39,
        "sex": "Female",
        "condition": "Hypercholesterolemia — statin therapy",
        "description": "SLCO1B1*5 heterozygote — increased risk of simvastatin-induced myopathy.",
        "suggested_drugs": ["SIMVASTATIN", "WARFARIN"],
        "vcf": _vcf("SNEHA_IYER", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/1"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP007",
        "name": "Arjun Nair",
        "age": 55,
        "sex": "Male",
        "condition": "Colon cancer with post-op pain — multiple drug interactions",
        "description": "CYP2D6*4 + DPYD*2A carrier — dual risk: codeine inefficacy and 5-FU toxicity.",
        "suggested_drugs": ["CODEINE", "FLUOROURACIL", "SIMVASTATIN"],
        "vcf": _vcf("ARJUN_NAIR", [
            _row(CYP2D6_4,  "0/1"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/1"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/1"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP008",
        "name": "Kavya Desai",
        "age": 31,
        "sex": "Female",
        "condition": "Depression — considering clopidogrel for DVT",
        "description": "CYP2C19*2 homozygote — poor metabolizer, clopidogrel likely ineffective.",
        "suggested_drugs": ["CLOPIDOGREL", "CODEINE"],
        "vcf": _vcf("KAVYA_DESAI", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/1"),
            _row(CYP2C19_2, "1/1"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP009",
        "name": "Siddharth Kumar",
        "age": 42,
        "sex": "Male",
        "condition": "Crohn's disease — azathioprine immunosuppression",
        "description": "TPMT*2 heterozygote — reduced thiopurine metabolism, dose adjustment needed.",
        "suggested_drugs": ["AZATHIOPRINE", "CODEINE"],
        "vcf": _vcf("SIDDHARTH_KUMAR", [
            _row(CYP2D6_4,  "0/0"), _row(CYP2D6_10, "0/0"),
            _row(CYP2C19_2, "0/0"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/0"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/0"), _row(TPMT_2,     "0/1"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP010",
        "name": "Meera Joshi",
        "age": 37,
        "sex": "Female",
        "condition": "Multi-drug review — complex polypharmacy",
        "description": "Multiple variant carrier: CYP2D6*4, CYP2C9*2, CYP2C19*2 — high-risk polypharmacy profile.",
        "suggested_drugs": ["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN"],
        "vcf": _vcf("MEERA_JOSHI", [
            _row(CYP2D6_4,  "0/1"), _row(CYP2D6_10, "0/1"),
            _row(CYP2C19_2, "0/1"), _row(CYP2C19_3, "0/0"),
            _row(CYP2C9_2,  "0/1"), _row(CYP2C9_3,  "0/0"),
            _row(SLCO1B1_5, "0/1"), _row(TPMT_2,     "0/0"),
            _row(DPYD_2A,   "0/0"),
            _row(NAT2_5A, "0/0"), _row(NAT2_6A, "0/0"), _row(NAT2_7A, "0/0"),
            _row(CYP3A5_3, "0/0"), _row(CYP3A4_22, "0/0"), _row(CYP2B6_6, "0/0"),
            _row(CYP1A2_1F, "0/0"), _row(UGT1A1_28, "0/0"), _row(UGT1A1_6, "0/0"),
            _row(NUDT15_2, "0/0"), _row(CYP2C8_3, "0/0"), _row(VKORC1_GA, "0/0"),
            _row(HLAB_1502, "0/0"), _row(HLAB_5801, "0/0"), _row(HLAA_3101, "0/0"),
            _row(ABCG2_Q141K, "0/0"), _row(IFNL3_CT, "0/0"), _row(G6PD_MED, "0/0"), _row(G6PD_A, "0/0"),
        ]),
    },
    {
        "id": "SP011",
        "name": "Rajesh Patel",
        "age": 45,
        "sex": "Male",
        "condition": "Tuberculosis treatment initiation",
        "description": "NAT2 slow acetylator (compound heterozygote *5A/*6A) — high risk of isoniazid-induced hepatotoxicity and peripheral neuropathy.",
        "suggested_drugs": ["ISONIAZID", "RIFAMPICIN"],
        "vcf": _vcf("RAJESH_PATEL", [
            _row(NAT2_5A, "0/1"), _row(NAT2_6A, "0/1"),
        ]),
    },
    {
        "id": "SP012",
        "name": "Sunita Krishnan",
        "age": 29,
        "sex": "Female",
        "condition": "New onset focal epilepsy",
        "description": "HLA-B*15:02 positive — high risk of life-threatening Stevens-Johnson Syndrome (SJS) or Toxic Epidermal Necrolysis (TEN) if carbamazepine or oxcarbazepine is prescribed.",
        "suggested_drugs": ["CARBAMAZEPINE", "OXCARBAZEPINE", "LAMOTRIGINE"],
        "vcf": _vcf("SUNITA_KRISHNAN", [
            _row(HLAB_1502, "0/1"),
        ]),
    },
    {
        "id": "SP013",
        "name": "Amit Bose",
        "age": 52,
        "sex": "Male",
        "condition": "Chronic gouty arthritis with hyperuricemia",
        "description": "HLA-B*58:01 positive — high risk of allopurinol-induced Severe Cutaneous Adverse Reactions (SCAR). Febuxostat is recommended.",
        "suggested_drugs": ["ALLOPURINOL", "CELECOXIB"],
        "vcf": _vcf("AMIT_BOSE", [
            _row(HLAB_5801, "0/1"),
        ]),
    },
    {
        "id": "SP014",
        "name": "Deepak Nair",
        "age": 31,
        "sex": "Male",
        "condition": "Plasmodium vivax malaria radical cure",
        "description": "G6PD deficient (Mediterranean variant) — contraindicated for standard dose primaquine due to severe acute hemolytic anemia risk.",
        "suggested_drugs": ["PRIMAQUINE", "RASBURICASE"],
        "vcf": _vcf("DEEPAK_NAIR", [
            _row(G6PD_MED, "1/0"),
        ]),
    },
    {
        "id": "SP015",
        "name": "Pooja Rao",
        "age": 38,
        "sex": "Female",
        "condition": "Renal transplant recipient post-op care",
        "description": "CYP3A5 intermediate expresser (*1/*3) — metabolizes tacrolimus rapidly. Requires higher starting dose to achieve target therapeutic trough levels.",
        "suggested_drugs": ["TACROLIMUS", "MYCOPHENOLATE"],
        "vcf": _vcf("POOJA_RAO", [
            _row(CYP3A5_3, "0/1"),
        ]),
    },
]


def get_patient_list():
    """Return metadata (no VCF content) for all sample patients."""
    return [
        {
            "id": p["id"],
            "name": p["name"],
            "age": p["age"],
            "sex": p["sex"],
            "condition": p["condition"],
            "description": p["description"],
            "suggested_drugs": p["suggested_drugs"],
        }
        for p in SAMPLE_PATIENTS
    ]


def get_patient_vcf(patient_id: str) -> str | None:
    """Return VCF content for a given patient ID, or None if not found."""
    for p in SAMPLE_PATIENTS:
        if p["id"] == patient_id:
            return p["vcf"]
    return None
