import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Dna, Pill, ClipboardList, Zap, ShieldCheck, FileDown } from "lucide-react";


export const metadata = {
  title: "Pricing & Plans — GenomeGuard Hospital SaaS",
  description:
    "Transparent B2B pricing for Indian hospitals and labs. SaaS subscription, per-analysis fees, and EHR integration plans. No hidden charges.",
  keywords: [
    "pharmacogenomics pricing India",
    "hospital genomics SaaS price",
    "PGx software cost India",
    "EHR integration genomics",
  ],
  alternates: { canonical: "https://www.genomeguard.in/pricing" },
  openGraph: {
    title: "Pricing & Plans — GenomeGuard Hospital SaaS",
    description:
      "Transparent B2B pricing for Indian hospitals and labs. SaaS, per-analysis, EHR integration.",
    url: "https://www.genomeguard.in/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "GenomeGuard Hospital SaaS",
  description:
    "AI-powered pharmacogenomic analysis platform for Indian hospitals. Unlimited VCF analyses, ABHA integration, EHR-compatible FHIR reports.",
  brand: { "@type": "Brand", name: "GenomeGuard" },
  offers: [
    {
      "@type": "Offer",
      name: "Hospital SaaS Annual",
      priceCurrency: "INR",
      price: "499999",
      priceValidUntil: "2027-12-31",
      url: "https://www.genomeguard.in/pricing",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Per-Analysis",
      priceCurrency: "INR",
      price: "40",
      priceValidUntil: "2027-12-31",
      url: "https://www.genomeguard.in/pricing",
      availability: "https://schema.org/InStock",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does EHR integration typically take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depending on your hospital's existing IT infrastructure and FHIR support, our engineering team can typically complete standard integrations in 4 to 8 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "Are there any hidden data storage fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Our Hospital SaaS plan includes secure storage for genomic reports and VCF analysis artifacts as part of your annual subscription.",
      },
    },
    {
      "@type": "Question",
      name: "Can we upgrade from the Per-Analysis plan to a SaaS plan later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. The Per-Analysis tier is perfect for clinical pilots. Once your hospital scales up, we can seamlessly migrate your account to an unlimited SaaS tier without any data loss.",
      },
    },
    {
      "@type": "Question",
      name: "What is the cost of pharmacogenomic testing in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Individual pharmacogenomic tests for patients typically cost ₹5,000–₹15,600. For hospitals, GenomeGuard offers a per-analysis B2B price of ₹40 per analysis plus ₹10,000 annual platform renewal, or an annual SaaS subscription starting at ₹4,99,999/year.",
      },
    },
    {
      "@type": "Question",
      name: "What does the ₹10,000 yearly renewal cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The annual renewal fee covers platform access, knowledge-base updates with the latest CPIC/PharmGKB guidelines, security patches, and basic technical support for the year.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a minimum analysis commitment on the Per-Analysis plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You can run as few or as many analyses as you need. The ₹40 per-analysis fee is charged only when you submit a VCF for analysis. The only fixed cost is the ₹10,000 annual renewal.",
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-[#0b1e40] overflow-x-hidden">
      <Script id="schema-product" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Script id="schema-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-[#f7faf5] via-white to-[#e6f2e8] overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] right-[-60px] w-72 h-72 bg-[#a9bb9d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-40px] w-56 h-56 bg-[#a9bb9d]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 text-[#6b8760] text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            Transparent Pricing
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">
            Pricing for Hospitals & Labs
          </h1>
          <p className="text-base sm:text-lg text-[#5a6070] max-w-2xl mx-auto leading-relaxed">
            Simple, scalable pricing designed for Indian healthcare providers. Whether you're a
            multi-specialty hospital processing thousands of analyses or a clinic just getting
            started with pharmacogenomics — we have a plan for you.
          </p>
        </div>
      </section>

      {/* Pricing Overview Table */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-[#0b1e40] mb-2">Pricing Overview</h2>
          <p className="text-[#5a6070] mb-8">Compare our plans at a glance.</p>
          <div className="overflow-x-auto rounded-xl border border-[#a9bb9d]/15">
            <table className="w-full text-left">
              <thead className="bg-[#f7faf5]">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide">Plan</th>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide">Cost</th>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide">Best For</th>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide">Key Benefits</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#5a6070]">
                <tr className="border-t border-[#a9bb9d]/10">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Hospital SaaS</td>
                  <td className="px-5 py-4">₹ 4,99,999 / yr</td>
                  <td className="px-5 py-4">Large hospitals & networks</td>
                  <td className="px-5 py-4">Unlimited analyses, dashboard, priority support</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10 bg-[#f7faf5]/50">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Per‑Analysis</td>
                  <td className="px-5 py-4">₹ 40 / analysis<br /><span className="text-xs text-[#8fa88a]">+ ₹ 10,000 yearly renewal</span></td>
                  <td className="px-5 py-4">Clinics & pilot programs</td>
                  <td className="px-5 py-4">Pay‑as‑you‑go, full reports, no volume commitment</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">EHR Integration</td>
                  <td className="px-5 py-4">₹ 2,99,999 / yr</td>
                  <td className="px-5 py-4">Hospitals with existing EHR</td>
                  <td className="px-5 py-4">FHIR sync, bi-directional data, SLA support</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[#5a6070]">
            Note: Individual pharmacogenomic tests for patients typically cost ₹5,000–₹15,600 at diagnostic labs. GenomeGuard's B2B pricing makes it dramatically more affordable to offer PGx at scale.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-20 bg-[#f7faf5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0b1e40] mb-4">Choose Your Plan</h2>
            <p className="text-[#5a6070] max-w-xl mx-auto">Every plan includes access to our AI-powered pharmacogenomic analysis engine, CPIC-aligned reports, and secure data handling.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Hospital SaaS Subscription */}
            <div className="relative bg-white border border-[#a9bb9d]/15 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#a9bb9d] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">
                Most Popular
              </div>
              <h2 className="text-xl font-semibold text-[#0b1e40] mb-2">Hospital SaaS</h2>
              <p className="text-sm text-[#5a6070] mb-5">For large-scale institutional use</p>
              <div className="text-3xl font-bold text-[#0b1e40] mb-1">₹ 4,99,999</div>
              <div className="text-sm text-[#8fa88a] font-medium mb-6">per year</div>
              <p className="text-[#5a6070] text-sm mb-6 leading-relaxed">
                Unlimited analyses for all physicians in your network. Includes analytics dashboard, role‑based access, and dedicated account management.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-[#5a6070] flex-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span><strong>Unlimited</strong> VCF analyses across your network</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Integrated <strong>ABHA</strong> patient lookup</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>REST API access for custom integrations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Dedicated account manager & onboarding</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Admin dashboard with analytics & audit logs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Priority email & phone support</span>
                </li>
              </ul>
              <a href="/#hospital-waitlist" className="mt-auto bg-[#a9bb9d] hover:bg-[#8fa88a] text-white py-3 rounded-xl text-center font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                Get Started
              </a>
            </div>

            {/* Per‑Analysis Fee */}
            <div className="relative bg-white border-2 border-[#a9bb9d]/30 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-xl font-semibold text-[#0b1e40] mb-2">Per‑Analysis</h2>
              <p className="text-sm text-[#5a6070] mb-5">Pay only for what you use</p>
              <div className="text-3xl font-bold text-[#0b1e40] mb-1">₹ 40</div>
              <div className="text-sm text-[#8fa88a] font-medium mb-2">per analysis</div>
              <div className="inline-flex items-center gap-1.5 bg-[#a9bb9d]/10 text-[#6b8760] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 w-fit">
                + ₹ 10,000 yearly platform renewal
              </div>
              <p className="text-[#5a6070] text-sm mb-6 leading-relaxed">
                Perfect for clinics getting started with pharmacogenomics. No volume commitment — run as few or as many analyses as you need, and pay only per report generated.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-[#5a6070] flex-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Full pharmacogenomic report per analysis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>No minimum volume commitment</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Platform access & knowledge-base updates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Optional API access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Upgrade to SaaS anytime — no data loss</span>
                </li>
              </ul>
              <a href="/#hospital-waitlist" className="mt-auto bg-[#a9bb9d] hover:bg-[#8fa88a] text-white py-3 rounded-xl text-center font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                Start Analyzing
              </a>
            </div>

            {/* EHR Integration */}
            <div className="relative bg-white border border-[#a9bb9d]/15 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-xl font-semibold text-[#0b1e40] mb-2">EHR Integration</h2>
              <p className="text-sm text-[#5a6070] mb-5">Add-on for existing EHR systems</p>
              <div className="text-3xl font-bold text-[#0b1e40] mb-1">₹ 2,99,999</div>
              <div className="text-sm text-[#8fa88a] font-medium mb-6">per year</div>
              <p className="text-[#5a6070] text-sm mb-6 leading-relaxed">
                Seamless FHIR‑compatible integration with your existing Electronic Health Record system. One‑time setup plus annual maintenance and SLA-backed support.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-[#5a6070] flex-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>FHIR resources for PGx data</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Bi‑directional data synchronization</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>Dedicated integration engineer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>SLA-backed support & maintenance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8fa88a] mt-0.5 shrink-0">✓</span>
                  <span>4–8 week typical deployment</span>
                </li>
              </ul>
              <a href="/#hospital-waitlist" className="mt-auto bg-[#a9bb9d] hover:bg-[#8fa88a] text-white py-3 rounded-xl text-center font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                Request Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included: Per-Analysis Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0b1e40] mb-4">What You Get With Every Analysis</h2>
            <p className="text-[#5a6070] max-w-2xl mx-auto">
              Whether you're on Per‑Analysis or Hospital SaaS, every report delivers comprehensive, clinician-ready insights.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Dna className="w-8 h-8 text-[#8fa88a]" />, title: "20 Gene Panel", desc: "Coverage of CYP2D6, CYP2C19, CYP2C9, CYP3A5, SLCO1B1, TPMT, DPYD, and more pharmacogenes." },
              { icon: <Pill className="w-8 h-8 text-[#8fa88a]" />, title: "45+ Drug Interactions", desc: "Actionable dosing recommendations for over 45 commonly prescribed medications across specialties." },
              { icon: <ClipboardList className="w-8 h-8 text-[#8fa88a]" />, title: "CPIC-Aligned Reports", desc: "Every report follows the latest Clinical Pharmacogenetics Implementation Consortium guidelines." },
              { icon: <Zap className="w-8 h-8 text-[#8fa88a]" />, title: "< 30s Report Generation", desc: "Upload a VCF file and receive a complete pharmacogenomic report in under 30 seconds." },
              { icon: <ShieldCheck className="w-8 h-8 text-[#8fa88a]" />, title: "DPDP Compliant", desc: "Patient data is encrypted at rest and in transit. We comply with India's Digital Personal Data Protection Act." },
              { icon: <FileDown className="w-8 h-8 text-[#8fa88a]" />, title: "Downloadable PDF Reports", desc: "Professional, shareable reports ready for patient records, referrals, or regulatory documentation." },
            ].map((item) => (
              <div key={item.title} className="bg-[#f7faf5] border border-[#a9bb9d]/10 rounded-2xl p-6 hover:-translate-y-0.5 transition-all duration-300">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-[#0b1e40] mb-2">{item.title}</h3>
                <p className="text-sm text-[#5a6070] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-20 bg-[#f7faf5]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0b1e40] mb-4">How GenomeGuard Compares</h2>
            <p className="text-[#5a6070] max-w-2xl mx-auto">
              Traditional PGx testing in India costs ₹5,000–₹15,600 per patient at diagnostic labs. Here's how GenomeGuard changes the economics.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#a9bb9d]/15">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide"></th>
                  <th className="px-5 py-4 text-sm font-semibold text-[#0b1e40] uppercase tracking-wide">Traditional Lab</th>
                  <th className="px-5 py-4 text-sm font-semibold text-[#8fa88a] uppercase tracking-wide">GenomeGuard Per‑Analysis</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#5a6070]">
                <tr className="border-t border-[#a9bb9d]/10">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Cost per test</td>
                  <td className="px-5 py-4">₹ 5,000 – ₹ 15,600</td>
                  <td className="px-5 py-4 font-semibold text-[#6b8760]">₹ 40</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10 bg-[#f7faf5]/50">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Turnaround time</td>
                  <td className="px-5 py-4">5 – 15 business days</td>
                  <td className="px-5 py-4 font-semibold text-[#6b8760]">Under 30 seconds</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Genes covered</td>
                  <td className="px-5 py-4">Varies (1–5 typically)</td>
                  <td className="px-5 py-4 font-semibold text-[#6b8760]">20 pharmacogenes</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10 bg-[#f7faf5]/50">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Drug interactions</td>
                  <td className="px-5 py-4">Limited panel</td>
                  <td className="px-5 py-4 font-semibold text-[#6b8760]">45+ medications</td>
                </tr>
                <tr className="border-t border-[#a9bb9d]/10">
                  <td className="px-5 py-4 font-medium text-[#0b1e40]">Annual platform fee</td>
                  <td className="px-5 py-4">N/A</td>
                  <td className="px-5 py-4 font-semibold text-[#6b8760]">₹ 10,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-[#5a6070] text-center">
            Even at just 10 analyses per month, GenomeGuard delivers a <strong className="text-[#0b1e40]">99%+ cost reduction</strong> compared to outsourcing to traditional diagnostic labs.
          </p>
        </div>
      </section>

      {/* Value Proposition / Reasons to Buy */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0b1e40] mb-4">Why Hospitals Choose GenomeGuard</h2>
            <p className="text-lg text-[#5a6070] max-w-2xl mx-auto">
              Implementing pharmacogenomics isn't just about advanced science—it's a strategic investment that drives better patient outcomes, reduces costs, and positions your institution as a leader in precision care.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#f7faf5] p-8 rounded-2xl shadow-sm border border-[#a9bb9d]/10 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 bg-[#e6f2e8] rounded-xl flex items-center justify-center mb-6 text-[#8fa88a]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0b1e40] mb-3">Reduce Treatment Costs</h3>
              <p className="text-[#5a6070] leading-relaxed">
                Adverse drug reactions (ADRs) are a major driver of extended hospital stays. By predicting patient response, you drastically cut down trial-and-error prescribing and resource waste.
              </p>
            </div>
            <div className="bg-[#f7faf5] p-8 rounded-2xl shadow-sm border border-[#a9bb9d]/10 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 bg-[#e6f2e8] rounded-xl flex items-center justify-center mb-6 text-[#8fa88a]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0b1e40] mb-3">Uncompromising Security</h3>
              <p className="text-[#5a6070] leading-relaxed">
                Patient genomic data is highly sensitive. Our infrastructure is DPDP compliant and employs bank-grade encryption to ensure strict data sovereignty and patient privacy in India.
              </p>
            </div>
            <div className="bg-[#f7faf5] p-8 rounded-2xl shadow-sm border border-[#a9bb9d]/10 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 bg-[#e6f2e8] rounded-xl flex items-center justify-center mb-6 text-[#8fa88a]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-[#0b1e40] mb-3">CPIC-Aligned Science</h3>
              <p className="text-[#5a6070] leading-relaxed">
                Our analysis engine translates complex VCF files directly into actionable clinical insights based on the latest global CPIC and PharmGKB guidelines, ensuring evidence-based care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Included in All Plans */}
      <section className="py-16 bg-[#f7faf5] border-t border-[#a9bb9d]/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#0b1e40] mb-10">Every Plan Includes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[#0b1e40]">
            <div className="flex flex-col items-center p-5 bg-white rounded-xl border border-[#a9bb9d]/10">
              <span className="text-3xl mb-3 text-[#8fa88a]">✓</span>
              <span className="font-semibold text-lg">99.9% Uptime SLA</span>
              <span className="text-xs text-[#5a6070] mt-1">Reliable, always-on access</span>
            </div>
            <div className="flex flex-col items-center p-5 bg-white rounded-xl border border-[#a9bb9d]/10">
              <span className="text-3xl mb-3 text-[#8fa88a]">✓</span>
              <span className="font-semibold text-lg">Data Encryption</span>
              <span className="text-xs text-[#5a6070] mt-1">AES-256 at rest & in transit</span>
            </div>
            <div className="flex flex-col items-center p-5 bg-white rounded-xl border border-[#a9bb9d]/10">
              <span className="text-3xl mb-3 text-[#8fa88a]">✓</span>
              <span className="font-semibold text-lg">Onboarding Support</span>
              <span className="text-xs text-[#5a6070] mt-1">Guided setup & training</span>
            </div>
            <div className="flex flex-col items-center p-5 bg-white rounded-xl border border-[#a9bb9d]/10">
              <span className="text-3xl mb-3 text-[#8fa88a]">✓</span>
              <span className="font-semibold text-lg">Regular KB Updates</span>
              <span className="text-xs text-[#5a6070] mt-1">Latest CPIC & PharmGKB data</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#0b1e40] mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "How long does EHR integration typically take?",
                a: "Depending on your hospital's existing IT infrastructure and whether it supports FHIR standards, our engineering team can typically complete standard integrations in 4 to 8 weeks."
              },
              {
                q: "Are there any hidden data storage fees?",
                a: "No. Both our Hospital SaaS and Per-Analysis plans include secure storage for genomic reports and VCF analysis artifacts. There are no surprise charges."
              },
              {
                q: "Can we upgrade from the Per-Analysis plan to a SaaS plan later?",
                a: "Absolutely. The Per-Analysis tier is perfect for clinical pilots. Once your hospital scales up its pharmacogenomics offering, we can seamlessly migrate your account to an unlimited SaaS tier without any data loss."
              },
              {
                q: "What does the ₹10,000 yearly renewal cover?",
                a: "The annual renewal fee covers continued platform access, knowledge-base updates with the latest CPIC/PharmGKB guidelines, security patches, and basic technical support for the full year."
              },
              {
                q: "Is there a minimum analysis commitment on the Per-Analysis plan?",
                a: "No. You can run as few or as many analyses as you need. The ₹40 per-analysis fee is charged only when you submit a VCF for processing. The only fixed cost is the ₹10,000 annual renewal."
              },
              {
                q: "What is the cost of pharmacogenomic testing in India?",
                a: "Individual pharmacogenomic tests for patients typically cost ₹5,000–₹15,600 at diagnostic labs. GenomeGuard's per-analysis pricing of ₹40 makes it dramatically more affordable for hospitals to offer PGx testing at scale."
              },
            ].map((item) => (
              <details key={item.q} className="group p-6 bg-[#f7faf5] border border-[#a9bb9d]/15 rounded-xl hover:shadow-md transition-all">
                <summary className="text-lg font-semibold text-[#0b1e40] cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg className="w-5 h-5 shrink-0 text-[#a9bb9d] transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-[#5a6070] leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0b1e40] to-[#132f52] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Medication Safety?</h3>
          <p className="text-white/50 mb-8 text-lg">
            Partner with us and bring precision medicine to your patients. Our team will have you up and running in days, not months.
          </p>
          <a href="/#hospital-waitlist" className="inline-block bg-[#a9bb9d] hover:bg-[#8fa88a] text-[#0b1e40] font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
            Partner with Us
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
