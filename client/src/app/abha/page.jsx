import AbhaClientPage from "./_client";

export const metadata = {
  title: "ABHA Connect \u2014 Patient Pharmacogenomic Lookup | GenomeGuard",
  description:
    "Look up patient profiles via 14-digit ABHA ID and instantly run AI pharmacogenomic analysis. Integrated with Ayushman Bharat Health Account for Indian hospitals.",
  keywords: [
    "ABHA pharmacogenomics",
    "Ayushman Bharat health account genomics",
    "patient VCF analysis ABHA",
    "India digital health genomics",
    "ABDM pharmacogenomics",
  ],
  alternates: { canonical: "https://www.genomeguard.in/abha" },
  openGraph: {
    title: "ABHA Connect \u2014 Patient Pharmacogenomic Lookup | GenomeGuard",
    description:
      "Instantly look up patient profiles via ABHA ID and run pharmacogenomic analysis. Built for Indian hospitals.",
    url: "https://www.genomeguard.in/abha",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AbhaPage() {
  return <AbhaClientPage />;
}
