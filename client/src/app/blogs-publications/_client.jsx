"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { IconChevronDown, IconChevronUp, IconExternalLink, IconBook2, IconFileDescription } from "@tabler/icons-react";
import Script from "next/script";

// ----- Static content ----------------------------------------------------

const publications = [
  {
    title: "Concordance Validation of GenomeGuard, a Lightweight VCF-based Pharmacogenomic Interpretation Engine, against PharmCAT using 1000 Genomes South Asian Whole-genome Sequencing Data",
    link: "https://www.researchsquare.com/article/rs-10164850/v1",
    date: "2026",
    authors: "GenomeGuard Research Team",
    venue: "Research Square",
    buttonText: "Read Full Paper on Research Square",
    abstract: "This paper presents the concordance validation of GenomeGuard, a lightweight VCF-based pharmacogenomic interpretation engine. We compared its performance against the industry-standard PharmCAT using whole-genome sequencing data from the 1000 Genomes South Asian population. The results demonstrate that GenomeGuard achieves high accuracy and clinical concordance while providing a more efficient, scalable solution tailored for diverse genetic profiles and real-time clinical decision support."
  },
  {
    title: "GenomeGuard Validation & Benchmarking Data Repository",
    link: "https://github.com/not-adi/Genomeguard",
    date: "2026",
    authors: "GenomeGuard Research Team",
    venue: "GitHub Repository",
    buttonText: "View Dataset on GitHub",
    abstract: "This public repository contains the raw validation datasets, benchmarking results, and analysis scripts for the GenomeGuard pharmacogenomic analysis engine. It provides full transparency and reproducibility for our benchmarking claims against existing tools such as PharmCAT and Aldy, including diplotype concordance and performance throughput metrics."
  }
];

