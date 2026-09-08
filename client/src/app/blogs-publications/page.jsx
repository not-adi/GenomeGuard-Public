import BlogsFaqClientPage from "./_client";

export const metadata = {
  title: "Blogs & Publications \u2014 GenomeGuard",
  description:
    "In-depth articles, publications, and expert answers on pharmacogenomics, VCF file analysis, CYP450 enzymes, CPIC guidelines, and adverse drug reaction prevention in India.",
  keywords: [
    "pharmacogenomics blog India",
    "pharmacogenomics publications",
    "VCF file analysis explained",
    "CYP2D6 CYP2C19 drug metabolism",
    "CPIC guidelines India",
    "adverse drug reactions India statistics",
    "precision medicine FAQ",
    "genomic testing FAQ India",
  ],
  alternates: { canonical: "https://www.genomeguard.in/blogs-publications" },
  openGraph: {
    title: "Blogs & Publications \u2014 GenomeGuard",
    description:
      "Expert articles and publications on pharmacogenomics, VCF analysis, and ADR prevention.",
    url: "https://www.genomeguard.in/blogs-publications",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function BlogsFaqPage() {
  return <BlogsFaqClientPage />;
}
