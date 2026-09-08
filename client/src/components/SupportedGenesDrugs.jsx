"use client";
import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

import Link from "next/link";
import {
  FileSearch,
  Heart,
  Users,
  MessageSquare,
  Brain,
  Pill,
  ArrowRight,
  Zap,
  Dna,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const GENES = [
  {
    name: "CYP2D6",
    fullName: "Cytochrome P450 2D6",
    role: "Metabolizes ~25% of all clinical drugs",
    drugs: ["Codeine", "Tramadol", "Tamoxifen", "Metoprolol"],
    variants: ["*1", "*2", "*4", "*5", "*10", "*17", "*41"],
    color: "#10b981",
    borderColor: "#10b98130",
    bgColor: "#10b98108",
  },
  {
    name: "CYP2C19",
    fullName: "Cytochrome P450 2C19",
    role: "Key in prodrug activation and PPI clearance",
    drugs: ["Clopidogrel", "Pantoprazole", "Sertraline", "Amitriptyline"],
    variants: ["*1", "*2", "*3", "*17"],
    color: "#14b8a6",
    borderColor: "#14b8a630",
    bgColor: "#14b8a608",
  },
  {
    name: "CYP2C9",
    fullName: "Cytochrome P450 2C9",
    role: "Metabolizes narrow therapeutic index drugs",
    drugs: ["Warfarin", "Celecoxib", "Phenytoin", "Losartan"],
    variants: ["*1", "*2", "*3", "*5", "*6"],
    color: "#f59e0b",
    borderColor: "#f59e0b30",
    bgColor: "#f59e0b08",
  },
  {
    name: "SLCO1B1",
    fullName: "Solute Carrier Organic Anion Transporter 1B1",
    role: "Mediates hepatic statin uptake",
    drugs: ["Simvastatin", "Atorvastatin", "Rosuvastatin"],
    variants: ["*1", "*5", "*15", "*17"],
    color: "#8b5cf6",
    borderColor: "#8b5cf630",
    bgColor: "#8b5cf608",
  },
  {
    name: "TPMT",
    fullName: "Thiopurine S-Methyltransferase",
    role: "Clears thiopurines; prevents myelosuppression",
    drugs: ["Azathioprine", "6-Mercaptopurine", "Thioguanine"],
    variants: ["*1", "*2", "*3A", "*3B", "*3C"],
    color: "#06b6d4",
    borderColor: "#06b6d430",
    bgColor: "#06b6d408",
  },
  {
    name: "DPYD",
    fullName: "Dihydropyrimidine Dehydrogenase",
    role: "Rate-limiting step in fluoropyrimidine catabolism",
    drugs: ["Fluorouracil (5-FU)", "Capecitabine", "Tegafur"],
    variants: ["*1", "*2A", "HapB3", "c.2846A>T"],
    color: "#ef4444",
    borderColor: "#ef444430",
    bgColor: "#ef444408",
  },
  {
    name: "CYP3A5",
    fullName: "Cytochrome P450 3A5",
    role: "Tacrolimus dosing and clearance; key in transplant",
    drugs: ["Tacrolimus"],
    variants: ["*1", "*3", "*6", "*7"],
    color: "#3b82f6",
    borderColor: "#3b82f630",
    bgColor: "#3b82f608",
  },
  {
    name: "NAT2",
    fullName: "N-Acetyltransferase 2",
    role: "Isoniazid (anti-TB) acetylation rate & hepatotoxicity",
    drugs: ["Isoniazid"],
    variants: ["*4", "*5A", "*5B", "*6A", "*7A"],
    color: "#ec4899",
    borderColor: "#ec489930",
    bgColor: "#ec489908",
  },
  {
    name: "HLA-B",
    fullName: "Human Leukocyte Antigen B",
    role: "SJS/SCAR immune-mediated hypersensitivity",
    drugs: ["Carbamazepine", "Allopurinol", "Phenytoin"],
    variants: ["*15:02", "*58:01", "*57:01"],
    color: "#f43f5e",
    borderColor: "#f43f5e30",
    bgColor: "#f43f5e08",
  },
  {
    name: "G6PD",
    fullName: "Glucose-6-Phosphate Dehydrogenase",
    role: "Protects RBCs; deficiency causes drug-induced hemolysis",
    drugs: ["Primaquine", "Rasburicase"],
    variants: ["B", "A-", "Mediterranean", "Kerala-Kalyan"],
    color: "#eab308",
    borderColor: "#eab30830",
    bgColor: "#eab30808",
  },
  {
    name: "VKORC1",
    fullName: "Vitamin K Epoxide Reductase Complex 1",
    role: "Target of warfarin; determines warfarin sensitivity",
    drugs: ["Warfarin"],
    variants: ["-1639G>A_AA", "-1639G>A_GA", "-1639G>A_GG"],
    color: "#a855f7",
    borderColor: "#a855f730",
    bgColor: "#a855f708",
  },
  {
    name: "UGT1A1",
    fullName: "UDP-Glucuronosyltransferase 1A1",
    role: "Irinotecan clearance; prevents severe diarrhea & neutropenia",
    drugs: ["Irinotecan", "Atazanavir", "Mycophenolate"],
    variants: ["*1", "*6", "*28", "*36", "*37"],
    color: "#10b981",
    borderColor: "#10b98130",
    bgColor: "#10b98108",
  },
  {
    name: "CYP1A2",
    fullName: "Cytochrome P450 1A2",
    role: "Metabolizes ~9% of clinical drugs including antipsychotics",
    drugs: ["Clozapine", "Olanzapine", "Fluvoxamine"],
    variants: ["*1C", "*1F", "*1K"],
    color: "#6366f1",
    borderColor: "#6366f130",
    bgColor: "#6366f108",
  },
  {
    name: "IFNL3",
    fullName: "Interferon Lambda 3",
    role: "Associated with Hepatitis C treatment response",
    drugs: ["Pegylated Interferon-alpha"],
    variants: ["rs12979860"],
    color: "#14b8a6",
    borderColor: "#14b8a630",
    bgColor: "#14b8a608",
  },
  {
    name: "NUDT15",
    fullName: "Nudix Hydrolase 15",
    role: "Thiopurine toxicity risk, especially in Asian populations",
    drugs: ["Mercaptopurine", "Thioguanine", "Azathioprine"],
    variants: ["*2", "*3", "*4", "*5"],
    color: "#f43f5e",
    borderColor: "#f43f5e30",
    bgColor: "#f43f5e08",
  },
  {
    name: "CYP2C8",
    fullName: "Cytochrome P450 2C8",
    role: "Metabolizes antimalarials, antidiabetics, and chemotherapeutics",
    drugs: ["Paclitaxel", "Repaglinide"],
    variants: ["*2", "*3", "*4"],
    color: "#8b5cf6",
    borderColor: "#8b5cf630",
    bgColor: "#8b5cf608",
  },
  {
    name: "CYP2B6",
    fullName: "Cytochrome P450 2B6",
    role: "Efavirenz and methadone clearance",
    drugs: ["Efavirenz", "Methadone"],
    variants: ["*6", "*9", "*18"],
    color: "#f59e0b",
    borderColor: "#f59e0b30",
    bgColor: "#f59e0b08",
  },
  {
    name: "HLA-A",
    fullName: "Human Leukocyte Antigen A",
    role: "Predicts severe cutaneous adverse reactions (SJS/TEN)",
    drugs: ["Abacavir", "Carbamazepine"],
    variants: ["*31:01"],
    color: "#ef4444",
    borderColor: "#ef444430",
    bgColor: "#ef444408",
  },
  {
    name: "CYP3A4",
    fullName: "Cytochrome P450 3A4",
    role: "Primary metabolizer for >50% of all prescription drugs",
    drugs: ["Simvastatin", "Ticagrelor", "Midazolam"],
    variants: ["*22"],
    color: "#3b82f6",
    borderColor: "#3b82f630",
    bgColor: "#3b82f608",
  },
  {
    name: "ABCG2",
    fullName: "ATP Binding Cassette Subfamily G Member 2",
    role: "Key efflux transporter for uric acid and statins",
    drugs: ["Rosuvastatin", "Allopurinol"],
    variants: ["c.421C>A", "c.34G>A"],
    color: "#10b981",
    borderColor: "#10b98130",
    bgColor: "#10b98108",
  },
];

const DRUG_GENE_MAP = [
  {
    drug: "CODEINE",
    gene: "CYP2D6",
    mechanism: "Prodrug → morphine conversion",
    risk: "Toxic if ultrarapid metabolizer",
  },
  {
    drug: "WARFARIN",
    gene: "CYP2C9 + VKORC1",
    mechanism: "Clearance and target sensitivity",
    risk: "Bleeding if poor metabolizer/sensitive",
  },
  {
    drug: "CLOPIDOGREL",
    gene: "CYP2C19",
    mechanism: "Prodrug activation",
    risk: "Ineffective if poor metabolizer",
  },
  {
    drug: "SIMVASTATIN",
    gene: "SLCO1B1",
    mechanism: "Hepatic uptake",
    risk: "Myopathy if *5 variant",
  },
  {
    drug: "AZATHIOPRINE",
    gene: "TPMT + NUDT15",
    mechanism: "Thiopurine inactivation",
    risk: "Myelosuppression if deficient",
  },
  {
    drug: "FLUOROURACIL",
    gene: "DPYD",
    mechanism: "5-FU catabolism",
    risk: "Severe toxicity if DPYD deficient",
  },
  {
    drug: "TACROLIMUS",
    gene: "CYP3A5",
    mechanism: "Immunosuppressant clearance",
    risk: "Dose increase if expresser",
  },
  {
    drug: "ISONIAZID",
    gene: "NAT2",
    mechanism: "Hepatic acetylation rate",
    risk: "Hepatotoxicity if slow acetylator",
  },
  {
    drug: "ALLOPURINOL",
    gene: "HLA-B",
    mechanism: "Severe cutaneous reactions",
    risk: "SJS/SCAR if *58:01 carrier",
  },
  {
    drug: "PRIMAQUINE",
    gene: "G6PD",
    mechanism: "Red blood cell oxidative stress",
    risk: "Hemolysis if G6PD deficient",
  },
];


export default function SupportedGenesDrugs() {
  const [showAll, setShowAll] = React.useState(false);
  const visibleGenes = showAll ? GENES : GENES.slice(0, 6);

  return (
    <section
      id="genes"
      className="py-24 px-4 bg-gradient-to-b from-white to-[#f0f7f4]"
    >

      {/* ── Drug-Gene Interaction Cards ── */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1e40] tracking-tight">
            Drug–Gene Interactions
          </h2>
          <p className="text-[#64748b] text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            Key pharmacogenomic relationships analyzed by GenomeGuard
          </p>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden">
          <InfiniteMovingCards
            items={DRUG_GENE_MAP.map((r) => ({
              name: r.drug,
              title: r.gene,
              quote: `${r.mechanism} — ${r.risk}`,
            }))}
            direction="left"
            speed="slow"
          />
          <InfiniteMovingCards
            items={[...DRUG_GENE_MAP].reverse().map((r) => ({
              name: r.drug,
              title: r.gene,
              quote: `${r.mechanism} — ${r.risk}`,
            }))}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    
      <div className="max-w-7xl mx-auto">
        {/* Section header — centered with badge */}
        <div className="text-center mt-20 mb-12">
          <span className="inline-flex items-center gap-1.5 bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 text-[#5a7a52] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <Dna className="w-3.5 h-3.5" />
            {GENES.length} Pharmacogenes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1e40] tracking-tight">
            Genes & Drugs Covered
          </h2>
          <p className="text-[#64748b] text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            GenomeGuard analyzes {GENES.length} clinically actionable pharmacogenes across CPIC Tier&nbsp;1&nbsp;&&nbsp;2 guidelines to power medication safety decisions.
          </p>
        </div>

        {/* ── Genes Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {visibleGenes.map((gene) => (
            <div
              key={gene.name}
              className="group bg-white relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Gene name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-extrabold font-mono">
                    {gene.name}
                  </h3>
                  <p className="text-[#64748b] text-xs mt-0.5">{gene.fullName}</p>
                </div>
              </div>

              <p className="text-[#64748b] text-xs mb-4 leading-relaxed">
                {gene.role}
              </p>

              {/* Affected drugs */}
              <div className="mb-4">
                <p className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Key Drugs
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gene.drugs.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                      style={{
                        backgroundColor: `${gene.color}12`,
                        borderColor: `whitesmoke`,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Common variants */}
              <div>
                <p className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-widest mb-2">
                  Common Variants
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gene.variants.map((v) => (
                    <span
                      key={v}
                      className="text-[10px] font-mono bg-white border border-[#a9bb9d]/20 text-[#0b1e40] px-2 py-0.5 rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Show All / Collapse Toggle ── */}
        {GENES.length > 6 && (
          <div className="text-center mb-14">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5a7a52] bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 px-6 py-2.5 rounded-full hover:bg-[#a9bb9d]/20 hover:border-[#a9bb9d]/30 transition-all duration-300 cursor-pointer"
            >
              {showAll ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  View All {GENES.length} Genes
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </button>
          </div>
        )}

        <div
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 bg-[#0b1e40] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Start Your Pharmacogenomic Journey
            </h3>
            <p className="text-slate-400 text-sm">
              Upload your VCF file and get your first analysis in under 30
              seconds.
            </p>
          </div>
          <Link
            href="/#analysis"
            className="shrink-0 flex items-center gap-2 bg-white text-[#0b1e40] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#a9bb9d]/20 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