const blogs = [
  {
    title: "What Is Pharmacogenomics? A Beginner's Guide",
    seo: "pharmacogenomics explained, PGx testing",
    content:
      `<strong>The Shift from Trial-and-Error to Precision Medicine</strong>\n\nFor decades, modern medicine has relied on a "one size fits all" approach to prescribing medications. Doctors would prescribe a standard dose of a drug, wait to see if it worked, and then adjust the dose or switch medications if the patient experienced adverse effects or a lack of efficacy. This trial-and-error method is not only frustrating for patients but also costly and potentially dangerous.\n\nPharmacogenomics (often abbreviated as PGx) is the study of how a person’s unique genetic makeup influences their response to medications. By analyzing specific variations in the genes that encode drug-metabolising enzymes, drug transporters, and drug targets, clinicians can predict with high accuracy how a patient will react to a specific drug before a single pill is swallowed.\n\n<strong>How Does It Work?</strong>\n\nWhen you take a medication, your body needs to process it. For most drugs, this processing occurs in the liver via a family of enzymes known as the Cytochrome P450 (CYP450) system. Your genetic code dictates exactly how these enzymes are built. Even tiny variations in your DNA—known as Single Nucleotide Polymorphisms (SNPs)—can drastically alter how efficiently these enzymes function.\n\nIf your enzymes work too slowly (Poor Metabolizer), the drug can build up in your bloodstream, leading to toxic side effects. If your enzymes work too quickly (Ultrarapid Metabolizer), your body might clear the drug before it has a chance to work, leading to therapeutic failure.\n\n<strong>Why It Matters Now</strong>\n\nWith advancements in genomic sequencing, obtaining a patient's genetic profile is more accessible than ever. Understanding pharmacogenomics is the critical first step toward true precision medicine, ensuring that every patient receives the right drug, at the right dose, at the right time.`,
  },
  {
    title: "How GenomeGuard Differs From Traditional PGx Testing Labs",
    seo: "PGx testing lab vs GenomeGuard, longitudinal pharmacogenomics",
    content:
      `<strong>The Problem with the Traditional PGx Lab Model</strong>\n\nMost pharmacogenomic (PGx) testing today follows a transactional model: a physician orders a test for a specific condition, the patient provides a sample, and the lab returns a static PDF report a week later. But what happens when that patient visits a different specialist months later? Or when they are prescribed a completely different medication? \n\nBecause traditional PGx reports are static and siloed, the prescriber often lacks immediate access to this critical genetic insight. During a typical five-minute consultation, waiting a week for a new lab report isn't an option. The result is redundant testing, delayed care, and missed opportunities to prevent adverse drug reactions.\n\n<strong>The GenomeGuard Solution: Longitudinal Clinical Decision Support</strong>\n\nGenomeGuard isn't just a testing service; it is a longitudinal pharmacogenomic clinical decision support platform designed to integrate directly into the healthcare ecosystem. Our philosophy is simple:\n\n- <strong>Test Once:</strong> The patient's genome is analyzed using their raw VCF data.\n- <strong>Store the Actionable Genotype:</strong> The derived pharmacogenomic profile is securely stored.\n- <strong>Reuse Safely:</strong> The data remains accessible across different hospitals and specialties over the patient's entire lifetime.\n- <strong>Alert Automatically:</strong> Whenever a newly prescribed medication carries a relevant gene-drug interaction, clinicians are alerted instantly based on real-time CPIC guidelines.\n\n<strong>A Paradigm Shift in Precision Medicine</strong>\n\nBy decoupling the bioinformatics analysis from the physical lab test, GenomeGuard turns a one-time laboratory report into a dynamic, lifelong medical asset. This ensures that every prescribing decision—whether today or twenty years from now—is guided by the patient's unique genetic blueprint, ultimately preventing severe adverse reactions and optimizing therapeutic outcomes across the continuum of care.`,
  },
  {
    title: "How VCF Files Power Precision Medicine",
    seo: "VCF file analysis, genetic testing",
    content:
      `<strong>The Backbone of Genomic Data</strong>\n\nWhen a patient undergoes genetic testing—whether through Next-Generation Sequencing (NGS), Whole Exome Sequencing (WES), or high-density microarrays—the raw data generated is massive and incredibly complex. To make this data usable, bioinformaticians use a standardized format known as the Variant Call Format (VCF). \n\nA VCF file is essentially a highly structured text file that catalogues the differences (variants) between a patient's genome and a standard reference genome. Each row in a VCF file corresponds to a specific location on a chromosome and details the reference allele (what is typically found in the population) and the alternate allele (what the patient has), along with statistical confidence scores.\n\n<strong>From Raw Data to Actionable Insights</strong>\n\nIn the context of pharmacogenomics, the VCF file is the raw fuel that powers precision medicine engines like GenomeGuard. The process involves several highly complex computational steps:\n\n1. <strong>Parsing and Filtering:</strong> GenomeGuard scans the VCF file to extract only the variants located within critical pharmacogenes (like CYP2D6, CYP2C19, SLCO1B1, etc.), ignoring millions of irrelevant data points for maximum efficiency.\n2. <strong>Haplotype Matching:</strong> The isolated variants are then mapped to known genetic configurations called "star alleles" (e.g., CYP2C19*2). This requires complex phasing logic to determine which variants appear together on the same chromosome.\n3. <strong>Phenotype Translation:</strong> Once the diplotype (the combination of two star alleles) is identified, the system translates this into a clinical phenotype, such as "Intermediate Metabolizer."\n\nBy automating the analysis of VCF files, GenomeGuard bridges the gap between raw laboratory data and point-of-care clinical decision-making, allowing doctors to leverage complex genetic insights without needing a degree in bioinformatics.`,
  },
  {
    title: "Why Hospitals Need Pharmacogenomic Testing in 2026",
    seo: "hospital pharmacogenomics, ADR prevention",
    content:
      `<strong>The Escalating Cost of Adverse Drug Reactions</strong>\n\nAdverse drug reactions (ADRs) are a silent epidemic in global healthcare. According to recent epidemiological studies, ADRs are responsible for up to 10% of all hospital admissions and are a leading cause of morbidity and mortality. For hospitals, this translates to longer patient stays, increased readmission rates, higher liability risks, and millions of dollars in avoidable costs.\n\n<strong>The Preemptive PGx Paradigm</strong>\n\nHistorically, pharmacogenomic (PGx) testing was done reactively—ordered only after a patient failed multiple therapies or suffered a severe reaction. In 2026, the paradigm is shifting to preemptive testing. By performing a PGx panel when a patient is first admitted or during routine outpatient onboarding, hospitals can integrate this genetic data directly into the Electronic Medical Record (EMR).\n\nImagine a scenario where a cardiologist attempts to prescribe Clopidogrel (Plavix) to a patient who just received a stent. If the patient's preemptive PGx data shows they are a CYP2C19 Poor Metabolizer, the EMR instantly flags the prescription, warning the doctor that the drug will not work and suggesting an alternative like Prasugrel or Ticagrelor. This immediate intervention prevents a potentially fatal secondary heart attack.\n\n<strong>Enterprise Benefits</strong>\n\nImplementing hospital-wide pharmacogenomic testing offers undeniable ROI:\n- <strong>Enhanced Patient Safety:</strong> Drastic reduction in severe, preventable medication errors.\n- <strong>Operational Efficiency:</strong> Eliminating the "trial-and-error" phase speeds up recovery and discharges.\n- <strong>Market Differentiation:</strong> Hospitals that offer genomic-guided prescribing position themselves as state-of-the-art centers of excellence.\n\nThe integration of AI-driven platforms like GenomeGuard makes scaling these enterprise-wide PGx programs seamless and clinically robust.`,
  },
  {
    title: "Understanding CYP450 Enzymes and Drug Metabolism",
    seo: "CYP2D6, CYP2C19, drug metabolism",
    content:
      `<strong>The Body's Chemical Factory</strong>\n\nThe Cytochrome P450 (CYP450) system is a super-family of enzymes primarily located in the liver. These enzymes act as the body's primary defense and processing mechanism for foreign substances, metabolizing roughly 70% to 80% of all prescription and over-the-counter medications currently on the market.\n\n<strong>The Big Four: CYP2D6, CYP2C19, CYP2C9, and CYP3A4</strong>\n\nWhile there are over 50 CYP enzymes, a small handful handle the vast majority of drug metabolism:\n\n- <strong>CYP2D6:</strong> Responsible for processing about 25% of all drugs, including many antidepressants (SSRIs), antipsychotics, and opioids like codeine. Interestingly, up to 10% of certain populations are "Poor Metabolizers" for CYP2D6, meaning codeine provides them absolutely no pain relief, as it cannot be converted to its active form, morphine.\n- <strong>CYP2C19:</strong> Critical for metabolizing the antiplatelet drug clopidogrel, as well as proton-pump inhibitors (PPIs) used for acid reflux.\n- <strong>CYP2C9:</strong> The primary enzyme for processing the complex and highly sensitive blood thinner Warfarin, as well as many NSAIDs (like ibuprofen).\n- <strong>CYP3A4:</strong> The most abundant enzyme, handling nearly 50% of drugs. While genetic variation is less common here, it is the primary site for severe drug-drug interactions (like the famous "grapefruit juice effect").\n\n<strong>Active Drugs vs. Prodrugs</strong>\n\nThe clinical impact of your CYP450 genetics depends entirely on the type of drug. For an <em>active drug</em>, a Poor Metabolizer will experience a toxic buildup, while an Ultrarapid Metabolizer will clear the drug too fast for it to work. Conversely, for a <em>prodrug</em> (a drug that requires the enzyme to become active, like codeine), a Poor Metabolizer gets no therapeutic effect, while an Ultrarapid Metabolizer is at severe risk for overdose. GenomeGuard handles all these complex pharmacological rules automatically.`,
  },
  {
    title: "Adverse Drug Reactions in India: The Silent Crisis",
    seo: "ADR statistics India, medication safety",
    content:
      `<strong>A Unique Population, A Unique Challenge</strong>\n\nIndia represents one of the most genetically diverse populations on the planet. Yet, the vast majority of pharmacological guidelines and drug dosing standards were historically developed based on clinical trials conducted in primarily Caucasian populations. This genetic discrepancy is a major contributing factor to the high incidence of Adverse Drug Reactions (ADRs) across the subcontinent.\n\nStudies estimate that ADRs account for 10% to 15% of total hospital admissions in India, placing an immense burden on an already strained healthcare infrastructure. Furthermore, the prevalence of polypharmacy—especially among the aging population managing multiple chronic conditions like diabetes, hypertension, and cardiovascular disease—exponentially increases the risk of dangerous drug-drug and drug-gene interactions.\n\n<strong>The Missing Link: Population-Specific Genetics</strong>\n\nCertain genetic variants are notably more prevalent in South Asian populations. For example, variations in the CYP2C19 gene, which drastically affect the metabolism of critical cardiovascular drugs like Clopidogrel, are found at different frequencies in Indian demographics compared to Western ones. \n\nWithout pharmacogenomic screening, Indian physicians are often forced to fly blind, leading to treatment failures or severe toxicity. The deployment of advanced genomic analysis tools like GenomeGuard—which can dynamically map patient VCF data against global and localized clinical guidelines—is not just an upgrade; it is an urgent necessity. By tailoring drug prescriptions to the patient's actual genetic capacity, we can mitigate the silent crisis of ADRs and bring true precision medicine to the Indian healthcare system.`,
  },
  {
    title: "CPIC Guidelines: The Gold Standard for Drug‑Gene Interactions",
    seo: "CPIC guidelines, drug‑gene interactions",
    content:
      `<strong>Bridging the Gap Between Genetics and Prescribing</strong>\n\nHaving a patient's genetic data is only half the battle; knowing exactly what to do with that data at the point of care is the real challenge. This is where the Clinical Pharmacogenetics Implementation Consortium (CPIC) comes in. Formed in 2009, CPIC is an international consortium of leading scientists, pharmacologists, and clinicians dedicated to facilitating the use of pharmacogenomic tests for patient care.\n\n<strong>Evidence-Based Actionability</strong>\n\nCPIC does not tell doctors <em>whether</em> to order a genetic test; instead, they provide strict, peer-reviewed guidelines on <em>how</em> to use genetic test results if they are already available. They review thousands of clinical studies and assign levels of evidence to drug-gene pairs:\n\n- <strong>Level A & B:</strong> High evidence. Prescribing action is highly recommended (e.g., altering the dose or choosing an alternative drug).\n- <strong>Level C & D:</strong> Lower evidence. No prescribing changes are currently recommended.\n\n<strong>How GenomeGuard Uses CPIC</strong>\n\nGenomeGuard’s analytical engine is deeply integrated with CPIC’s massive database. When a patient's VCF file is processed, GenomeGuard doesn't just return a list of genetic mutations. It maps those mutations to specific phenotypes and immediately queries the latest CPIC guidelines to generate clear, clinically actionable recommendations.\n\nIf a patient is a CYP2C19 Poor Metabolizer prescribed Clopidogrel, GenomeGuard flags the exact CPIC Level A guideline that recommends avoiding Clopidogrel and provides the scientifically backed alternatives. This ensures that every recommendation is rooted in the global gold standard of pharmacological science, reducing physician liability and guaranteeing the highest standard of patient care.`,
  },
];

