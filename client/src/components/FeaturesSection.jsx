"use client";

import Link from "next/link";

import { motion } from "motion/react";
import {
  FileSearch,
  Heart,
  Pill,
  Camera,
  ShieldCheck,
  Link2,
  ArrowRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    label: "Genomic Analysis",
    desc: "Upload your VCF file and get instant pharmacogenomic risk assessments across 20 genes — powered by CPIC guidelines.",
    tag: "Core Feature",
    href: "/#analyze",
  },
  {
    icon: Heart,
    label: "Family PGx",
    desc: "Compare partner genomes to predict pediatric pharmacogenomic risks.",
    tag: "Family Planning",
    href: "/familypgx",
  },
  {
    icon: Camera,
    label: "Pill Scanner",
    desc: "Snap a photo of any medication and instantly identify pharmacogenomic risks based on your genetic profile.",
    tag: "Scanner",
    href: "/pill-scanner",
  },
  {
    icon: Pill,
    label: "Drug Interaction Checker",
    desc: "Analyze how your body processes 45+ common drugs including Warfarin, Codeine, Clopidogrel, and Simvastatin.",
    tag: "Analysis",
    href: "/#analysis",
  },

  {
    icon: ShieldCheck,
    label: "Drug Safety Matrix",
    desc: "Explore a comprehensive gene-drug safety grid showing risk levels for every phenotype-drug combination at a glance.",
    tag: "Reference",
    href: "/safety-matrix",
  },
  {
    icon: Link2,
    label: "ABHA Connect",
    desc: "Link your Ayushman Bharat Health Account to access your unified health records and get personalized pharmacogenomic insights.",
    tag: "Integration",
    href: "/abha",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-[#f6f9f4]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white border border-[#a9bb9d]/30 text-[#5a7a52] text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 tracking-widest uppercase shadow-sm"
          >
            <Zap className="w-3 h-3" />
            Features
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0b1e40] tracking-tight">
            Everything You Need,
            <br />
            All in One Place
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  href={f.href}
                  className="group flex flex-col h-full bg-white border border-[#a9bb9d]/20 rounded-2xl p-7 hover:border-[#a9bb9d]/50 hover:shadow-lg hover:shadow-[#a9bb9d]/10 transition-all duration-300"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 flex items-center justify-center text-[#5a7a52] group-hover:bg-[#a9bb9d]/20 group-hover:border-[#a9bb9d]/40 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-[#5a7a52] bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 px-2.5 py-1 rounded-full">
                      {f.tag}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="text-[#0b1e40] font-bold text-base mb-2">
                    {f.label}
                  </h3>
                  <p className="text-[#64748b] text-sm leading-relaxed flex-1 mb-5">
                    {f.desc}
                  </p>

                  {/* CTA */}
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a7a52]">
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
