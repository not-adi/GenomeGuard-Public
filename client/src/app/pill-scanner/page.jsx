"use client";

/**
 * pill-scanner/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * GenomeGuard Pill Scanner — Camera-based pharmacogenomics safety check.
 *
 * Architecture:
 *   Camera stream (getUserMedia) → Canvas frame capture (requestAnimationFrame)
 *   → Backend /api/ocr (pytesseract, native Tesseract 5) → pillScannerUtils
 *   assessRisk() → Visual overlay (CSS animations, flash/pulse/glow) → Result panel
 *
 * The VCF patient variants are pulled from sessionStorage (set by the existing
 * vcfValidator / pharmacogenomics.js integration). Key: "pgx_variants".
 * If absent, the scanner warns the user to upload their VCF first.
 *
 * OCR is performed server-side on the Python backend for significantly faster
 * processing compared to browser-based Tesseract.js / WASM.
 *
 * REDESIGNED: Side-by-side layout with live color-coded scan feed panel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  assessRisk,
  normalizeOcrText,
  extractDrugCandidates,
  findBestDrugMatch,
  formatScanResult,
  isCriticalRisk,
  isSafe,
} from "@/utils/pillScannerUtils";
import { parseVCFFile } from "@/utils/vcfValidator";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createWorker } from "tesseract.js";
import { get } from "idb-keyval";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Upload,
  FileText,
  Shield,
  Zap,
  Eye,
  ChevronDown,
  AlertTriangle,
  ScanLine,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SCAN_INTERVAL_MS = 800;
const MIN_OCR_CONFIDENCE = 50;
const RESULT_HOLD_MS = 6000;
const VIDEO_CONSTRAINTS = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
};

// ─── Scan state machine ───────────────────────────────────────────────────────
const SCAN_STATES = {
  IDLE: "idle",
  REQUESTING: "requesting",
  ACTIVE: "active",
  PROCESSING: "processing",
  RESULT: "result",
  ERROR: "error",
};

// ─── Risk color configuration ─────────────────────────────────────────────────
const RISK_CONFIG = {
  Safe: {
    label: "Safe",
    color: "#00e676",
    bg: "rgba(0, 230, 118, 0.08)",
    bgSolid: "#ecfdf5",
    border: "rgba(0, 230, 118, 0.25)",
    stripe: "#00e676",
    text: "#059669",
    badgeBg: "rgba(0, 230, 118, 0.12)",
    badgeText: "#059669",
    badgeBorder: "rgba(0, 230, 118, 0.3)",
    icon: "✅",
    dotPulse: true,
  },
  "Adjust Dosage": {
    label: "Adjust Dosage",
    color: "#ffab00",
    bg: "rgba(255, 171, 0, 0.06)",
    bgSolid: "#fffbeb",
    border: "rgba(255, 171, 0, 0.25)",
    stripe: "#ffab00",
    text: "#b45309",
    badgeBg: "rgba(255, 171, 0, 0.12)",
    badgeText: "#b45309",
    badgeBorder: "rgba(255, 171, 0, 0.3)",
    icon: "⚠️",
    dotPulse: true,
  },
  Toxic: {
    label: "Toxic",
    color: "#ff1744",
    bg: "rgba(255, 23, 68, 0.06)",
    bgSolid: "#fef2f2",
    border: "rgba(255, 23, 68, 0.25)",
    stripe: "#ff1744",
    text: "#dc2626",
    badgeBg: "rgba(255, 23, 68, 0.12)",
    badgeText: "#dc2626",
    badgeBorder: "rgba(255, 23, 68, 0.3)",
    icon: "🚨",
    dotPulse: true,
  },
  Ineffective: {
    label: "Ineffective",
    color: "#ff6d00",
    bg: "rgba(255, 109, 0, 0.06)",
    bgSolid: "#fff7ed",
    border: "rgba(255, 109, 0, 0.25)",
    stripe: "#ff6d00",
    text: "#ea580c",
    badgeBg: "rgba(255, 109, 0, 0.12)",
    badgeText: "#ea580c",
    badgeBorder: "rgba(255, 109, 0, 0.3)",
    icon: "⛔",
    dotPulse: true,
  },
  Unknown: {
    label: "Unknown",
    color: "#78909c",
    bg: "rgba(120, 144, 156, 0.05)",
    bgSolid: "#f8fafc",
    border: "rgba(120, 144, 156, 0.2)",
    stripe: "#78909c",
    text: "#64748b",
    badgeBg: "rgba(120, 144, 156, 0.1)",
    badgeText: "#64748b",
    badgeBorder: "rgba(120, 144, 156, 0.25)",
    icon: "❓",
    dotPulse: false,
  },
};

function getRiskConfig(riskLabel) {
  return RISK_CONFIG[riskLabel] || RISK_CONFIG.Unknown;
}

/* ── FAQ Data ── */
const FAQ_DATA = [
  {
    q: "How does the pill scanner work?",
    a: "Point your camera at a medication label or pill bottle. Our OCR engine reads the drug name, then cross-references it against your pharmacogenomic profile to determine if the drug is safe, needs dose adjustment, or could be dangerous for you specifically.",
  },
  {
    q: "Do I need to upload my VCF first?",
    a: "Yes — the scanner needs your genetic variant data to personalize risk assessments. You can upload a VCF file directly on this page, or it will auto-load from a previous analysis session or your profile.",
  },
  {
    q: "What drugs can it detect?",
    a: "The scanner covers all major pharmacogenomically relevant drugs — including common painkillers, antidepressants, blood thinners, statins, chemotherapy agents, and immunosuppressants. If a drug isn't in our database, it will be marked as 'Unknown'.",
  },
  {
    q: "Is the scanning done on my device or a server?",
    a: "We try backend OCR first for speed and accuracy (using Tesseract 5). If the backend is unreachable, the scanner automatically falls back to in-browser OCR via Tesseract.js. Either way, raw images are never stored.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Absolutely. The scanner is optimized for mobile cameras, especially rear-facing ones. For best results, hold the label steady in good lighting and use the torch/flashlight toggle if needed.",
  },
  {
    q: "What if the scanner struggles to read a label?",
    a: "If the text isn't picking up, try repositioning the bottle, turning on the torch, or holding it steady. You can also press 'Force Scan' to manually capture a frame. For blurry labels, our manual search tool is always an alternative.",
  },
  {
    q: "How secure is my genetic data during a scan?",
    a: "Your VCF data never leaves your browser. All pharmacogenomic cross-referencing happens locally on your device. Only the image frame of the pill label is temporarily sent to our backend for OCR, and it is instantly discarded.",
  },
];