const faqs = [
  { q: "Is my genetic data safe with GenomeGuard?", a: "Yes. All data is encrypted at rest and in transit, stored on secure Azure servers, and never shared without explicit consent." },
  { q: "What happens to my VCF file after analysis?", a: "The file is processed, the relevant variants are extracted, and then the raw VCF is securely deleted. Only the derived risk report is retained." },
  { q: "How accurate is GenomeGuard's analysis?", a: "We use validated algorithms, reference allele databases from PharmGKB and CPIC, and achieve >99 % concordance with gold‑standard laboratory assays." },
  { q: "Do I need a doctor to use GenomeGuard?", a: "A clinician must authorize the analysis, but the platform is designed for easy use by healthcare professionals and hospital IT teams." },
  { q: "What genes and drugs does GenomeGuard support?", a: "Currently 25 pharmacogenes and over 150 drug‑gene pairs, with regular updates as new evidence emerges." },
  { q: "Is GenomeGuard clinically validated?", a: "Our pipeline has undergone external validation studies and complies with ISO 13485 medical‑device standards." },
  { q: "How is this different from 23andMe?", a: "GenomeGuard focuses on clinically actionable pharmacogenomics for prescribed drugs, whereas direct‑to‑consumer tests are for ancestry and wellness only." },
  { q: "What does \"Research Use Only\" mean?", a: "It indicates that the output should be interpreted by a qualified healthcare professional and not used as a definitive diagnostic without clinical correlation." },
  { q: "Can hospitals integrate GenomeGuard into their workflow?", a: "Yes – we provide REST APIs, FHIR‑compatible reports, and single‑sign‑on integration options." },
  { q: "Is pharmacogenomic testing covered by insurance in India?", a: "Coverage varies; many private insurers now reimburse PGx testing for high‑risk drugs such as warfarin, clopidogrel and antidepressants." },
];

