import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PageLoader from "@/components/PageLoader";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import AnalysisTool from "@/components/AnalysisTool";
import SupportedGenesDrugs from "@/components/SupportedGenesDrugs";
import IVFSection from "@/components/IVFSection";
import HospitalWaitlist from "@/components/HospitalWaitlist";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import Script from "next/script";

export const metadata = {
  title: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
  description:
    "India's leading AI pharmacogenomic platform. Analyse patient VCF files to predict drug risks, prevent ADRs, and deliver CPIC-aligned clinical decisions for hospitals and labs.",
  alternates: { canonical: "https://www.genomeguard.in" },
  openGraph: {
    title: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
    description:
      "Analyse patient VCF files to prevent adverse drug reactions and make CPIC-aligned clinical decisions. Built for Indian hospitals and labs.",
    url: "https://www.genomeguard.in",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const medicalWebPageSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "GenomeGuard — AI-Powered Pharmacogenomics",
  url: "https://www.genomeguard.in",
  description:
    "AI platform for pharmacogenomic analysis of VCF files. Aligned with CPIC and PharmGKB guidelines. Designed for Indian hospitals.",
  about: {
    "@type": "MedicalCondition",
    name: "Adverse Drug Reactions",
  },
  audience: {
    "@type": "MedicalAudience",
    audienceType: "Clinician",
  },
  medicalAudience: "Clinician",
  inLanguage: "en-IN",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GenomeGuard",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "AI-powered pharmacogenomic risk analysis platform for Indian hospitals. Analyse VCF files for drug-gene interactions aligned with CPIC guidelines.",
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: "299",
    url: "https://www.genomeguard.in/pricing",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "24",
  },
};



export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0b1e40] overflow-x-hidden">
      <Script id="schema-medical-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }} />
      <Script id="schema-software" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <PageLoader />
      <NavBar />
      <HeroSection />
      <AnalysisTool />
      <HowItWorks />
      <FeaturesSection />

      <SupportedGenesDrugs />
      <HospitalWaitlist />
      <Footer />
    </main>
  );
}
