"use client";
import { useState, useEffect } from "react";

// Set this to match the duration (ms) of one full loop of loader.webm (reduced for performance)
const DESKTOP_DURATION_MS = 1600;
const MOBILE_DURATION_MS = 800; // No video on mobile, just a spinner — keep it snappy
const MOBILE_BREAKPOINT = 768; // px — matches Tailwind's "md"

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile once on mount (SSR-safe)
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    const duration = mobile ? MOBILE_DURATION_MS : DESKTOP_DURATION_MS;

    // Wait for the page to fully load, then show loader for the appropriate duration
    const hide = () => {
      setFading(true);
      // After fade-out transition, fully unmount
      setTimeout(() => setVisible(false), 500);
    };

    if (document.readyState === "complete") {
      setTimeout(hide, duration);
    } else {
      const onLoad = () => setTimeout(hide, duration);
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/60 backdrop-blur-md"
      style={{
        transition: "opacity 0.5s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {isMobile ? (
        /* ── Mobile: clean CSS spinner instead of video ── */
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-[3px] border-slate-200 border-t-[#6b8760]"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-sm font-medium text-slate-500 tracking-wide">
            Loading…
          </p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        /* ── Desktop: original video loader (unchanged) ── */
        <video
          src="/loader.webm"
          autoPlay
          muted
          loop
          playsInline
          className="w-[64vw] h-[64vh] object-contain"
        />
      )}
    </div>
  );
}
