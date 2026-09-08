"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShieldCheck,
  Activity,
  ChevronDown,
  AlertTriangle,
  Database,
  Link as LinkIcon,
  Server,
  ArrowRight,
  UserCheck,
  FileText,
  KeyRound,
  Zap
} from "lucide-react";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { validateVCFContent, parseVCFFile } from "@/utils/vcfValidator";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Mock ABHA data helpers ─────────────────────────────────────────────────
const BLOOD_GROUPS = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];

const GENETIC_MARKERS = [
  { gene: "CYP2D6", label: "Drug Metabolism", desc: "Opioid & antidepressant processing" },
  { gene: "CYP2C19", label: "Platelet Therapy", desc: "Clopidogrel activation pathway" },
  { gene: "CYP2C9", label: "Anticoagulation", desc: "Warfarin dose sensitivity" },
  { gene: "SLCO1B1", label: "Statin Transport", desc: "Myopathy risk with statins" },
  { gene: "DPYD", label: "Chemo Tolerance", desc: "5-FU toxicity predictor" },
  { gene: "TPMT", label: "Immunosuppression", desc: "Thiopurine metabolism" },
];

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ── FAQ DATA ── */
const FAQ_DATA = [
  {
    q: "Is the GenomeGuard ABHA integration currently live?",
    a: "No. GenomeGuard is currently in a closed beta and undergoing certification with the National Health Authority (NHA) for the Ayushman Bharat Digital Mission (ABDM). The current interface operates in a sandbox using simulated patient records.",
  },
  {
    q: "How does the ABHA integration work?",
    a: "By entering a 14-digit Ayushman Bharat Health Account (ABHA) ID, GenomeGuard securely requests the patient's linked health records over the ABDM network. Once patient consent is granted, we retrieve their encrypted VCF file for real-time analysis.",
  },
  {
    q: "What happens if a patient revokes consent?",
    a: "Through the ABDM framework, patient consent is strictly enforced. If a patient revokes access to their health locker, GenomeGuard immediately loses the ability to fetch their VCF data for any future analyses.",
  },
  {
    q: "Is the genetic data stored on your servers?",
    a: "No. In adherence to ABDM policies, all genetic processing happens in memory. Once the pharmacogenomic summary is generated, the raw VCF file and intermediate data are immediately discarded to ensure absolute data sovereignty.",
  },
  {
    q: "Do I need special hardware to run the analysis?",
    a: "No, the entire process is fully cloud-based. The VCF file is fetched directly from the patient's locker and processed on our secure DPDP-compliant servers. The generated report is then delivered directly to your browser in seconds.",
  },
  {
    q: "What if the patient hasn't uploaded their VCF to ABHA?",
    a: "If the patient's ABHA locker does not contain genetic variants, the lookup will gracefully fail. You can seamlessly fall back to our manual upload flow or request the patient to link their sequencing provider to their ABHA account.",
  },
  {
    q: "Which pharmacogenes are covered by the ABHA integration?",
    a: "If the patient's VCF contains high-coverage whole exome or genome data, our system can scan over 20+ key pharmacogenes. This includes critical markers like CYP2D6, CYP2C19, SLCO1B1, and DPYD, aligning with CPIC guidelines.",
  },
  {
    q: "How accurate is the pharmacogenomic analysis?",
    a: "Our analysis engine maps the variants found in the VCF directly against CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines. The generated reports are clinical-grade and designed exclusively for healthcare professional review.",
  },
];