export default function BlogsFaqPage() {
  const [openBlog, setOpenBlog] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="min-h-screen bg-white text-[#0b1e40] overflow-x-hidden">
      <Script
        id="schema-article-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "GenomeGuard Pharmacogenomics Blog",
            description: "Expert articles on pharmacogenomics, VCF analysis, and ADR prevention in India.",
            itemListElement: blogs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Article",
                headline: b.title,
                name: b.title,
                datePublished: "2026-06-01T08:00:00+00:00",
                description: b.seo,
                url: `https://www.genomeguard.in/blogs-publications#blog-${i}`,
                author: { "@type": "Organization", name: "GenomeGuard" },
                publisher: { 
                  "@type": "Organization", 
                  name: "GenomeGuard", 
                  logo: { "@type": "ImageObject", url: "https://www.genomeguard.in/3.svg" } 
                },
                inLanguage: "en-IN",
                about: { "@type": "MedicalCondition", name: "Pharmacogenomics" },
              },
            })),
          }),
        }}
      />
      <Script
        id="schema-publications"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(publications.map(pub => ({
            "@context": "https://schema.org",
            "@type": "ScholarlyArticle",
            headline: pub.title,
            name: pub.title,
            author: [{ "@type": "Organization", name: pub.authors }],
            datePublished: pub.date,
            publisher: { 
              "@type": "Organization", 
              name: "GenomeGuard",
              logo: { "@type": "ImageObject", url: "https://www.genomeguard.in/3.svg" }
            },
            url: pub.link,
            abstract: pub.abstract,
            inLanguage: "en-IN",
          })))
        }}
      />
      <Script
        id="schema-faq-blogs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <NavBar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-br from-[#0b1e40] to-[#1a2f54]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #a9bb9d, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#a9bb9d] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-6 text-white text-sm font-medium">
            <IconBook2 className="h-4 w-4 text-[#a9bb9d]" />
            <span>Research & Knowledge</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
            Blogs &amp; <span className="text-[#a9bb9d]">Publications</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Dive deep into research, pharmacogenomic insights, and expert articles exploring how GenomeGuard is transforming precision medicine.
          </p>
        </div>
      </section>

      {/* ── PUBLICATIONS SECTION ── */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0b1e40] mb-4">Scientific Publications</h2>
            <div className="h-1 w-20 bg-[#a9bb9d] rounded-full"></div>
            <p className="mt-4 text-[#5a6070] max-w-2xl">Read our latest research validating the efficacy and accuracy of the GenomeGuard engine.</p>
          </div>

          <div className="grid gap-8">
            {publications.map((pub, idx) => (
              <article key={idx} className="bg-white border border-[#a9bb9d]/20 rounded-2xl p-6 sm:p-10 shadow-xl shadow-[#a9bb9d]/5 hover:shadow-2xl hover:shadow-[#a9bb9d]/10 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 p-4 rounded-xl bg-gradient-to-br from-[#f7faf5] to-[#e6f2e8] border border-[#a9bb9d]/20">
                    <IconFileDescription className="h-12 w-12 text-[#a9bb9d]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold uppercase tracking-wider text-[#6b8760]">
                      <span className="bg-[#a9bb9d]/15 px-3 py-1 rounded-full">{pub.venue}</span>
                      <span className="bg-[#0b1e40]/5 px-3 py-1 rounded-full text-[#0b1e40]/60">{pub.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0b1e40] mb-4 leading-snug group-hover:text-[#6b8760] transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-sm text-[#0b1e40]/60 mb-6 font-medium border-l-2 border-[#a9bb9d]/40 pl-4 py-1">
                      <span className="font-semibold text-[#0b1e40]">Authors:</span> {pub.authors}
                    </p>
                    <div className="text-[#5a6070] leading-relaxed mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <h4 className="text-sm font-bold text-[#0b1e40] mb-2 uppercase tracking-wide">Abstract</h4>
                      <p className="text-[15px]">{pub.abstract}</p>
                    </div>
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#0b1e40] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#1a2f54] hover:shadow-lg transition-all duration-300"
                    >
                      {pub.buttonText || "View Publication"}
                      <IconExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ARTICLES ── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-[#0b1e40]">GenomeGuard Blog</h2>
            <p className="text-[#5a6070]">Insights, updates, and deep-dives into the world of pharmacogenomics.</p>
          </div>
          <div className="space-y-5">
            {blogs.map((b, i) => (
              <article key={i} id={`blog-${i}`} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#a9bb9d]/40 transition-colors shadow-sm">
                <button
                  onClick={() => setOpenBlog(openBlog === i ? null : i)}
                  aria-expanded={openBlog === i}
                  aria-controls={`blog-content-${i}`}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <h3 className="font-semibold text-[#0b1e40] text-lg pr-4 group-hover:text-[#6b8760] transition-colors m-0">{b.title}</h3>
                  <div className={`p-2 rounded-full transition-colors ${openBlog === i ? 'bg-[#a9bb9d]/10 text-[#6b8760]' : 'bg-gray-50 text-gray-400 group-hover:bg-[#a9bb9d]/10 group-hover:text-[#6b8760]'}`}>
                    {openBlog === i ? <IconChevronUp className="h-5 w-5" /> : <IconChevronDown className="h-5 w-5" />}
                  </div>
                </button>
                <div 
                  id={`blog-content-${i}`}
                  className={`px-6 text-base text-[#5a6070] leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${openBlog === i ? 'max-h-[2000px] py-4 border-t border-gray-100 opacity-100' : 'max-h-0 opacity-0'}`} 
                  dangerouslySetInnerHTML={{ __html: b.content.replace(/\n/g, "<br/>") }} 
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-[#0b1e40]">Frequently Asked Questions</h2>
            <p className="text-[#5a6070]">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-gray-100 last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-content-${i}`}
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <span className="font-medium text-[#0b1e40] text-base group-hover:text-[#6b8760] transition-colors">{f.q}</span>
                  {openFaq === i ? <IconChevronUp className="h-4 w-4 text-[#6b8760]" /> : <IconChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                <div 
                  id={`faq-content-${i}`}
                  className={`text-[15px] text-[#5a6070] leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`} 
                  dangerouslySetInnerHTML={{ __html: f.a.replace(/\n/g, "<br/>") }} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
