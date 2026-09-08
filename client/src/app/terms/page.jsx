"use client";
import { useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
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
            Terms of Service
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
              Welcome to GenomeGuard. By accessing our platform, uploading genomic files (VCFs), or utilizing our pharmacogenomic risk calculation engines, you agree to comply with the terms and disclaimers outlined below.
            </p>

            {/* Medical Disclaimer Banner */}
            <div className="bg-[#a9bb9d]/10 border border-[#a9bb9d]/40 rounded-2xl p-6 sm:p-8 space-y-3">
              <h3 className="text-[#5a7a52] font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                Important Medical Disclaimer
              </h3>
              <p className="text-[#0b1e40]/75 text-sm leading-relaxed">
                GenomeGuard is a <strong>Research Use Only</strong> clinical decision support reference tool. The reports and compatibility checks generated do not constitute formal medical advice, diagnostic services, or official treatment guidelines. All findings must be reviewed and validated by a licensed physician, clinical geneticist, or pharmacist before any adjustments are made to therapeutic drug regimens or dosages.
              </p>
            </div>

            <hr className="border-black/[0.06] my-8" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">1</span>
                Description of Services
              </h2>
              <p>
                GenomeGuard provides an automated computational platform that parses genetic variant call files (specifically in variant call format, VCF) to extract clinical mappings corresponding to published CPIC (Clinical Pharmacogenetics Implementation Consortium) and PharmGKB clinical guideline data. 
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">2</span>
                User Requirements & Upload Validity
              </h2>
              <p>
                To utilize the analysis tools, you must provide genomic data in a standard variant call format (VCF) that has been aligned to human reference genome assembly GRCh37 (hg19) or GRCh38 (hg38). 
              </p>
              <p>
                You represent and warrant that you possess the necessary authorizations and consents to upload and process any genetic data submitted to the platform, and that doing so does not violate local health regulations.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">3</span>
                Acceptable Use & Code of Conduct
              </h2>
              <p>
                You agree not to perform any of the following restricted actions:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>Deploying spiders, scrapers, or automated bots to retrieve drug interaction data or proprietary clinical logic schemas.</li>
                <li>Attempting to bypass authentication mechanisms, access unauthorized clinician dashboard routes, or query raw API configurations.</li>
                <li>Uploading corrupted, malicious, or intentionally malformed VCF structures designed to induce server-side script injections.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">4</span>
                Intellectual Property
              </h2>
              <p>
                The GenomeGuard logo, web styling, pharmacogenomic classification algorithms, and clinical database mappings are the intellectual property of GenomeGuard. Third-party clinical guidelines (such as CPIC or PharmGKB guidelines) referenced within the application remain the properties of their respective consortia.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#0b1e40] font-heading flex items-center gap-2.5">
                <span className="text-xs bg-[#a9bb9d]/20 text-[#5a7a52] px-2.5 py-1 rounded">5</span>
                Limitation of Liability
              </h2>
              <p>
                GenomeGuard, its founders, and clinical contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, the platform's insights. Decisions regarding medical treatments, prescription changes, or diagnostics are made at the sole risk and discretion of the user and their medical provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