/* ── FAQ Item ── */
function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="border-b border-[#a9bb9d]/15 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-[15px] font-semibold text-[#0b1e40] pr-8 group-hover:text-[#6b8760] transition-colors">
          {item.q}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#f7faf5] transition-colors group-hover:bg-[#e6f2e8]`}>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-[#8fa88a] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-[#5a6070] leading-relaxed pr-12">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function AbhaPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const searchRef = useRef(null);

  const [abhaId, setAbhaId] = useState("");
  const [patient, setPatient] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);

  const formatAbha = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 14);
    const parts = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10), digits.slice(10, 14)];
    return parts.filter(Boolean).join("-");
  };

  const handleInputChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 14);
    setAbhaId(digits);
    if (patient) setPatient(null);
    setError(null);
  };

  const derivedBloodGroup = useMemo(() => {
    if (abhaId.length < 14) return null;
    return BLOOD_GROUPS[hashId(abhaId) % BLOOD_GROUPS.length];
  }, [abhaId]);

  const derivedMarkers = useMemo(() => {
    if (abhaId.length < 14) return [];
    const h = hashId(abhaId);
    return GENETIC_MARKERS.map((m, i) => ({
      ...m,
      status: (h >> i) & 1 ? "Variant Detected" : "Normal",
      variant: (h >> i) & 1,
    }));
  }, [abhaId]);

  const handleLookup = useCallback(async () => {
    if (abhaId.length !== 14) {
      setError("Please enter a valid 14-digit ABHA ID.");
      return;
    }
    setLookupLoading(true);
    setError(null);
    setPatient(null);

    try {
      let patients = allPatients;
      if (patients.length === 0) {
        const res = await fetch(`${BACKEND_URL}/api/sample-patients`);
        if (!res.ok) throw new Error("Backend unreachable");
        const data = await res.json();
        patients = data.patients || [];
        setAllPatients(patients);
      }

      if (patients.length === 0) throw new Error("No patient data available on server.");

      const idx = hashId(abhaId) % patients.length;
      const picked = patients[idx];

      await new Promise((r) => setTimeout(r, 900));

      setPatient({
        ...picked,
        abhaId: formatAbha(abhaId),
        bloodGroup: derivedBloodGroup,
        markers: derivedMarkers,
      });

      setTimeout(() => {
        window.scrollBy({ top: 350, behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setError(err.message || "Lookup failed. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }, [abhaId, allPatients, derivedBloodGroup, derivedMarkers]);

  const handleAnalyze = useCallback(async () => {
    if (!patient) return;
    setAnalyzeLoading(true);
    setError(null);

    try {
      const sp = allPatients.find((p) => p.id === patient.id);
      if (!sp) throw new Error("Patient data unavailable");

      const vcfRes = await fetch(`${BACKEND_URL}/api/sample-patients/${sp.id}/vcf`);
      if (!vcfRes.ok) throw new Error("Failed to fetch VCF data");
      const vcfText = await vcfRes.text();

      const contentValidation = validateVCFContent(vcfText);
      if (!contentValidation.valid) throw new Error(contentValidation.error);

      const blob = new Blob([vcfText], { type: "text/plain" });
      const vcfFile = new File([blob], `${sp.id}.vcf`, { type: "text/plain" });

      try {
        const variants = await parseVCFFile(vcfFile);
        sessionStorage.setItem("pgx_variants", JSON.stringify(variants));
      } catch (e) {
        console.warn("Failed to parse VCF for local use:", e);
      }

      const drugs = sp.suggested_drugs || ["CODEINE", "WARFARIN"];
      const formData = new FormData();
      formData.append("vcf_file", vcfFile);
      formData.append("drugs", drugs.join(","));

      const analyzeRes = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${analyzeRes.status}`);
      }

      const results = await analyzeRes.json();

      sessionStorage.setItem("genomeguard_results", JSON.stringify(results));
      sessionStorage.setItem(
        "abha_context",
        JSON.stringify({
          abhaId: patient.abhaId,
          name: patient.name,
          bloodGroup: patient.bloodGroup,
          age: patient.age,
          sex: patient.sex,
        })
      );

      router.push("/results");
    } catch (err) {
      setError(err.message || "Analysis failed.");
      setAnalyzeLoading(false);
    }
  }, [patient, allPatients, router]);

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-[#0b1e40] overflow-x-hidden" style={{ fontFamily: "'Mulish', sans-serif" }}>
        <NavBar />

        {/* ════════════════════════════════════
            HERO (Gateway Identity)
        ════════════════════════════════════ */}
        <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-[#f7faf5] via-white to-[#e6f2e8]">
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#a9bb9d 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
          <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[#a9bb9d]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#a9bb9d]/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 text-[#6b8760] text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-sm"
              >
                <LinkIcon className="w-4 h-4" />
                ABDM Network Gateway
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-[#0b1e40] leading-tight"
              >
                Connect to the National <br className="hidden sm:block" />
                <span className="text-[#6b8760] relative inline-block">
                  Health Registry.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#a9bb9d]/40" fill="currentColor" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[#5a6070] text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
              >
                Streamline pharmacogenomic testing by pulling patient profiles and encrypted VCF data directly from their Ayushman Bharat Health Account (ABHA).
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  onClick={scrollToSearch}
                  className="inline-flex items-center gap-2 bg-[#0b1e40] text-white px-8 py-4 rounded-xl font-bold tracking-wide transition-all duration-300 hover:bg-[#1a365d] shadow-lg shadow-[#0b1e40]/20 hover:-translate-y-1"
                >
                  Launch Terminal
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            WORKFLOW / ARCHITECTURE
        ════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#0b1e40] mb-4">How Federated Analysis Works</h2>
              <p className="text-[#5a6070] max-w-2xl mx-auto">
                GenomeGuard acts as a secure, stateless bridge between the national registry and your clinical decision support systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#a9bb9d]/10 via-[#a9bb9d] to-[#a9bb9d]/10 -translate-y-1/2 z-0" />

              {[
                { step: "01", icon: <UserCheck className="w-6 h-6" />, title: "ID Verification", desc: "Patient provides their 14-digit ABHA ID." },
                { step: "02", icon: <KeyRound className="w-6 h-6" />, title: "Consent Requested", desc: "User authorizes access via the ABDM framework." },
                { step: "03", icon: <Database className="w-6 h-6" />, title: "Data Retrieved", desc: "Encrypted VCF files are securely pulled to memory." },
                { step: "04", icon: <Zap className="w-6 h-6" />, title: "Live Analysis", desc: "Instant pharmacogenomic insights are generated." }
              ].map((item, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-[#f7faf5] border-4 border-white shadow-xl shadow-[#0b1e40]/5 flex items-center justify-center text-[#6b8760] mb-6 relative">
                    {item.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0b1e40] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1e40] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#5a6070] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            GATEWAY CONSOLE (Search)
        ════════════════════════════════════ */}
        <section ref={searchRef} className="py-20 bg-[#f7faf5] border-y border-[#a9bb9d]/10 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            
            {/* ⚠️ REPOSITIONED MOCK WARNING ⚠️ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-5 mb-12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#b45309] uppercase tracking-wider mb-1">
                  Beta Phase Integration Sandbox
                </h3>
                <p className="text-sm text-[#92400e] leading-relaxed">
                  The ABHA Gateway is currently operating in a sandbox environment using simulated patient registry data. It is not yet connected to the live ABDM production infrastructure.
                </p>
              </div>
            </motion.div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#0b1e40] mb-3">Lookup Patient Records</h2>
              <p className="text-[#5a6070]">Enter a 14-digit ABHA ID to initiate a secure federated query.</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border border-[#a9bb9d]/30 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(11,30,64,0.06)]"
            >
              <div className="relative mb-4 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a9bb9d] to-[#8fa88a] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-xl p-2 border border-[#e2e8f0]">
                  <div className="flex items-center gap-3 flex-1 px-4 py-2">
                    <Search className="w-6 h-6 text-[#a9bb9d]" />
                    <input
                      type="text"
                      value={formatAbha(abhaId)}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                      placeholder="XX-XXXX-XXXX-XXXX"
                      maxLength={17}
                      className="w-full bg-transparent text-xl sm:text-2xl font-mono font-bold text-[#0b1e40] placeholder:text-[#cbd5e1] focus:outline-none tracking-widest"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    onClick={handleLookup}
                    disabled={abhaId.length !== 14 || lookupLoading}
                    className={`shrink-0 px-8 py-4 sm:py-0 h-14 rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                      abhaId.length === 14 && !lookupLoading
                        ? "bg-[#0b1e40] hover:bg-[#1a365d] text-white shadow-md shadow-[#0b1e40]/20"
                        : "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"
                    }`}
                  >
                    {lookupLoading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      "Connect"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center px-4">
                <span className="text-xs text-[#94a3b8] font-mono font-medium">
                  {abhaId.length}/14 digits
                </span>
                {abhaId.length === 14 && (
                  <span className="text-xs text-[#6b8760] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Ready for secure lookup
                  </span>
                )}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-[#fef2f2] border border-[#fecaca] text-[#ef4444] text-sm rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </motion.div>

            {/* ════════════════════════════════════
                PATIENT RECORD
            ════════════════════════════════════ */}
            <AnimatePresence>
              {patient && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-8 overflow-hidden"
                >
                  <div className="bg-white border border-[#e2e8f0] rounded-[32px] shadow-xl overflow-hidden">
                    {/* Header Strip */}
                    <div className="bg-[#f7faf5] border-b border-[#e2e8f0] p-6 sm:px-10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#e6f2e8] flex items-center justify-center text-[#6b8760] font-bold text-xl border border-[#a9bb9d]/30">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-[#0b1e40]">{patient.name}</h2>
                          <p className="text-sm font-mono text-[#5a6070]">ABHA: {patient.abhaId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-white border border-[#e2e8f0] text-[#5a6070] rounded-md text-xs font-bold shadow-sm">
                          {patient.age} YRS
                        </span>
                        <span className="px-3 py-1 bg-white border border-[#e2e8f0] text-[#5a6070] rounded-md text-xs font-bold uppercase shadow-sm">
                          {patient.sex}
                        </span>
                        <span className="px-3 py-1 bg-[#fee2e2] text-[#ef4444] rounded-md text-xs font-bold shadow-sm">
                          {patient.bloodGroup}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Clinical Context */}
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold text-[#8fa88a] uppercase tracking-wider mb-4">
                            <Activity className="w-4 h-4 text-[#a9bb9d]" /> Clinical Context
                          </h3>
                          <div className="bg-[#f8fafc] p-5 rounded-2xl border border-[#e2e8f0] h-[130px]">
                            <p className="text-[#0b1e40] font-bold text-lg mb-2">{patient.condition}</p>
                            <p className="text-[#5a6070] text-sm leading-relaxed">{patient.description}</p>
                          </div>
                        </div>

                        {/* VCF Status */}
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold text-[#8fa88a] uppercase tracking-wider mb-4">
                            <Database className="w-4 h-4 text-[#a9bb9d]" /> Locker Data
                          </h3>
                          <div className="bg-[#f7faf5] p-5 rounded-2xl border border-[#a9bb9d]/30 flex items-start gap-4 h-[130px]">
                            <div className="mt-1 w-8 h-8 rounded-full bg-[#e6f2e8] flex items-center justify-center text-[#6b8760] shrink-0 border border-[#a9bb9d]/40">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[#0b1e40] font-bold text-sm mb-1">VCF Array Verified</p>
                              <p className="text-[#5a6070] text-xs leading-relaxed mb-3">
                                Genomic sequence retrieved securely from ABDM locker. Ready for local analysis.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {patient.markers.slice(0, 3).map(m => (
                                  <span key={m.gene} className="px-2 py-1 bg-white text-[#6b8760] text-[10px] font-mono font-bold rounded border border-[#a9bb9d]/30 shadow-sm">
                                    {m.gene}
                                  </span>
                                ))}
                                <span className="px-2 py-1 text-[#8fa88a] text-[10px] font-bold">+3 more</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={handleAnalyze}
                        disabled={analyzeLoading}
                        className="w-full bg-[#a9bb9d] text-white py-5 rounded-2xl font-bold text-base transition-all duration-300 hover:bg-[#8fa88a] hover:shadow-lg hover:shadow-[#a9bb9d]/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                      >
                        {analyzeLoading ? (
                          <>
                            <svg className="w-6 h-6 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Analyzing VCF Data...
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5" />
                            Generate Pharmacogenomic Summary
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ════════════════════════════════════
            FEATURES
        ════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <UserCheck className="w-6 h-6 text-[#6b8760]" />,
                  title: "Federated Identity",
                  desc: "Instantly verify identity and pull core clinical context securely."
                },
                {
                  icon: <Server className="w-6 h-6 text-[#6b8760]" />,
                  title: "Consent-Driven",
                  desc: "All health records are retrieved securely through the ABDM consent manager."
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-[#6b8760]" />,
                  title: "Zero Retention",
                  desc: "VCF files are analyzed strictly in memory and are never stored locally."
                }
              ].map((f, i) => (
                <div key={i} className="bg-[#f7faf5] p-8 rounded-3xl border border-[#a9bb9d]/20 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#0b1e40] mb-3">{f.title}</h3>
                  <p className="text-[#5a6070] leading-relaxed text-sm">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FAQ
        ════════════════════════════════════ */}
        <section className="py-24 bg-[#f7faf5] border-t border-[#a9bb9d]/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-[#0b1e40] mb-4 text-center">
              Gateway Integration FAQ
            </h2>
            <p className="text-[#5a6070] text-center mb-12 max-w-2xl mx-auto">
              Everything you need to know about how GenomeGuard interacts with the Ayushman Bharat Digital Mission.
            </p>
            <div className="bg-white rounded-3xl p-8 border border-[#a9bb9d]/20 shadow-sm">
              {FAQ_DATA.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
