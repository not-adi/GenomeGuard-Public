"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconCircleX,
  IconSearch,
  IconArrowsSort,
  IconDna,
  IconArrowLeft,
  IconPill,
  IconFlask,
  IconChevronDown,
  IconDownload,
  IconFilter,
  IconX,
  IconChevronRight,
  IconActivity,
  IconInfoCircle,
} from "@tabler/icons-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════════════════════
   RISK → DISPLAY MAPPING
   ═══════════════════════════════════════════════════════════════════════ */
const RISK_CONFIG = {
  Safe: {
    label: "Safe",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    hex: "#10b981",
    hoverBg: "hover:bg-emerald-100",
  },
  "Adjust Dosage": {
    label: "Caution",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    hex: "#f59e0b",
    hoverBg: "hover:bg-amber-100",
  },
  Toxic: {
    label: "Avoid",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    hex: "#ef4444",
    hoverBg: "hover:bg-red-100",
  },
  Ineffective: {
    label: "Avoid",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    hex: "#ef4444",
    hoverBg: "hover:bg-red-100",
  },
};

function riskCfg(risk) {
  return (
    RISK_CONFIG[risk] || {
      label: risk,
      bg: "bg-gray-50",
      text: "text-gray-500",
      border: "border-gray-200",
      dot: "bg-gray-400",
      hex: "#9ca3af",
      hoverBg: "hover:bg-gray-100",
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || !value) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRUG TOOLTIP
   ═══════════════════════════════════════════════════════════════════════ */
function DrugPill({ drug, risk, gene, phenotype }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = riskCfg(risk);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((v) => !v)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize transition-all duration-200 cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border} ${cfg.hoverBg} hover:shadow-sm`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
        {drug}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-xl shadow-black/10 border border-[#a9bb9d]/20 p-3"
          >
            <div className="text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a1a1a] capitalize">
                  {drug}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} ${cfg.border}`}
                >
                  {cfg.label}
                </span>
              </div>
              <div className="h-px bg-[#a9bb9d]/10" />
              <div className="flex items-center gap-1.5 text-[#666]">
                <IconDna className="w-3 h-3 text-[#a9bb9d]" />
                <span>
                  Gene: <strong className="text-[#1a1a1a]">{gene}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#666]">
                <IconActivity className="w-3 h-3 text-[#a9bb9d]" />
                <span>
                  Phenotype:{" "}
                  <strong className="text-[#1a1a1a]">{phenotype}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#666]">
                <IconInfoCircle className="w-3 h-3 text-[#a9bb9d]" />
                <span>
                  Risk: <strong className="text-[#1a1a1a]">{risk}</strong>
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-[#a9bb9d]/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function SafetyMatrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [geneFilter, setGeneFilter] = useState("all");
  const [geneDropdownOpen, setGeneDropdownOpen] = useState(false);

  // Fetch matrix data from backend
  useEffect(() => {
    async function fetchMatrix() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/safety-matrix`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Failed to load safety matrix");
      } finally {
        setLoading(false);
      }
    }
    fetchMatrix();
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    if (!data) return null;
    let totalDrugs = 0;
    let safeDrugs = 0;
    let cautionDrugs = 0;
    let avoidDrugs = 0;
    const uniqueDrugs = new Set();

    for (const pheno of data.phenotypes) {
      for (const gene of data.genes) {
        const drugs = data.matrix[pheno]?.[gene] || [];
        for (const d of drugs) {
          totalDrugs++;
          uniqueDrugs.add(d.drug);
          if (d.risk === "Safe") safeDrugs++;
          else if (d.risk === "Adjust Dosage") cautionDrugs++;
          else avoidDrugs++;
        }
      }
    }

    return {
      totalEntries: totalDrugs,
      uniqueDrugs: uniqueDrugs.size,
      genes: data.genes.length,
      phenotypes: data.phenotypes.length,
      safeDrugs,
      cautionDrugs,
      avoidDrugs,
      safePercent: totalDrugs > 0 ? Math.round((safeDrugs / totalDrugs) * 100) : 0,
    };
  }, [data]);

  // Risk counts per filter
  const riskCounts = useMemo(() => {
    if (!data) return { all: 0, safe: 0, caution: 0, avoid: 0 };
    let safe = 0,
      caution = 0,
      avoid = 0,
      all = 0;
    for (const pheno of data.phenotypes) {
      for (const gene of data.genes) {
        const drugs = data.matrix[pheno]?.[gene] || [];
        for (const d of drugs) {
          all++;
          if (d.risk === "Safe") safe++;
          else if (d.risk === "Adjust Dosage") caution++;
          else avoid++;
        }
      }
    }
    return { all, safe, caution, avoid };
  }, [data]);

  // Search + risk + gene filter
  const filteredPhenotypes = useMemo(() => {
    if (!data) return [];

    return data.phenotypes.filter((pheno) => {
      const q = search.toLowerCase().trim();

      // Gene filter: if a specific gene is selected, only show phenotypes with entries for that gene
      if (geneFilter !== "all") {
        const drugs = data.matrix[pheno]?.[geneFilter] || [];
        if (drugs.length === 0) return false;
      }

      // Risk filter: check if any drug in this row matches the risk filter
      if (riskFilter !== "all") {
        let hasMatchingRisk = false;
        for (const gene of data.genes) {
          const drugs = data.matrix[pheno]?.[gene] || [];
          for (const d of drugs) {
            if (
              (riskFilter === "safe" && d.risk === "Safe") ||
              (riskFilter === "caution" && d.risk === "Adjust Dosage") ||
              (riskFilter === "avoid" &&
                (d.risk === "Toxic" || d.risk === "Ineffective"))
            ) {
              hasMatchingRisk = true;
              break;
            }
          }
          if (hasMatchingRisk) break;
        }
        if (!hasMatchingRisk) return false;
      }

      // Search filter
      if (!q) return true;
      if (pheno.toLowerCase().includes(q)) return true;
      for (const gene of data.genes) {
        if (gene.toLowerCase().includes(q)) return true;
        const drugs = data.matrix[pheno]?.[gene] || [];
        if (drugs.some((d) => d.drug.toLowerCase().includes(q))) return true;
      }
      return false;
    });
  }, [data, search, riskFilter, geneFilter]);

  // Check if a gene column has any matches (for highlighting)
  const matchingGenes = useMemo(() => {
    if (!data || !search.trim()) return new Set();
    const q = search.toLowerCase();
    const matches = new Set();
    for (const gene of data.genes) {
      if (gene.toLowerCase().includes(q)) {
        matches.add(gene);
      }
    }
    return matches;
  }, [data, search]);

  // CSV export
  const handleExportCSV = () => {
    if (!data) return;
    let csv = "Phenotype,Gene,Drug,Risk\n";
    for (const pheno of data.phenotypes) {
      for (const gene of data.genes) {
        const drugs = data.matrix[pheno]?.[gene] || [];
        for (const d of drugs) {
          csv += `"${pheno}","${gene}","${d.drug}","${d.risk}"\n`;
        }
      }
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "genomeguard_safety_matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilters =
    (riskFilter !== "all" ? 1 : 0) +
    (geneFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSearch("");
    setRiskFilter("all");
    setGeneFilter("all");
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-3 border-[#a9bb9d]/20 border-t-[#a9bb9d] rounded-full animate-spin" />
            <IconDna className="absolute inset-0 m-auto w-5 h-5 text-[#a9bb9d]/60" />
          </div>
          <p className="text-sm text-[#a9bb9d] font-medium">
            Loading safety matrix…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <IconCircleX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Failed to load
          </h2>
          <p className="text-sm text-[#999] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#a9bb9d] text-white rounded-full text-sm font-semibold hover:bg-[#8fa88a] transition-colors cursor-pointer shadow-md shadow-[#a9bb9d]/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f6f9f4] via-white to-[#eef4ea]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #a9bb9d 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Floating blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#a9bb9d]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#a9bb9d]/5 rounded-full blur-3xl" />

        <div className="relative max-w-[1400px] mx-auto px-6 pt-12 pb-14">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 text-xs text-[#999] mb-6"
          >
            <a
              href="/"
              className="hover:text-[#a9bb9d] transition-colors font-medium"
            >
              Home
            </a>
            <IconChevronRight className="w-3 h-3" />
            <span className="text-[#a9bb9d] font-semibold">
              Drug Safety Matrix
            </span>
          </motion.nav>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Title area */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="inline-flex items-center gap-2 bg-white border border-[#a9bb9d]/25 text-[#5a7a52] text-[10px] font-bold px-3.5 py-1.5 rounded-full mb-4 tracking-[0.15em] uppercase shadow-sm"
              >
                <IconShieldCheck className="w-3 h-3" />
                CPIC Reference Guide
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1a1a1a] tracking-tight leading-[1.15] mb-4"
              >
                Gene–Drug
                <br />
                <span className="bg-gradient-to-r from-[#5a7a52] to-[#a9bb9d] bg-clip-text text-transparent">
                  Safety Matrix
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-[#666] text-sm sm:text-base leading-relaxed max-w-lg"
              >
                A comprehensive, color-coded reference showing which medicines
                are safe, require dosage adjustment, or should be avoided — per
                genotype and phenotype.
              </motion.p>

              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-5 mt-5"
              >
                {[
                  { label: "Safe", color: "bg-emerald-500" },
                  { label: "Caution", color: "bg-amber-500" },
                  { label: "Avoid", color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                    />
                    <span className="text-xs text-[#555] font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Stat Cards */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="grid grid-cols-2 gap-3 w-full lg:w-auto"
              >
                {[
                  {
                    label: "Unique Drugs",
                    value: stats.uniqueDrugs,
                    icon: IconPill,
                    color: "text-[#5a7a52]",
                    bgColor: "bg-[#a9bb9d]/8",
                    borderColor: "border-[#a9bb9d]/15",
                  },
                  {
                    label: "Genes Covered",
                    value: stats.genes,
                    icon: IconDna,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50/60",
                    borderColor: "border-blue-100",
                  },
                  {
                    label: "Safe Entries",
                    value: stats.safePercent,
                    suffix: "%",
                    icon: IconShieldCheck,
                    color: "text-emerald-600",
                    bgColor: "bg-emerald-50/60",
                    borderColor: "border-emerald-100",
                  },
                  {
                    label: "Risk Alerts",
                    value: stats.avoidDrugs,
                    icon: IconAlertTriangle,
                    color: "text-red-500",
                    bgColor: "bg-red-50/60",
                    borderColor: "border-red-100",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className={`${stat.bgColor} border ${stat.borderColor} rounded-2xl p-4 min-w-[140px] transition-all duration-200 hover:shadow-md hover:shadow-black/5`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">
                          {stat.label}
                        </span>
                      </div>
                      <span
                        className={`text-2xl font-bold ${stat.color} tabular-nums`}
                      >
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix || ""}
                        />
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FILTER BAR + TABLE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-6 pb-16">
        {/* ── Filter Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-[#a9bb9d]/10 -mx-6 px-6 py-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a9bb9d]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drugs, genes, or phenotypes…"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f6f9f4] border border-[#a9bb9d]/15 rounded-xl placeholder:text-[#a9bb9d]/40 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#a9bb9d]/25 focus:border-[#a9bb9d]/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1a1a1a] cursor-pointer"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Risk filter chips */}
            <div className="flex items-center gap-1.5">
              {[
                { key: "all", label: "All", count: riskCounts.all },
                { key: "safe", label: "Safe", count: riskCounts.safe, dotColor: "bg-emerald-500" },
                { key: "caution", label: "Caution", count: riskCounts.caution, dotColor: "bg-amber-500" },
                { key: "avoid", label: "Avoid", count: riskCounts.avoid, dotColor: "bg-red-500" },
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setRiskFilter(chip.key)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                    riskFilter === chip.key
                      ? "bg-[#a9bb9d] text-white border-[#a9bb9d] shadow-sm shadow-[#a9bb9d]/20"
                      : "bg-white text-[#666] border-[#e5e5e5] hover:border-[#a9bb9d]/40 hover:text-[#1a1a1a]"
                  }`}
                >
                  {chip.dotColor && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${chip.dotColor}`}
                    />
                  )}
                  {chip.label}
                  <span
                    className={`text-[10px] ${
                      riskFilter === chip.key
                        ? "text-white/70"
                        : "text-[#bbb]"
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Gene dropdown */}
            <div className="relative">
              <button
                onClick={() => setGeneDropdownOpen((v) => !v)}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  geneFilter !== "all"
                    ? "bg-[#a9bb9d]/10 text-[#5a7a52] border-[#a9bb9d]/30"
                    : "bg-white text-[#666] border-[#e5e5e5] hover:border-[#a9bb9d]/40"
                }`}
              >
                <IconDna className="w-3.5 h-3.5" />
                {geneFilter !== "all" ? geneFilter : "All Genes"}
                <IconChevronDown
                  className={`w-3 h-3 transition-transform ${
                    geneDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {geneDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1.5 bg-white border border-[#a9bb9d]/15 rounded-xl shadow-xl shadow-black/8 py-1.5 z-50 min-w-[140px] max-h-64 overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setGeneFilter("all");
                        setGeneDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        geneFilter === "all"
                          ? "text-[#a9bb9d] bg-[#a9bb9d]/5"
                          : "text-[#666] hover:bg-[#f6f9f4]"
                      }`}
                    >
                      All Genes
                    </button>
                    {data.genes.map((gene) => (
                      <button
                        key={gene}
                        onClick={() => {
                          setGeneFilter(gene);
                          setGeneDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-mono font-medium transition-colors cursor-pointer ${
                          geneFilter === gene
                            ? "text-[#a9bb9d] bg-[#a9bb9d]/5"
                            : "text-[#666] hover:bg-[#f6f9f4]"
                        }`}
                      >
                        {gene}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666] hover:text-[#1a1a1a] px-3.5 py-2 rounded-xl border border-[#e5e5e5] hover:border-[#a9bb9d]/30 bg-white transition-all cursor-pointer"
            >
              <IconDownload className="w-3.5 h-3.5" />
              Export CSV
            </button>

            {/* Active filters indicator */}
            {activeFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#a9bb9d] hover:text-[#6b8760] cursor-pointer transition-colors"
              >
                <IconX className="w-3 h-3" />
                Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="overflow-x-auto rounded-2xl border border-[#a9bb9d]/15 shadow-sm"
        >
          <table className="w-full border-collapse min-w-[900px]">
            {/* Table header */}
            <thead>
              <tr className="bg-gradient-to-r from-[#f8fbf6] to-[#fafcf8]">
                <th className="text-left py-4 px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#999] border-b border-[#a9bb9d]/10 w-52 sticky left-0 bg-[#f9fbf7] z-10">
                  <div className="flex items-center gap-1.5">
                    <IconActivity className="w-3 h-3 text-[#a9bb9d]/50" />
                    Phenotype
                  </div>
                </th>
                {data.genes.map((gene) => (
                  <th
                    key={gene}
                    className={`text-left py-4 px-5 border-b border-[#a9bb9d]/10 ${
                      matchingGenes.has(gene)
                        ? "bg-[#a9bb9d]/10"
                        : ""
                    } ${
                      geneFilter === gene
                        ? "bg-[#a9bb9d]/15"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconDna className="w-3 h-3 text-[#a9bb9d]/40" />
                      <span className="text-xs font-bold text-[#1a1a1a] font-mono">
                        {gene}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table body */}
            <tbody>
              {filteredPhenotypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={data.genes.length + 1}
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#a9bb9d]/8 flex items-center justify-center">
                        <IconSearch className="w-5 h-5 text-[#a9bb9d]/40" />
                      </div>
                      <p className="text-sm text-[#999] font-medium">
                        No results found
                      </p>
                      <p className="text-xs text-[#ccc]">
                        Try adjusting your search or filters
                      </p>
                      {activeFilters > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-[#a9bb9d] hover:text-[#6b8760] font-semibold cursor-pointer mt-1"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPhenotypes.map((pheno, idx) => (
                  <tr
                    key={pheno}
                    className={`group transition-colors duration-150 hover:bg-[#f6f9f4]/60 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafcf8]/40"
                    }`}
                  >
                    {/* Phenotype label */}
                    <td className="py-4 px-5 border-b border-[#a9bb9d]/8 sticky left-0 bg-inherit z-10">
                      <span className="text-sm font-semibold text-[#1a1a1a]">
                        {pheno}
                      </span>
                    </td>

                    {/* Gene columns */}
                    {data.genes.map((gene) => {
                      const drugs = data.matrix[pheno]?.[gene] || [];
                      return (
                        <td
                          key={gene}
                          className={`py-4 px-5 border-b border-[#a9bb9d]/8 align-top ${
                            matchingGenes.has(gene) ? "bg-[#a9bb9d]/5" : ""
                          } ${geneFilter === gene ? "bg-[#a9bb9d]/8" : ""}`}
                        >
                          {drugs.length === 0 ? (
                            <span className="text-xs text-[#ddd] italic">
                              —
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {drugs.map((d, di) => {
                                // If risk filter is active, dim non-matching drugs
                                const dimmed =
                                  riskFilter !== "all" &&
                                  !(
                                    (riskFilter === "safe" &&
                                      d.risk === "Safe") ||
                                    (riskFilter === "caution" &&
                                      d.risk === "Adjust Dosage") ||
                                    (riskFilter === "avoid" &&
                                      (d.risk === "Toxic" ||
                                        d.risk === "Ineffective"))
                                  );

                                const isSearchMatch =
                                  search.trim() &&
                                  d.drug
                                    .toLowerCase()
                                    .includes(search.toLowerCase());

                                return (
                                  <div
                                    key={di}
                                    className={`transition-opacity duration-200 ${
                                      dimmed ? "opacity-20" : "opacity-100"
                                    } ${
                                      isSearchMatch
                                        ? "ring-2 ring-[#a9bb9d] ring-offset-1 rounded-full shadow-sm"
                                        : ""
                                    }`}
                                  >
                                    <DrugPill
                                      drug={d.drug}
                                      risk={d.risk}
                                      gene={gene}
                                      phenotype={pheno}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 p-5 bg-[#a9bb9d]/5 border border-[#a9bb9d]/20 rounded-2xl flex gap-3"
        >
          <IconAlertTriangle className="w-4 h-4 text-[#a9bb9d] shrink-0 mt-0.5" />
          <p className="text-[#6b8760] text-xs leading-relaxed">
            <span className="font-semibold text-[#4d6944]">
              Research Use Only —
            </span>{" "}
            This matrix is based on CPIC guidelines and is for educational
            purposes only. Always consult a licensed healthcare professional
            before making any medication changes.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM CTA SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 mb-4"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase text-[#a9bb9d] mb-3">
              <span className="w-6 h-px bg-[#a9bb9d]" />
              Continue Exploring
              <span className="w-6 h-px bg-[#a9bb9d]" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight">
              Take the Next Step
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Analyze Your VCF",
                desc: "Upload your genomic data and get a personalized pharmacogenomic risk report.",
                href: "/#analyze",
                icon: IconFlask,
                gradient: "from-[#5a7a52]/5 to-[#a9bb9d]/10",
                iconColor: "text-[#5a7a52]",
                borderColor: "border-[#a9bb9d]/20",
                hoverBorder: "hover:border-[#a9bb9d]/40",
              },
              {
                title: "Try Pill Scanner",
                desc: "Snap a photo of your medication for instant pharmacogenomic safety checks.",
                href: "/pill-scanner",
                icon: IconPill,
                gradient: "from-blue-50/60 to-indigo-50/40",
                iconColor: "text-blue-600",
                borderColor: "border-blue-100",
                hoverBorder: "hover:border-blue-200",
              },
              {
                title: "Family PGx",
                desc: "See how your genetics combine with your partner's for family planning insights.",
                href: "/familypgx",
                icon: IconDna,
                gradient: "from-rose-50/40 to-pink-50/40",
                iconColor: "text-rose-500",
                borderColor: "border-rose-100",
                hoverBorder: "hover:border-rose-200",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  className={`group relative bg-gradient-to-br ${card.gradient} border ${card.borderColor} ${card.hoverBorder} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-white border ${card.borderColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#666] leading-relaxed mb-3">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5a7a52]">
                    Get Started
                    <IconChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
