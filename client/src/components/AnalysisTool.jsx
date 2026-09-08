"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "./FileUpload";
import DrugInput from "./DrugInput";
import {
  validateVCFFile,
  validateVCFContent,
  parseVCFFile,
  isCompressedVCF,
} from "@/utils/vcfValidator";
import { filterVCFInBrowser } from "@/utils/vcfClientFilter";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AnalysisTool() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [filterProgress, setFilterProgress] = useState(null);

  // Cache filter targets from backend (rsIDs + genes)
  const [filterTargets, setFilterTargets] = useState(null);

  // ── Sample patients ───────────────────────────────────────────────────────
  const [samplePatients, setSamplePatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(null); // patient ID being loaded
  const [showSamplePatients, setShowSamplePatients] = useState(false);
  const [showAllPatientsMobile, setShowAllPatientsMobile] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/sample-patients`)
      .then((r) => r.json())
      .then((data) => setSamplePatients(data.patients || []))
      .catch(() => {});
    // Pre-fetch filter targets
    fetch(`${BACKEND_URL}/api/filter-targets`)
      .then((r) => r.json())
      .then((data) => setFilterTargets(data))
      .catch(() => {});
  }, []);

  const handlePatientSelect = useCallback(
    async (patient) => {
      if (!isAuthenticated) {
        router.push("/login?returnTo=/#analyze");
        return;
      }
      if (patientLoading) return;
      setPatientLoading(patient.id);
      setFileError(null);
      setError(null);

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/sample-patients/${patient.id}/vcf`,
        );
        if (!res.ok) throw new Error("Failed to fetch patient VCF");

        const vcfText = await res.text();
        const blob = new Blob([vcfText], { type: "text/plain" });
        const vcfFile = new File([blob], `${patient.id}.vcf`, {
          type: "text/plain",
        });

        // Validate content
        const contentValidation = validateVCFContent(vcfText);
        if (!contentValidation.valid) {
          setFileError(contentValidation.error);
          setPatientLoading(null);
          return;
        }

        setFile(vcfFile);
        setSelectedPatient(patient);

        // Auto-select suggested drugs
        if (patient.suggested_drugs?.length > 0) {
          setDrugs(patient.suggested_drugs);
        }

        // Parse and store for client-side tools
        try {
          const variants = await parseVCFFile(vcfFile);
          sessionStorage.setItem("pgx_variants", JSON.stringify(variants));
        } catch (parseErr) {
          console.warn("Failed to parse VCF for local use:", parseErr);
        }
      } catch (err) {
        setFileError("Could not load sample patient data. Is the backend running?");
      } finally {
        setPatientLoading(null);
      }
    },
    [patientLoading, isAuthenticated, router],
  );

  // ── File handling ────────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!isAuthenticated) {
      router.push("/login?returnTo=/#analyze");
      return;
    }
    setFileError(null);
    setError(null);
    setSelectedPatient(null);

    // 1. Validate size + extension
    const validation = validateVCFFile(selectedFile);
    if (!validation.valid) {
      setFileError(validation.error);
      setFile(null);
      return;
    }

    // 2. Read & validate content
    // Skip content validation for compressed files — binary data can't be read as text
    const compressed = isCompressedVCF(selectedFile);
    try {
      const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50 MB
      const isLargeFile = selectedFile.size > LARGE_FILE_THRESHOLD;

      if (!compressed) {
        let headerText;
        if (isLargeFile) {
          const headerSlice = selectedFile.slice(0, 64 * 1024); // first 64 KB
          headerText = await headerSlice.text();
        } else {
          headerText = await selectedFile.text();
        }

        const contentValidation = validateVCFContent(headerText);
        if (!contentValidation.valid) {
          setFileError(contentValidation.error);
          setFile(null);
          return;
        }
      }
      setFile(selectedFile);

      // Parse and store for client-side tools (like Pill Scanner)
      // Skip full parsing for very large or compressed files — backend analysis handles them
      if (!isLargeFile && !compressed) {
        try {
          const variants = await parseVCFFile(selectedFile);
          sessionStorage.setItem("pgx_variants", JSON.stringify(variants));
          console.log("VCF variants stored for local use:", variants.length);
        } catch (parseErr) {
          console.warn("Failed to parse VCF for local use:", parseErr);
        }
      } else {
        console.log("Large/compressed VCF file — skipping client-side parsing, backend will handle analysis");
      }
    } catch {
      setFileError("Could not read the file. Please try again.");
    }
  }, [isAuthenticated, router]);

  const handleClearFile = useCallback(() => {
    setFile(null);
    setFileError(null);
    setError(null);
    setSelectedPatient(null);
  }, []);

  // ── Analysis ─────────────────────────────────────────────────────────────────
  const CLIENT_FILTER_THRESHOLD = 100 * 1024 * 1024; // 100 MB

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a VCF file before running the analysis.");
      return;
    }
    if (drugs.length === 0) {
      setError("Please select at least one drug to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentTargets = filterTargets;
      
      // If file is large but targets failed to load on mount (e.g. backend restarting), fetch them now
      if (file.size > CLIENT_FILTER_THRESHOLD && !currentTargets) {
        try {
          const r = await fetch(`${BACKEND_URL}/api/filter-targets`);
          if (r.ok) {
            currentTargets = await r.json();
            setFilterTargets(currentTargets);
          }
        } catch (e) {
          console.warn("Failed to fetch filter targets on demand", e);
        }
      }

      const isCompressed = file.name.toLowerCase().endsWith(".gz") || file.name.toLowerCase().endsWith(".bgz");
      const needsClientFilter = file.size > CLIENT_FILTER_THRESHOLD;

      if (needsClientFilter) {
        if (!currentTargets) {
          throw new Error("Unable to load analysis targets from server. Please refresh the page and try again.");
        }
        if (isCompressed && typeof DecompressionStream === "undefined") {
          throw new Error("Your browser does not support local decompression (DecompressionStream API). Please use Chrome, Edge, or a newer browser for large compressed files.");
        }

        // ═══ PATH A: Client-side filter for large files ═══
        const rsidSet = new Set(currentTargets.rsids);
        const geneSet = new Set(currentTargets.genes.map((g) => g.toUpperCase()));

        setFilterProgress(0);
        console.log(
          `[ClientFilter] Filtering ${(file.size / 1024 / 1024).toFixed(0)} MB file locally...`
        );

        const result = await filterVCFInBrowser(
          file,
          rsidSet,
          geneSet,
          (p) => setFilterProgress(p)
        );

        if (!result) {
          // DecompressionStream not supported — fall through to chunked upload
          console.warn("DecompressionStream not supported, falling back to chunked upload");
          setFilterProgress(null);
          await chunkedUploadAndAnalyze();
          return;
        }

        setFilterProgress(null);
        console.log(
          `[ClientFilter] Done! ${result.stats.matchedLines} matches from ${result.stats.totalLines} lines. ` +
          `Filtered size: ${result.stats.filteredSizeKB} KB (was ${result.stats.originalSizeMB} MB)`
        );

        // Upload the tiny filtered VCF directly to /analyze
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("vcf_file", result.blob, file.name.replace(/\.(gz|bgz)$/i, ""));
        formData.append("drugs", drugs.join(","));

        const res = await fetch(`${BACKEND_URL}/analyze`, {
          method: "POST",
          body: formData,
        });
        setUploadProgress(null);

        if (!res.ok) {
          let errMsg = `Server returned ${res.status}`;
          try {
            const errData = await res.json();
            errMsg = errData.error || errData.message || errMsg;
          } catch {}
          throw new Error(errMsg);
        }

        const finalData = await res.json();
        sessionStorage.setItem("genomeguard_results", JSON.stringify(finalData));
        router.push("/results");
        return;
      } else {
        // ═══ PATH B: Chunked upload for small files ═══
        await chunkedUploadAndAnalyze();
        return;
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError(
          "The analysis timed out. Large VCF files may take longer to process. Please try again or use a smaller file.",
        );
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Unable to reach the analysis server. Please ensure the backend is running at " +
            BACKEND_URL,
        );
      } else {
        setError(
          err.message || "An unexpected error occurred. Please try again.",
        );
      }
      setLoading(false);
      setUploadProgress(null);
      setFilterProgress(null);
    }
  };

  // ── Chunked upload path (for small files or fallback) ────────────────────────
  const chunkedUploadAndAnalyze = async () => {
    const fileId = crypto.randomUUID();
    const chunkSize = 1 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const CONCURRENCY = 8;

    let completedChunks = 0;
    setUploadProgress(0);

    const uploadChunk = async (i) => {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const chunkData = new FormData();
      chunkData.append("file_id", fileId);
      chunkData.append("chunk_index", i);
      chunkData.append("chunk", chunk, "chunk.vcf");

      const response = await fetch(`${BACKEND_URL}/upload-chunk`, {
        method: "POST",
        body: chunkData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload chunk ${i + 1} of ${totalChunks}`);
      }

      completedChunks++;
      setUploadProgress(Math.round((completedChunks / totalChunks) * 100));
    };

    for (let batch = 0; batch < totalChunks; batch += CONCURRENCY) {
      const batchEnd = Math.min(batch + CONCURRENCY, totalChunks);
      const promises = [];
      for (let i = batch; i < batchEnd; i++) {
        promises.push(uploadChunk(i));
      }
      await Promise.all(promises);
    }

    setUploadProgress(null);

    const startData = new FormData();
    startData.append("file_id", fileId);
    startData.append("filename", file.name);
    startData.append("total_chunks", totalChunks);
    startData.append("drugs", drugs.join(","));

    const startRes = await fetch(`${BACKEND_URL}/analyze/start`, {
      method: "POST",
      body: startData,
    });

    if (!startRes.ok) {
      let errMsg = `Server returned ${startRes.status}`;
      try {
        const errData = await startRes.json();
        errMsg = errData.error || errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const { job_id } = await startRes.json();

    let finalData = null;
    while (!finalData) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await fetch(`${BACKEND_URL}/analyze/status/${job_id}`);
      if (!statusRes.ok) throw new Error("Failed to check job status");

      const jobStatus = await statusRes.json();
      if (jobStatus.status === "completed") {
        finalData = jobStatus.result;
      } else if (jobStatus.status === "failed") {
        throw new Error(jobStatus.error || "Analysis job failed on server");
      }
    }

    sessionStorage.setItem("genomeguard_results", JSON.stringify(finalData));
    router.push("/results");
  };

  const canAnalyze = !!file && drugs.length > 0 && !loading;

  return (
    <section id="analyze" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#a9bb9d]/10 border border-[#a9bb9d]/30 text-[#5a7a52] text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            Analysis Tool
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b1e40] mb-4">
            Pharmacogenomic Risk Analyzer
          </h2>
          <p className="text-[#64748b] text-base max-w-xl mx-auto leading-relaxed">
            Upload your VCF file and select medications to receive personalized
            risk predictions.
          </p>
        </div>

        {/* ── Sample Patients ── */}
        {samplePatients.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowSamplePatients(!showSamplePatients)}
              className="group flex items-center gap-2 mx-auto text-xs font-semibold text-[#94a3b8] hover:text-[#5a7a52] transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              {showSamplePatients
                ? "Hide sample patients"
                : "Or choose from sample patients"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showSamplePatients ? "rotate-180" : ""}`}
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${showSamplePatients ? "max-h-[2500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}
            >
              <div className="bg-[#fafcf8] border border-[#a9bb9d]/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                    Sample Patients
                  </span>
                  <span className="text-[10px] text-[#c1c9be]">
                    — pre-loaded genetic profiles for quick analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {samplePatients.map((patient, index) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    const isLoading = patientLoading === patient.id;
                    const isHiddenOnMobile = !showAllPatientsMobile && index >= 5;
                    return (
                      <button
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        disabled={!!patientLoading}
                        className={`
                          relative text-left p-3 rounded-xl border transition-all duration-150 group
                          ${isHiddenOnMobile ? 'hidden sm:block' : 'block'}
                          ${
                            isSelected
                              ? "border-[#a9bb9d]/60 bg-[#a9bb9d]/10 shadow-sm"
                              : "border-[#a9bb9d]/15 hover:border-[#a9bb9d]/40 hover:bg-white/80"
                          }
                          ${patientLoading && !isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#a9bb9d] flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-2.5 h-2.5 text-white"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          </div>
                        )}
                        {isLoading && (
                          <div className="absolute top-2 right-2">
                            <svg
                              className="w-4 h-4 animate-spin text-[#a9bb9d]"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-[#a9bb9d]/20 text-[#5a7a52]" : "bg-[#a9bb9d]/8 text-[#94a3b8]"}`}
                          >
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div
                            className={`text-xs font-semibold truncate ${isSelected ? "text-[#5a7a52]" : "text-[#0b1e40]"}`}
                          >
                            {patient.name}
                          </div>
                        </div>
                        <div className="text-[10px] text-[#94a3b8] leading-snug line-clamp-2">
                          {patient.condition}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="text-[9px] text-[#b5c2ac] font-mono">
                            {patient.age}{patient.sex === "Male" ? "M" : "F"}
                          </span>
                          <span className="text-[9px] text-[#d1dbc9]">·</span>
                          <span className="text-[9px] text-[#b5c2ac]">
                            {patient.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!showAllPatientsMobile && samplePatients.length > 5 && (
                  <div className="mt-3 flex justify-center sm:hidden">
                    <button
                      onClick={() => setShowAllPatientsMobile(true)}
                      className="text-[11px] text-[#a9bb9d] font-medium border border-[#a9bb9d]/30 rounded-full px-5 py-1.5 hover:bg-[#a9bb9d]/10 transition-colors"
                    >
                      View All {samplePatients.length} Patients
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Selected patient banner ── */}
        {selectedPatient && file && (
          <div className="mb-5 flex items-center gap-3 p-3.5 bg-[#a9bb9d]/5 border border-[#a9bb9d]/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#a9bb9d]/15 flex items-center justify-center text-[#5a7a52] text-xs font-bold shrink-0">
              {selectedPatient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0b1e40]">
                {selectedPatient.name}
                <span className="font-normal text-[#94a3b8] ml-2 text-xs">
                  {selectedPatient.age}{selectedPatient.sex === "Male" ? "M" : "F"} · {selectedPatient.condition}
                </span>
              </p>
              <p className="text-[11px] text-[#94a3b8] mt-0.5 truncate">
                {selectedPatient.description}
              </p>
            </div>
            <button
              onClick={handleClearFile}
              className="shrink-0 text-[10px] font-semibold text-[#94a3b8] hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <FileUpload
            file={file}
            onFileSelect={handleFileSelect}
            error={fileError}
            onClear={handleClearFile}
            uploadProgress={uploadProgress}
            isAnalyzing={loading && uploadProgress === null && filterProgress === null}
            filterProgress={filterProgress}
          />
          <DrugInput drugs={drugs} onChange={setDrugs} />
        </div>

        {/* ── Global error ── */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold mb-0.5">Analysis Error</p>
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* ── Analyze Button ── */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`
            w-full py-4 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-3
            ${
              canAnalyze
                ? "bg-[#a9bb9d] hover:bg-[#8fa88a] text-white hover:shadow-xl hover:shadow-[#a9bb9d]/30 hover:-translate-y-0.5 cursor-pointer"
                : "bg-[#f0f7f4] border border-[#a9bb9d]/20 text-[#94a3b8] cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing Pharmacogenomic Risk...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              Analyze Pharmacogenomic Risk
              {!file && (
                <span className="text-xs font-normal opacity-70">
                  — upload a VCF file to continue
                </span>
              )}
              {file && drugs.length === 0 && (
                <span className="text-xs font-normal opacity-70">
                  — select at least one drug
                </span>
              )}
            </>
          )}
        </button>

        {/* Checklist indicator */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div
            className={`flex items-center gap-1.5 text-xs ${file ? "text-emerald-600" : "text-[#94a3b8]"}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              {file ? (
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V11.25A.75.75 0 0112 10.5zm0 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            VCF file {file ? "uploaded" : "required"}
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs ${drugs.length > 0 ? "text-emerald-600" : "text-[#94a3b8]"}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              {drugs.length > 0 ? (
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V11.25A.75.75 0 0112 10.5zm0 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            Drug{drugs.length !== 1 ? "s" : ""}{" "}
            {drugs.length > 0 ? `selected (${drugs.length})` : "required"}
          </div>
        </div>
      </div>
    </section>
  );
}