/* ── FAQ Item ── */
function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="border-b border-[#0b1e40]/6 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-medium text-[#0b1e40] pr-8 group-hover:text-[#5a7a52] transition-colors">
          {item.q}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#a9bb9d] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
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
            <p className="pb-5 text-sm text-[#5a6070] leading-relaxed pr-12">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PillScannerPage() {
  const { walletAddress } = useAuth();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const resultTimerRef = useRef(null);
  const animFrameRef = useRef(null);
  const feedScrollRef = useRef(null);
  const vcfInputRef = useRef(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [assessment, setAssessment] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [patientVariants, setPatientVariants] = useState([]);
  const [vcfLoaded, setVcfLoaded] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [cameraPermission, setCameraPermission] = useState("unknown");
  const [ocrReady, setOcrReady] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [flashActive, setFlashActive] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [vcfSource, setVcfSource] = useState("");
  const [vcfLoadingSource, setVcfLoadingSource] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    safe: 0,
    warning: 0,
    danger: 0,
  });

  // ── Auto-load VCF silently from analysis or profile on mount ────────────
  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem("pgx_variants") ||
        localStorage.getItem("pgx_variants") ||
        sessionStorage.getItem("patientVariants") ||
        localStorage.getItem("patientVariants");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPatientVariants(parsed);
          setVcfLoaded(true);
          setVcfSource("analysis");
          return;
        }
      }
    } catch { }

    if (walletAddress) {
      get(`pg_vcf_${walletAddress}`)
        .then((files) => {
          if (files && files.length > 0) {
            const entry = files[0];
            fetch(entry.content)
              .then((r) => r.blob())
              .then((blob) => new File([blob], entry.fileName, { type: "text/plain" }))
              .then((file) => parseVCFFile(file))
              .then((variants) => {
                if (variants.length > 0) {
                  setPatientVariants(variants);
                  setVcfLoaded(true);
                  setVcfSource("profile");
                  sessionStorage.setItem("pgx_variants", JSON.stringify(variants));
                }
              })
              .catch(() => { });
          }
        })
        .catch(() => { });
    }
  }, [walletAddress]);

  // ── Load VCF from direct file upload ──────────────────────────────────
  const handleDirectUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVcfLoadingSource(true);
    try {
      const variants = await parseVCFFile(file);
      if (variants.length > 0) {
        setPatientVariants(variants);
        setVcfLoaded(true);
        setVcfSource("upload");
        sessionStorage.setItem("pgx_variants", JSON.stringify(variants));
      }
    } catch (err) {
      console.error("[PillScanner] Upload VCF parse error:", err);
    }
    setVcfLoadingSource(false);
    if (vcfInputRef.current) vcfInputRef.current.value = "";
  }, []);

  // ── 2. Check backend OCR health ──
  const checkOcrBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`, { method: "GET" });
      if (res.ok) {
        console.log("[PillScanner] Backend OCR ready");
      } else {
        console.warn("[PillScanner] Backend health check returned", res.status);
      }
    } catch (err) {
      console.warn("[PillScanner] Backend not reachable — will use browser OCR:", err.message);
    }
    setOcrReady(true);
  }, []);

  useEffect(() => {
    checkOcrBackend();
  }, [checkOcrBackend]);

  // ── 3. Camera lifecycle ───────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setScanState(SCAN_STATES.REQUESTING);
    setErrorMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Camera API not available. Please use a modern browser.");
      setScanState(SCAN_STATES.ERROR);
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanState(SCAN_STATES.ACTIVE);
      startScanLoop();
    } catch (err) {
      console.error("[PillScanner] Camera error:", err);
      setCameraPermission("denied");

      if (err.name === "NotAllowedError") {
        setErrorMessage(
          "Camera permission denied. Please allow camera access and try again.",
        );
      } else if (err.name === "NotFoundError") {
        setErrorMessage("No camera detected on this device.");
      } else {
        setErrorMessage(`Camera error: ${err.message}`);
      }

      setScanState(SCAN_STATES.ERROR);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    clearInterval(scanIntervalRef.current);
    clearTimeout(resultTimerRef.current);
    cancelAnimationFrame(animFrameRef.current);

    if (videoRef.current) videoRef.current.srcObject = null;
    setScanState(SCAN_STATES.IDLE);
  }, []);

  useEffect(() => () => {
    stopCamera();
    tesseractWorkerRef.current?.terminate().catch(() => { });
  }, [stopCamera]);

  // ── 4. Torch / flashlight toggle ─────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()?.[0];
    if (!track) return;

    const capabilities = track.getCapabilities?.() || {};
    if (!capabilities.torch) return;

    const newState = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: newState }] });
      setTorchOn(newState);
    } catch (e) {
      console.warn("[PillScanner] Torch not supported:", e);
    }
  }, [torchOn]);

  // ── 5. Frame capture + OCR pipeline ──────────────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const cropX = canvas.width * 0.1;
    const cropY = canvas.height * 0.2;
    const cropW = canvas.width * 0.8;
    const cropH = canvas.height * 0.6;

    const croppedData = ctx.getImageData(cropX, cropY, cropW, cropH);

    const data = croppedData.data;
    let totalLuminance = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      totalLuminance += gray;
    }

    const avgLuminance = totalLuminance / pixelCount;
    const threshold = avgLuminance * 0.85;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i];
      let val = (gray - threshold) * 3 + 128;
      val = Math.max(0, Math.min(255, val));
      data[i] = data[i + 1] = data[i + 2] = val;
    }

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = cropW;
    tmpCanvas.height = cropH;
    tmpCanvas.getContext("2d").putImageData(croppedData, 0, 0);

    return tmpCanvas.toDataURL("image/png");
  }, []);

  // ── 5b. OCR: try backend first, fall back to browser Tesseract.js ──────
  const tesseractWorkerRef = useRef(null);

  const runOcr = useCallback(async (imageBase64) => {
    if (!imageBase64) return null;

    try {
      setProcessingProgress(30);

      const res = await fetch(`${API_URL}/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      setProcessingProgress(80);

      if (res.ok) {
        const result = await res.json();
        setProcessingProgress(100);
        console.log(
          `[PillScanner] Backend OCR: ${result.processing_ms?.toFixed(0)}ms, confidence: ${result.confidence}`,
        );
        return {
          text: result.text,
          filteredText: result.filteredText || result.text,
          confidence: result.confidence,
        };
      }

      console.warn("[PillScanner] Backend OCR unavailable, using browser Tesseract.js");
    } catch (err) {
      console.warn("[PillScanner] Backend OCR fetch failed, falling back:", err.message);
    }

    // ── Browser-side Tesseract.js fallback ──
    try {
      if (!tesseractWorkerRef.current) {
        const worker = await createWorker("eng");
        tesseractWorkerRef.current = worker;
      }

      setProcessingProgress(50);

      const { data } = await tesseractWorkerRef.current.recognize(imageBase64);

      setProcessingProgress(100);

      console.log(`[PillScanner] Browser OCR: confidence ${data.confidence}`);

      const words = data.words || [];
      const highConf = words.filter((w) => w.confidence >= 50).map((w) => w.text);

      return {
        text: data.text,
        filteredText: highConf.length > 0 ? highConf.join(" ") : data.text,
        confidence: data.confidence,
      };
    } catch (err) {
      console.error("[PillScanner] Browser OCR also failed:", err);
      return null;
    }
  }, []);

  const processScan = useCallback(async () => {
    if (scanState === SCAN_STATES.PROCESSING || !ocrReady) return;

    setScanState(SCAN_STATES.PROCESSING);
    setProcessingProgress(0);

    const frame = captureFrame();
    if (!frame) {
      setScanState(SCAN_STATES.ACTIVE);
      return;
    }

    const ocrResult = await runOcr(frame);

    if (!ocrResult || !ocrResult.filteredText?.trim()) {
      setScanState(SCAN_STATES.ACTIVE);
      return;
    }

    const rawText = ocrResult.filteredText || ocrResult.text;
    const candidates = extractDrugCandidates(normalizeOcrText(rawText));

    if (candidates.length > 0) {
      setOcrRawText(
        `✅ CANDIDATES: ${candidates.join(", ")}\n\nRAW: ${rawText.substring(0, 100)}...`,
      );
    } else {
      setOcrRawText(`❌ NO DRUGS FOUND\n\nRAW: ${rawText.substring(0, 50)}...`);
    }

    const match = findBestDrugMatch(candidates);

    if (match.confidence < 0.4) {
      setScanState(SCAN_STATES.ACTIVE);
      return;
    }

    const result = assessRisk(rawText, patientVariants);
    setAssessment(result);

    const historyEntry = {
      id: Date.now() + Math.random(),
      ...result,
      scanTime: new Date().toLocaleTimeString(),
    };

    setScanHistory((prev) => [historyEntry, ...prev].slice(0, 20));

    const riskLabel = result.risk_assessment?.risk_label;
    setSessionStats((prev) => ({
      total: prev.total + 1,
      safe: prev.safe + (riskLabel === "Safe" ? 1 : 0),
      warning: prev.warning + (riskLabel === "Adjust Dosage" ? 1 : 0),
      danger:
        prev.danger + (["Toxic", "Ineffective"].includes(riskLabel) ? 1 : 0),
    }));

    if (isCriticalRisk(result)) {
      triggerFlash(result.visualSignal);
    }

    setScanState(SCAN_STATES.RESULT);

    setTimeout(() => {
      feedScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    resultTimerRef.current = setTimeout(() => {
      setScanState(SCAN_STATES.ACTIVE);
      setAssessment(null);
      setOcrRawText("");
    }, RESULT_HOLD_MS);
  }, [scanState, ocrReady, captureFrame, runOcr, patientVariants]);

  // ── 6. Flash effect ───────────────────────────────────────────────────────
  const triggerFlash = useCallback((signal) => {
    if (!signal?.flash) return;

    let count = 0;
    const maxFlashes = signal.severity === "critical" ? 8 : 4;
    const flashInterval = setInterval(() => {
      setFlashActive((v) => !v);
      count++;
      if (count >= maxFlashes * 2) clearInterval(flashInterval);
    }, 150);
  }, []);

  // ── 7. Scan loop ──────────────────────────────────────────────────────────
  const startScanLoop = useCallback(() => {
    scanIntervalRef.current = setInterval(() => {
      if (
        scanState !== SCAN_STATES.PROCESSING &&
        scanState !== SCAN_STATES.RESULT
      ) {
        processScan();
      }
    }, SCAN_INTERVAL_MS);
  }, [processScan, scanState]);

  useEffect(() => {
    if (scanState === SCAN_STATES.ACTIVE) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = setInterval(processScan, SCAN_INTERVAL_MS);
    }
    return () => clearInterval(scanIntervalRef.current);
  }, [scanState, processScan]);

  // ── 8. Manual scan trigger ────────────────────────────────────────────────
  const handleManualScan = useCallback(() => {
    if (scanState === SCAN_STATES.ACTIVE) {
      processScan();
    }
  }, [scanState, processScan]);

  // ─── Derived display values ───────────────────────────────────────────────
  const signal = assessment?.visualSignal;
  const isScanning = scanState === SCAN_STATES.ACTIVE;
  const isProcessing = scanState === SCAN_STATES.PROCESSING;
  const hasResult = scanState === SCAN_STATES.RESULT && assessment;
  const cameraActive = [
    SCAN_STATES.ACTIVE,
    SCAN_STATES.PROCESSING,
    SCAN_STATES.RESULT,
  ].includes(scanState);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <style>{`
        @keyframes scan-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes card-enter {
          from { transform: translateY(-8px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes expand-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flash-bar {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes crosshairPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }
        .hero-bg {
          background-image: radial-gradient(circle at 80% 20%, rgba(169, 187, 157, 0.08) 0%, transparent 40%),
                            radial-gradient(circle at 20% 80%, rgba(11, 30, 64, 0.04) 0%, transparent 40%);
        }
        .scanner-viewport {
          aspect-ratio: 16/10;
          min-height: 220px;
          max-height: 650px;
        }
        @media (min-width: 640px) {
          .scanner-viewport {
            min-height: 350px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#f8faf7] flex flex-col" style={{ fontFamily: "'Mulish', sans-serif" }}>
        {/* ── Global flash overlay ── */}
        {flashActive && (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 9999,
              backgroundColor: signal?.color || "#ff1744",
              opacity: 0.35,
              transition: "opacity 0.15s ease-out"
            }}
          />
        )}

        <NavBar />

        {/* ════════════════════════════════════════════════════════════════════
            HEADER SECTION (Permanent)
        ════════════════════════════════════════════════════════════════════ */}
        <section className="pt-4 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full hero-bg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-8 border-b border-[#0b1e40]/10 pb-4 sm:pb-8">
            <div className="max-w-2xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#a9bb9d]/15 text-[#5a7a52] text-xs font-bold tracking-wide uppercase mb-3 sm:mb-5"
              >
                <Zap className="w-3.5 h-3.5" />
                Real-Time Analysis
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0b1e40] tracking-tight mb-2 sm:mb-4"
              >
                Point. Scan. <span className="text-[#a9bb9d]">Know.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#5a6070] text-sm sm:text-base md:text-lg max-w-xl font-light leading-relaxed"
              >
                Instant pharmacogenomic safety checks. Aim your camera at any medication label to see if it matches your unique genetic profile.
              </motion.p>
            </div>
            
            {/* VCF Status Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="shrink-0 w-full md:w-auto relative z-10"
            >
              {!vcfLoaded ? (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/60 shadow-sm flex flex-col gap-2 sm:gap-3 min-w-0 sm:min-w-[280px]">
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Missing VCF Data
                  </div>
                  <p className="text-xs text-[#5a6070] leading-relaxed">
                    Upload your genetic data to personalize drug risk results.
                  </p>
                  <label className="mt-1 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0b1e40] hover:bg-[#162d5c] text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    {vcfLoadingSource ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {vcfLoadingSource ? "Loading..." : "Upload VCF File"}
                    <input
                      ref={vcfInputRef}
                      type="file"
                      accept=".vcf"
                      onChange={handleDirectUpload}
                      className="sr-only"
                      disabled={vcfLoadingSource}
                    />
                  </label>
                </div>
              ) : (
                <div className="bg-[#a9bb9d]/10 rounded-2xl p-4 sm:p-5 border border-[#a9bb9d]/30 shadow-sm flex flex-col gap-3 sm:gap-4 min-w-0 sm:min-w-[280px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#5a7a52] text-sm font-bold">
                      <Shield className="w-4 h-4" />
                      Profile Active
                    </div>
                    <button
                      onClick={() => { setVcfLoaded(false); setPatientVariants([]); setVcfSource(""); }}
                      className="text-[10px] text-[#5a7a52]/60 hover:text-[#5a7a52] uppercase font-bold tracking-wider transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0b1e40] font-bold bg-white/70 px-4 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(11,30,64,0.02)]">
                    <FileText className="w-4 h-4 text-[#a9bb9d]" />
                    {patientVariants.length} variants loaded
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            MAIN SCANNER WORKSPACE (Permanent Split Layout)
        ════════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* ─── LEFT: Camera Viewport ─── */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              <div
                className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-[#0b1e40] shadow-xl border border-[#0b1e40]/10 scanner-viewport"
                style={{
                  boxShadow: hasResult && signal ? signal.borderGlow : "0 20px 40px -10px rgba(11,30,64,0.15)",
                  transition: "box-shadow 0.4s ease"
                }}
              >
                {/* The Video Element */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                  autoPlay
                  style={{
                    opacity: cameraActive ? 1 : 0,
                    transition: "opacity 0.6s ease"
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* IDLE OVERLAY - Shown when camera is inactive */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-gradient-to-br from-[#0b1e40] to-[#162d5c] z-10">
                    <div className="relative mb-4 sm:mb-8">
                      <div className="absolute inset-0 bg-[#a9bb9d] rounded-full blur-2xl opacity-20 animate-pulse" />
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl border-2 border-[#a9bb9d]/30 bg-[#0b1e40]/50 backdrop-blur-md flex items-center justify-center relative z-10 shadow-2xl">
                        <ScanLine className="w-7 h-7 sm:w-10 sm:h-10 text-[#a9bb9d]" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    {scanState === SCAN_STATES.ERROR ? (
                      <div className="max-w-sm">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Camera Error</h3>
                        <p className="text-white/60 text-sm mb-6">{errorMessage}</p>
                        <button
                          onClick={startCamera}
                          className="px-6 py-2.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Scanner Idle</h3>
                        <p className="text-[#a9bb9d]/80 text-xs sm:text-sm max-w-md mb-4 sm:mb-8 leading-relaxed font-medium px-2">
                          <span className="hidden sm:inline">Place a medication bottle or blister pack in a well-lit area. The OCR engine will automatically detect drug names and cross-reference them with your genetics.</span>
                          <span className="sm:hidden">Place a medication bottle in a well-lit area to automatically detect drug names.</span>
                        </p>
                        <button
                          onClick={startCamera}
                          disabled={!ocrReady}
                          className="group flex items-center gap-2 sm:gap-3 bg-[#a9bb9d] hover:bg-[#8fa88a] text-[#0b1e40] px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-[15px] transition-all duration-300 shadow-[0_0_30px_rgba(169,187,157,0.3)] hover:shadow-[0_0_40px_rgba(169,187,157,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!ocrReady ? (
                            <>
                              <div className="w-4 h-4 border-2 border-[#0b1e40]/30 border-t-[#0b1e40] rounded-full animate-spin" />
                              Connecting to Engine...
                            </>
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              Activate Camera
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* ACTIVE OVERLAY - Targeting Box & Animations */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                    
                    {/* Clear Aiming Viewport in Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="relative w-[80%] h-[55%] rounded-2xl transition-all duration-300 backdrop-blur-none"
                        style={{
                          border: `2px solid ${hasResult && signal ? signal.color : "rgba(255,255,255,0.4)"}`,
                          boxShadow: hasResult && signal ? `0 0 40px ${signal.color}50, inset 0 0 20px ${signal.color}20` : "0 0 0 9999px rgba(0,0,0,0.5)",
                          backgroundColor: hasResult && signal ? signal.bgOverlay : "transparent",
                        }}
                      >
                        {/* Corner Accents */}
                        <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-xl" style={{ borderColor: hasResult && signal ? signal.color : "white" }} />
                        <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-xl" style={{ borderColor: hasResult && signal ? signal.color : "white" }} />
                        <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-xl" style={{ borderColor: hasResult && signal ? signal.color : "white" }} />
                        <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-xl" style={{ borderColor: hasResult && signal ? signal.color : "white" }} />
                        
                        {/* Scanning Laser Line */}
                        {isScanning && (
                          <div
                            className="absolute left-0 right-0 h-0.5 bg-[#4fc3f7] shadow-[0_0_12px_#4fc3f7]"
                            style={{ animation: "scan-line 2s ease-in-out infinite" }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Top Status Badges */}
                    <div className="absolute top-5 left-5 flex gap-3">
                      {isProcessing ? (
                        <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
                          <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                          <span className="text-white text-[11px] font-bold tracking-widest uppercase">
                            Analyzing {processingProgress > 0 ? `${processingProgress}%` : ""}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-[#4fc3f7] shadow-[0_0_8px_#4fc3f7] animate-pulse" />
                          <span className="text-white text-[11px] font-bold tracking-widest uppercase">Scanning</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Scan Count Badge */}
                    {scanHistory.length > 0 && (
                      <div className="absolute top-5 right-5">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
                          <span className="text-white text-[11px] font-bold tracking-widest uppercase">
                            <span className="text-[#a9bb9d]">{scanHistory.length}</span> Scanned
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Floating Result Popup */}
                    <AnimatePresence>
                      {hasResult && signal && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-5 inset-x-5 flex justify-center"
                        >
                          <div
                            className="bg-black/85 backdrop-blur-2xl border rounded-2xl p-4 flex items-center gap-4 max-w-lg w-full shadow-2xl"
                            style={{ borderColor: `${signal.color}40` }}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                              style={{ backgroundColor: `${signal.color}20`, borderColor: `${signal.color}40` }}
                            >
                              {signal.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="text-white font-bold text-lg tracking-tight truncate">{assessment.drug}</h4>
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                                  style={{ backgroundColor: `${signal.color}30`, color: signal.color }}
                                >
                                  {signal.label}
                                </span>
                              </div>
                              <p className="text-white/60 text-xs line-clamp-1 font-medium">{assessment.clinical_recommendation?.mechanism}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xl font-bold tabular-nums" style={{ color: signal.color }}>
                                {Math.round(assessment.risk_assessment.confidence_score * 100)}<span className="text-xs font-medium">%</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar (Only when active) */}
              {cameraActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-2xl border border-[#0b1e40]/10 shadow-sm"
                >
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-sm bg-red-600" /> Stop
                  </button>
                  <div className="hidden sm:block w-px h-8 bg-[#0b1e40]/10" />
                  <button
                    onClick={handleManualScan}
                    disabled={isProcessing}
                    className="flex flex-1 min-w-[150px] items-center justify-center gap-2 px-8 py-3 bg-[#0b1e40] hover:bg-[#162d5c] text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ScanLine className="w-4 h-4" />
                    )}
                    Force Scan
                  </button>
                  <div className="hidden sm:block w-px h-8 bg-[#0b1e40]/10" />
                  <button
                    onClick={toggleTorch}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors ${torchOn ? "bg-amber-100 text-amber-700" : "text-[#5a6070] hover:bg-neutral-100"}`}
                  >
                    <Lightbulb className="w-4 h-4" /> {torchOn ? "Torch On" : "Torch"}
                  </button>
                </motion.div>
              )}

              {/* Expanded Result Detail Below Camera */}
              <AnimatePresence>
                {hasResult && assessment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border overflow-hidden shadow-sm bg-white mt-2" style={{ borderColor: `${signal?.color}30` }}>
                      <div
                        className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
                        style={{ background: `linear-gradient(135deg, ${signal?.color}10, ${signal?.color}04)`, borderBottom: `1px solid ${signal?.color}25` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl drop-shadow-sm">{signal?.emoji}</span>
                          <div>
                            <h2 className="font-bold text-[#0b1e40] text-lg tracking-tight">{assessment.drug}</h2>
                            <p className="text-xs text-[#5a6070] font-medium">
                              Detected via {assessment.ocrMatchType} match · {Math.round(assessment.ocrConfidence * 100)}% confidence
                            </p>
                          </div>
                        </div>
                        <span
                          className="px-4 py-2 rounded-xl text-xs font-bold"
                          style={{
                            backgroundColor: `${signal?.color}18`,
                            color: signal?.color === "#00e676" ? "#059669" : signal?.color,
                            border: `1px solid ${signal?.color}30`
                          }}
                        >
                          {assessment.risk_assessment.risk_label}
                        </span>
                      </div>

                      <div className="divide-y divide-[#0b1e40]/5">
                        {/* Genes affected */}
                        {assessment.pharmacogenomic_profile.genes_involved.length > 0 && (
                          <div className="px-6 py-4">
                            <p className="text-[10px] font-bold text-[#5a6070]/50 uppercase tracking-widest mb-3">Pharmacogenes Involved</p>
                            <div className="flex gap-2 flex-wrap">
                              {assessment.pharmacogenomic_profile.genes_involved.map((g) => (
                                <span key={g} className="px-3 py-1.5 bg-[#0b1e40]/5 text-[#0b1e40] rounded-lg text-xs font-mono font-bold border border-[#0b1e40]/10">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Variant hits */}
                        {assessment.pharmacogenomic_profile.variant_hits.length > 0 && (
                          <div className="px-6 py-4">
                            <p className="text-[10px] font-bold text-[#5a6070]/50 uppercase tracking-widest mb-3">Detected Risk Variants</p>
                            <div className="grid gap-2">
                              {assessment.pharmacogenomic_profile.variant_hits.map((hit, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#0b1e40]/5 bg-[#f8faf7]">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${signal?.color}15` }}>
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: signal?.color }} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm font-bold text-[#0b1e40]">{hit.gene}</span>
                                      <span className="text-[#5a6070]/30">/</span>
                                      <span className="font-mono text-sm font-bold" style={{ color: signal?.color === "#00e676" ? "#059669" : signal?.color }}>
                                        {hit.matchedAlleles.join(", ")}
                                      </span>
                                    </div>
                                    {hit.rsids.length > 0 && (
                                      <span className="text-[10px] text-[#5a6070]/60 font-mono mt-0.5 block">{hit.rsids.join(", ")}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendation */}
                        <div className="px-6 py-4" style={{ backgroundColor: `${signal?.color}04` }}>
                          <p className="text-[10px] font-bold text-[#5a6070]/50 uppercase tracking-widest mb-2">Clinical Recommendation</p>
                          <p className="text-[15px] leading-relaxed font-bold" style={{ color: signal?.color === "#00e676" ? "#059669" : signal?.color }}>
                            {assessment.clinical_recommendation.recommendation}
                          </p>
                        </div>
                        
                        {/* Mechanism */}
                        <div className="px-6 py-4">
                          <p className="text-[10px] font-bold text-[#5a6070]/50 uppercase tracking-widest mb-2">Mechanism of Action</p>
                          <p className="text-sm text-[#5a6070] leading-relaxed font-medium">
                            {assessment.clinical_recommendation.mechanism}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OCR debug */}
              {ocrRawText && (
                <details className="mt-4 rounded-xl border border-dashed border-[#0b1e40]/15 bg-white">
                  <summary className="px-4 py-3 text-xs text-[#5a6070]/50 font-bold tracking-wider uppercase cursor-pointer select-none hover:bg-neutral-50 rounded-xl transition-colors">
                    Developer OCR Output
                  </summary>
                  <div className="px-4 py-4 border-t border-[#0b1e40]/5 bg-[#f8faf7] rounded-b-xl">
                    <p className="font-mono text-xs text-[#5a6070] whitespace-pre-wrap break-all leading-relaxed">
                      {ocrRawText}
                    </p>
                  </div>
                </details>
              )}
            </div>

            {/* ─── RIGHT: Live Scan Feed Panel ─── */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 h-full">
              <div className="bg-white rounded-[2rem] border border-[#0b1e40]/10 shadow-xl shadow-[#0b1e40]/[0.03] flex flex-col h-full lg:h-[650px] overflow-hidden lg:sticky top-24">
                
                {/* Panel Header */}
                <div className="p-5 border-b border-[#0b1e40]/5 bg-[#f8faf7] flex items-center justify-between shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a9bb9d]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#0b1e40]/10 flex items-center justify-center shadow-sm">
                      <FileText className="w-4 h-4 text-[#0b1e40]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0b1e40] text-[15px]">Scan History</h3>
                      <p className="text-[10px] text-[#5a6070] font-bold uppercase tracking-widest mt-0.5">Session Log</p>
                    </div>
                  </div>
                  
                  {scanHistory.length > 0 && (
                    <button
                      onClick={() => {
                        setScanHistory([]);
                        setSessionStats({ total: 0, safe: 0, warning: 0, danger: 0 });
                        setExpandedCard(null);
                      }}
                      className="text-[11px] font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-3 py-2 rounded-lg transition-colors relative z-10"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                {/* Session Stats Mini Bar */}
                {sessionStats.total > 0 && (
                  <div className="px-5 py-3 border-b border-[#0b1e40]/5 bg-white shrink-0">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#5a6070]/60 mb-2">
                      <span>Total Scans: {sessionStats.total}</span>
                    </div>
                    <div className="flex items-center gap-1 h-2">
                      {sessionStats.safe > 0 && (
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sessionStats.safe / sessionStats.total) * 100}%`, backgroundColor: "#00e676", minWidth: "10px" }} />
                      )}
                      {sessionStats.warning > 0 && (
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sessionStats.warning / sessionStats.total) * 100}%`, backgroundColor: "#ffab00", minWidth: "10px" }} />
                      )}
                      {sessionStats.danger > 0 && (
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(sessionStats.danger / sessionStats.total) * 100}%`, backgroundColor: "#ff1744", minWidth: "10px" }} />
                      )}
                      {(sessionStats.total - sessionStats.safe - sessionStats.warning - sessionStats.danger > 0) && (
                        <div className="h-full rounded-full bg-[#e2e8f0] transition-all duration-500" style={{ width: `${((sessionStats.total - sessionStats.safe - sessionStats.warning - sessionStats.danger) / sessionStats.total) * 100}%`, minWidth: "10px" }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Feed Content */}
                <div ref={feedScrollRef} className="flex-1 overflow-y-auto p-4 bg-[#f8faf7]/50 overscroll-contain min-h-[400px]">
                  {scanHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 mt-12 mb-12">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#0b1e40]/5 shadow-sm flex items-center justify-center mb-4">
                        <ScanLine className="w-6 h-6 text-[#a9bb9d]" />
                      </div>
                      <p className="text-[15px] font-bold text-[#0b1e40] mb-2">No drugs scanned</p>
                      <p className="text-xs text-[#5a6070] max-w-[200px] leading-relaxed">
                        Activate the camera and scan a medication label to see results here.
                      </p>
                      
                      {/* Color Legend for Empty State */}
                      <div className="mt-10 w-full">
                        <p className="text-[9px] font-bold text-[#5a6070]/40 uppercase tracking-widest mb-3">Color Legend</p>
                        <div className="space-y-2 text-left">
                          {[
                            { label: "Safe — No risk detected", color: "#00e676", icon: "✅" },
                            { label: "Adjust Dosage — Caution", color: "#ffab00", icon: "⚠️" },
                            { label: "Toxic — Dangerous", color: "#ff1744", icon: "🚨" },
                            { label: "Ineffective — Won't work", color: "#ff6d00", icon: "⛔" },
                            { label: "Unknown — No PGx data", color: "#78909c", icon: "❓" },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-[#0b1e40]/5 shadow-sm">
                              <div className="w-3 h-3 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: item.color }} />
                              <span className="text-[11px] font-bold text-[#5a6070]">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {scanHistory.map((entry, index) => {
                        const riskLabel = entry.risk_assessment?.risk_label || "Unknown";
                        const cfg = getRiskConfig(riskLabel);
                        const isExpanded = expandedCard === entry.id;
                        const isLatest = index === 0;
                        const confidence = Math.round((entry.risk_assessment?.confidence_score || 0) * 100);
                        const genes = entry.pharmacogenomic_profile?.genes_involved || [];
                        const mechanism = entry.clinical_recommendation?.mechanism || "";

                        return (
                          <div
                            key={entry.id}
                            className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer bg-white"
                            style={{
                              border: `1px solid ${isLatest ? cfg.border : "rgba(11,30,64,0.06)"}`,
                              boxShadow: isLatest ? `0 4px 20px ${cfg.color}15` : "0 2px 8px rgba(11,30,64,0.02)",
                              animation: isLatest ? "card-enter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none",
                            }}
                            onClick={() => setExpandedCard(isExpanded ? null : entry.id)}
                          >
                            <div className="h-1 w-full" style={{ backgroundColor: cfg.stripe }} />
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                                    style={{ backgroundColor: `${cfg.color}15`, color: cfg.text, border: `1px solid ${cfg.color}25` }}
                                  >
                                    {scanHistory.length - index}
                                  </div>
                                  <div className="min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="font-bold text-[15px] text-[#0b1e40] tracking-tight">{entry.drug}</span>
                                      {isLatest && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest" style={{ backgroundColor: `${cfg.color}15`, color: cfg.text }}>
                                          New
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase"
                                      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                                    >
                                      {cfg.icon} {cfg.label}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Preview text */}
                              <p className="text-[13px] text-[#5a6070] mt-3 leading-relaxed font-medium" style={{ display: "-webkit-box", WebkitLineClamp: isExpanded ? 999 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {mechanism}
                              </p>

                              {/* Mini gene chips */}
                              {!isExpanded && genes.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mt-3">
                                  {genes.map(g => (
                                    <span key={g} className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-bold border" style={{ backgroundColor: `${cfg.color}05`, color: cfg.text, borderColor: `${cfg.color}20` }}>
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Expanded body details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 pt-4 border-t border-[#0b1e40]/5 space-y-4">
                                      {/* Variant hits detail */}
                                      {entry.pharmacogenomic_profile?.variant_hits?.length > 0 && (
                                        <div>
                                          <p className="text-[10px] font-bold text-[#5a6070]/60 uppercase tracking-widest mb-2">Detected Variants</p>
                                          <div className="space-y-1.5">
                                            {entry.pharmacogenomic_profile.variant_hits.map((hit, i) => (
                                              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#f8faf7] border border-[#0b1e40]/5">
                                                <div className="flex items-center gap-2">
                                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                                  <span className="font-mono text-xs font-bold text-[#0b1e40]">{hit.gene}</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold" style={{ color: cfg.text }}>
                                                  {hit.matchedAlleles.join(", ")}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Recommendation detail */}
                                      {entry.clinical_recommendation?.recommendation && (
                                        <div className="p-3 rounded-xl border" style={{ backgroundColor: `${cfg.color}05`, borderColor: `${cfg.color}15` }}>
                                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: cfg.text }}>Recommendation</p>
                                          <p className="text-xs leading-relaxed font-bold text-[#0b1e40]">
                                            {entry.clinical_recommendation.recommendation}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-2">
                                        <span className="text-[10px] text-[#5a6070]/50 font-bold uppercase tracking-widest">
                                          {entry.scanTime}
                                        </span>
                                        <span className="text-[10px] text-[#5a6070]/50 font-bold uppercase tracking-widest">
                                          {confidence}% Match
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="flex justify-center mt-3 pt-1">
                                <ChevronDown
                                  className="w-4 h-4 text-[#5a6070]/30 group-hover:text-[#5a6070]/60 transition-all duration-300"
                                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* ════════════════════════════════════════════════════════════════════
            SUPPORTING CONTENT (How It Works, Tips, FAQ)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border-t border-[#0b1e40]/5 pt-20 pb-24">
          
          {/* How It Works Stack */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#a9bb9d] text-center mb-3">
              How It Works
            </p>
            <h2 className="text-center text-3xl font-bold text-[#0b1e40] mb-16 tracking-tight">
              Scan any pill in three steps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px border-t border-dashed border-[#a9bb9d]/40 z-0" />
              
              {[
                { num: "1", title: "Load Profile", desc: "Upload your genetic data (VCF) or use your stored profile to enable personalization.", icon: Upload },
                { num: "2", title: "Point Camera", desc: "Aim the scanner at any pill bottle or prescription label in a well-lit area.", icon: Camera },
                { num: "3", title: "Instant Verdict", desc: "Get immediate feedback on safety, dosing, and toxicity based on your genes.", icon: Shield },
              ].map((s, i) => (
                <div key={s.num} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-white border border-[#a9bb9d]/30 shadow-xl shadow-[#a9bb9d]/10 flex items-center justify-center mb-6 relative">
                    <s.icon className="w-8 h-8 text-[#5a7a52]" strokeWidth={1.5} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0b1e40] text-white flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm">
                      {s.num}
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#0b1e40] mb-3">{s.title}</h3>
                  <p className="text-sm text-[#5a6070] leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tips and FAQ Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              
              {/* Left Column: Tips */}
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#0b1e40] flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0b1e40] tracking-tight">Pro Tips</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { tip: "Hold steady and focus", detail: "Avoid shaking the camera — let the auto-scan pick up text cleanly at its own pace." },
                    { tip: "Ensure proper lighting", detail: "Toggle the flashlight on in dim environments for much faster OCR reads." },
                    { tip: "Frame it properly", detail: "Center the drug name within the targeting box on your screen." },
                    { tip: "One at a time", detail: "For best accuracy, isolate a single medication label per frame." },
                  ].map((t, i) => (
                    <div key={i} className="bg-[#f8faf7] rounded-2xl p-5 border border-[#0b1e40]/5 flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#a9bb9d]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#5a7a52] text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#0b1e40] mb-1">{t.tip}</p>
                        <p className="text-sm text-[#5a6070] leading-relaxed">{t.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: FAQ */}
              <div className="lg:col-span-7">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#a9bb9d] mb-3">Knowledge Base</p>
                <h2 className="text-3xl font-bold text-[#0b1e40] tracking-tight mb-8">Frequently Asked</h2>
                
                <div className="border-t border-[#0b1e40]/10">
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
            </div>
          </section>

        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
