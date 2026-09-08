"use client";
import { useEffect, useRef, useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

import {
  IconDna,
  IconBrain,
  IconHeartbeat,
  IconRocket,
  IconMapPin,
  IconClock,
  IconChevronRight,
  IconBriefcase,
  IconUsers,
  IconSparkles,
  IconCode,
  IconFlask,
  IconChartBar,
  IconShieldCheck,
} from "@tabler/icons-react";

/* ── Open Positions Data ── */
const positions = [
  {
    title: "Senior Bioinformatics Engineer",
    department: "Engineering",
    location: "Bengaluru, India",
    type: "Full-time",
    description:
      "Design and optimize pharmacogenomic analysis pipelines. Work with VCF data, variant calling, and CPIC guideline integration.",
    icon: <IconDna className="w-5 h-5" />,
    tags: ["Python", "Bioinformatics", "VCF", "CPIC"],
  },
  {
    title: "Machine Learning Researcher",
    department: "AI / Research",
    location: "Remote (India)",
    type: "Full-time",
    description:
      "Build and fine-tune models for drug interaction prediction, phenotype classification, and pharmacogenomic risk scoring.",
    icon: <IconBrain className="w-5 h-5" />,
    tags: ["PyTorch", "NLP", "Genomics"],
  },
  {
    title: "Full-Stack Developer",
    department: "Engineering",
    location: "Bengaluru, India",
    type: "Full-time",
    description:
      "Build and maintain the GenomeGuard web platform. Create intuitive interfaces for clinicians to interact with complex genomic data.",
    icon: <IconCode className="w-5 h-5" />,
    tags: ["React", "Next.js", "Python", "PostgreSQL"],
  },
  {
    title: "Clinical Genomics Advisor",
    department: "Clinical",
    location: "Remote (India)",
    type: "Part-time / Contract",
    description:
      "Provide clinical expertise for pharmacogenomic recommendations. Validate drug-gene interaction data and review safety alerts.",
    icon: <IconFlask className="w-5 h-5" />,
    tags: ["Pharmacology", "Clinical Genetics", "CPIC"],
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Bengaluru / Remote",
    type: "Full-time",
    description:
      "Craft elegant, accessible interfaces that help doctors and researchers navigate complex pharmacogenomic data with confidence.",
    icon: <IconSparkles className="w-5 h-5" />,
    tags: ["Figma", "UX Research", "Health-tech", "Design Systems"],
  },
  {
    title: "Data Analyst — Genomics",
    department: "Data",
    location: "Remote (India)",
    type: "Full-time",
    description:
      "Analyse pharmacogenomic datasets, generate insights on drug safety trends, and support clinical decision-making dashboards.",
    icon: <IconChartBar className="w-5 h-5" />,
    tags: ["SQL", "Python", "Tableau", "Biostatistics"],
  },
];

/* ── Values Data ── */
const values = [
  {
    icon: <IconHeartbeat className="w-6 h-6" />,
    title: "Patient-First Science",
    description:
      "Every line of code we write has the potential to make medication safer. We never lose sight of the patients behind the data.",
  },
  {
    icon: <IconUsers className="w-6 h-6" />,
    title: "Collaborative Discovery",
    description:
      "Breakthroughs happen at intersections. We bring together engineers, clinicians, and researchers to solve hard problems together.",
  },
  {
    icon: <IconRocket className="w-6 h-6" />,
    title: "Move with Purpose",
    description:
      "We ship fast, but never recklessly. Our urgency comes from knowing that safer prescriptions can't wait.",
  },
  {
    icon: <IconShieldCheck className="w-6 h-6" />,
    title: "Rigorous & Transparent",
    description:
      "We hold ourselves to the highest scientific and engineering standards. Our work is open, auditable, and evidence-based.",
  },
];

export default function CareersPage() {
  const heroRef = useRef(null);
  const [filter, setFilter] = useState("All");

  const departments = [
    "All",
    ...new Set(positions.map((p) => p.department)),
  ];
  const filtered =
    filter === "All"
      ? positions
      : positions.filter((p) => p.department === filter);

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

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7faf5] via-white to-[#f0f7f4]" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(169,187,157,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(11,30,64,0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,30,64,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,30,64,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2.5 mb-6"
            data-reveal
          >
            <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
            <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#0b1e40]/50">
              Careers at GenomeGuard
            </span>
            <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
          </div>

          {/* Headline */}
          <h1
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            data-reveal
          >
            Shape the Future of{" "}
            <span className="bg-gradient-to-r from-[#5a7a52] to-[#a9bb9d] bg-clip-text text-transparent">
              Personalised Medicine
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg text-[#5a6070] max-w-2xl mx-auto leading-relaxed mb-10"
            data-reveal
          >
            Join a team of scientists, engineers, and clinicians building
            AI-powered tools that make every prescription safer. Your work
            will directly impact patient lives.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4" data-reveal>
            <a
              href="#positions"
              className="group inline-flex items-center gap-2 bg-[#5a7a52] text-white rounded-full text-sm font-semibold px-7 py-3 shadow-md shadow-[#a9bb9d]/30 hover:shadow-lg hover:shadow-[#a9bb9d]/40 hover:-translate-y-0.5 hover:bg-[#4a6a43] transition-all duration-300"
            >
              View Open Positions
              <IconChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#values"
              className="text-sm text-[#0b1e40]/50 border-b border-current pb-px hover:text-[#0b1e40]/80 transition-colors duration-200"
            >
              Our culture
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALUES
      ═══════════════════════════════════════ */}
      <section id="values" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
              <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#0b1e40]/50">
                What Drives Us
              </span>
              <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Our Values
            </h2>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#f7faf5] to-white border border-[#a9bb9d]/15 rounded-2xl p-6 hover:border-[#a9bb9d]/40 hover:shadow-lg hover:shadow-[#a9bb9d]/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#a9bb9d]/10 flex items-center justify-center text-[#5a7a52] mb-4 group-hover:bg-[#a9bb9d]/20 transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="font-heading text-base font-bold mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-[#5a6070] leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY GENOMEGUARD
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-[#f7faf5] to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — stats */}
            <div>
              <div className="inline-flex items-center gap-2.5 mb-4">
                <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
                <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#0b1e40]/50">
                  Why GenomeGuard
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Work That{" "}
                <span className="text-[#5a7a52]">Matters</span>
              </h2>
              <p className="text-[#5a6070] leading-relaxed mb-8">
                At GenomeGuard, you'll tackle some of the most meaningful
                problems in healthcare technology. Our platform analyses
                genetic data to predict drug reactions — helping clinicians
                prescribe the right medication, at the right dose, to the
                right patient.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: "20", label: "Genes Analysed" },
                  { number: "45+", label: "Drugs Covered" },
                  { number: "15", label: "Sample Patients" },
                  { number: "< 30s", label: "Analysis Time" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#a9bb9d]/15 rounded-xl p-4 text-center hover:border-[#a9bb9d]/30 transition-colors"
                  >
                    <div className="font-heading text-2xl font-bold text-[#5a7a52] mb-1">
                      {s.number}
                    </div>
                    <div className="text-xs text-[#5a6070]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — perks */}
            <div className="space-y-4">
              {[
                {
                  title: "Impactful Work",
                  desc: "Your code directly influences clinical decisions and patient safety across India.",
                },
                {
                  title: "Remote-Friendly",
                  desc: "Work from anywhere in India. We believe great work happens when you're comfortable.",
                },
                {
                  title: "Learning Budget",
                  desc: "Annual stipend for courses, conferences, and research papers. Never stop growing.",
                },
                {
                  title: "Cutting-Edge Stack",
                  desc: "Next.js, Python, AI/ML, genomics pipelines — work with the latest tools in biotech.",
                },
                {
                  title: "Small Team, Big Ownership",
                  desc: "No layers of bureaucracy. Ship features, own outcomes, and see your impact immediately.",
                },
              ].map((perk, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start bg-white border border-[#a9bb9d]/10 rounded-xl p-5 hover:border-[#a9bb9d]/30 hover:shadow-md hover:shadow-[#a9bb9d]/5 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#a9bb9d]/10 flex items-center justify-center text-[#5a7a52] shrink-0 mt-0.5">
                    <IconChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold mb-1">
                      {perk.title}
                    </h4>
                    <p className="text-sm text-[#5a6070] leading-relaxed">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          OPEN POSITIONS
      ═══════════════════════════════════════ */}
      <section id="positions" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
              <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#0b1e40]/50">
                Open Roles
              </span>
              <span className="w-6 h-px bg-[#a9bb9d] opacity-60" />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
              Join Our Team
            </h2>
            <p className="text-[#5a6070] max-w-xl mx-auto">
              We're looking for curious minds who want to build technology that
              makes healthcare safer and more personalised.
            </p>
          </div>

          {/* Department filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilter(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  filter === dept
                    ? "bg-[#5a7a52] text-white shadow-md shadow-[#a9bb9d]/30"
                    : "bg-[#f7faf5] text-[#5a6070] hover:bg-[#a9bb9d]/15 border border-[#a9bb9d]/15"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Position cards */}
          <div className="space-y-4">
            {filtered.map((pos, i) => (
              <div
                key={i}
                className="group bg-white border border-[#a9bb9d]/15 rounded-2xl p-6 hover:border-[#a9bb9d]/40 hover:shadow-lg hover:shadow-[#a9bb9d]/8 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#a9bb9d]/10 flex items-center justify-center text-[#5a7a52] shrink-0 group-hover:bg-[#a9bb9d]/20 transition-colors">
                    {pos.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-heading text-lg font-bold">
                        {pos.title}
                      </h3>
                      <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#a9bb9d]/10 text-[#5a7a52] px-2.5 py-1 rounded-full self-start">
                        {pos.department}
                      </span>
                    </div>

                    <p className="text-sm text-[#5a6070] leading-relaxed mb-3">
                      {pos.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#5a6070]">
                        <IconMapPin className="w-3.5 h-3.5 text-[#a9bb9d]" />
                        {pos.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#5a6070]">
                        <IconClock className="w-3.5 h-3.5 text-[#a9bb9d]" />
                        {pos.type}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {pos.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium bg-[#f7faf5] text-[#5a7a52] px-2.5 py-1 rounded-full border border-[#a9bb9d]/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Apply button */}
                  <a
                    href="https://forms.gle/JCzS2mCWnHbzXayF7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 self-start shrink-0 bg-[#5a7a52] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-[#4a6a43] hover:shadow-md hover:shadow-[#a9bb9d]/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Apply
                    <IconChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#5a6070]">
              <IconBriefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No open positions in this department right now.</p>
              <p className="text-sm mt-1 opacity-60">
                Check back soon or send us a general application.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-b from-white to-[#f7faf5]">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="relative bg-[#0b1e40] rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
            {/* Glow orbs */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(169,187,157,0.12) 0%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-60 h-60 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(169,187,157,0.08) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            <div className="relative z-10">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
                Don't See the Right Role?
              </h2>
              <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
                We're always looking for exceptional talent. Send us your
                résumé and tell us how you'd contribute to making medication
                safer with pharmacogenomics.
              </p>
              <a
                href="mailto:contact@genomeguard.tech?subject=General Application — GenomeGuard"
                className="group inline-flex items-center gap-2 bg-[#a9bb9d] text-[#0b1e40] font-semibold text-sm rounded-full px-7 py-3 shadow-lg shadow-[#a9bb9d]/20 hover:shadow-xl hover:shadow-[#a9bb9d]/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Send a General Application
                <IconChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
