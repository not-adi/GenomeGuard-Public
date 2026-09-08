import { Mulish, Oxanium } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "./Providers";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE_URL = "https://www.genomeguard.in";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
    template: "%s | GenomeGuard",
  },
  description:
    "India's leading AI pharmacogenomic platform. Analyse patient VCF files to predict drug risks, prevent adverse drug reactions (ADRs), and deliver CPIC-aligned clinical decisions — built for Indian hospitals, labs, and clinicians.",
  keywords: [
    "pharmacogenomics India",
    "PGx testing hospitals India",
    "VCF file analysis",
    "adverse drug reaction prevention",
    "CYP2D6 CYP2C19 drug metabolism",
    "CPIC guidelines",
    "hospital genomics SaaS",
    "precision medicine India",
    "EHR genomics integration",
    "ABHA pharmacogenomics",
    "genomic analysis platform",
    "pharmacogenomic report",
    "drug gene interaction India",
    "GenomeGuard",
  ],
  authors: [{ name: "GenomeGuard", url: BASE_URL }],
  creator: "GenomeGuard",
  publisher: "GenomeGuard",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "GenomeGuard",
    title: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
    description:
      "Analyse patient VCF files to predict drug risks, prevent ADRs, and deliver CPIC-aligned clinical decisions. Built for Indian hospitals and labs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GenomeGuard — AI-Powered Pharmacogenomics for Indian Hospitals",
    description:
      "India's leading AI pharmacogenomic platform for VCF analysis, ADR prevention, and CPIC-aligned clinical decisions.",
    images: ["/og-image.png"],
    creator: "@genomeguard",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "healthcare technology",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GenomeGuard",
  url: BASE_URL,
  logo: `${BASE_URL}/3.svg`,
  description:
    "AI-powered pharmacogenomic risk analysis platform for Indian hospitals, labs, and clinicians. Aligned with CPIC and PharmGKB guidelines.",
  foundingLocation: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressCountry: "IN" },
  },
  areaServed: "IN",
  knowsAbout: [
    "Pharmacogenomics",
    "VCF File Analysis",
    "CPIC Guidelines",
    "Adverse Drug Reaction Prevention",
    "Precision Medicine",
    "EHR Integration",
    "ABHA Health Records",
  ],
  sameAs: [
    "https://www.linkedin.com/company/genomeguard",
    "https://twitter.com/genomeguard",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GenomeGuard",
  url: BASE_URL,
  description:
    "India's leading AI pharmacogenomic platform for hospitals and labs.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "SiteNavigationElement",
      position: 1,
      name: "Blogs",
      url: `${BASE_URL}/blogs-publications`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 2,
      name: "Partner with Us",
      url: `${BASE_URL}/#hospital-waitlist`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 3,
      name: "Drug Matrix",
      url: `${BASE_URL}/safety-matrix`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 4,
      name: "Try Analysis",
      url: `${BASE_URL}/#analyze`,
    },
    {
      "@type": "SiteNavigationElement",
      position: 5,
      name: "Careers",
      url: `${BASE_URL}/careers`,
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <meta name="theme-color" content="#0b1e40" />
        <link rel="manifest" href="/manifest.json" />
        <Script
          id="schema-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-sitenavigation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
      </head>
      <body className={`${mulish.variable} ${oxanium.variable} antialiased`}>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

