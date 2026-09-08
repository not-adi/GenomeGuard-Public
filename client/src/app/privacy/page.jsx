"use client";
import { useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-reveal]");
    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(16px)";
      setTimeout(() => {
        item.style.transition =
          "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)";
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, i * 100 + 50);
    });
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0b1e40] overflow-x-hidden">
      <NavBar />

      {/* Hero Banner */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden border-b border-black/[0.03]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7faf5] via-white to-[#f0f7f4]" />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(169,187,157,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,30,64,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,30,64,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2.5 mb-5" data-reveal>
            <span className="w-5 h-px bg-[#a9bb9d] opacity-60" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#5a7a52]">
              Legal & Compliance
            </span>
            <span className="w-5 h-px bg-[#a9bb9d] opacity-60" />
          </div>
          <h1
            className="font-heading text-4xl sm:text-5xl font-bold leading-tight mb-4 text-[#0b1e40]"
            data-reveal
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[#5a6070]" data-reveal>
            Last Updated: June 9, 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose prose-slate max-w-none text-[#5a6070] leading-relaxed space-y-8">
            <p className="text-base sm:text-lg text-[#3b4150]">
              At GenomeGuard, we recognize the deeply personal and sensitive nature of genomic data. This Privacy Policy details how we handle, analyze, and protect variant call format (VCF) data, health information, and personal demographics when using our pharmacogenomic engines.
            </p>

            <hr className="border-black/[0.06] my-8" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">1</span>
                Genetic Data Handling & Parsing
              </h2>
              <p>
                We do not collect or permanently store raw VCF genetic sequence files. All pharmacogenomic computations, variant lookups (such as star-allele determinations on CYP2D6, CYP2C19, etc.), and drug interaction warnings are computed dynamically.
              </p>
              <p>
                Upon uploading your VCF file:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Variant analysis runs in memory to map key rsIDs to corresponding metabolic phenotypes.</li>
                <li>Once the PGx report is compiled or the active browsing session concludes, uploaded VCF files are immediately deleted from our transient servers.</li>
                <li>Your raw genetic sequences are never sold, licensed, or shared with third-party advertising companies.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">2</span>
                Demographic & ABHA Data
              </h2>
              <p>
                To provide accurate compatibility and medication recommendations, GenomeGuard may request demographic data, including bio-geographic indicators, age, and clinical history. 
              </p>
              <p>
                For Indian healthcare integrations, users connecting via the Ayushman Bharat Health Account (ABHA) consent to the secure exchange of medical records strictly as authorized by NDHM (National Digital Health Mission) protocols.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">3</span>
                Security Standards & Encryption
              </h2>
              <p>
                We execute state-of-the-art administrative, physical, and technical safeguards to keep health and genomic data completely confidential:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li><strong>Encryption in Transit:</strong> All data transmissions are protected using TLS 1.3 network protocols.</li>
                <li><strong>Encryption at Rest:</strong> Clinical logs, profile details, and generated PDF reports are encrypted using AES-256 cryptographic standards.</li>
                <li><strong>Anonymized Logs:</strong> Clinical optimization analytics use de-identified metadata logs to avoid any risk of re-identification.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">4</span>
                Your Rights & Data Export
              </h2>
              <p>
                You maintain complete ownership of your genomic identity. You can request the permanent deletion of your profile account, credentials, and generated reports at any time. All delete actions purge associated records completely from our backup systems within 48 hours.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">5</span>
                Contact Information
              </h2>
              <p className="text-[#3b4150]">
                If you have questions regarding this policy, security audits, or wish to invoke your data rights, please contact our compliance department at <span className="text-[#5a7a52] font-semibold">contact@genomeguard.tech</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
