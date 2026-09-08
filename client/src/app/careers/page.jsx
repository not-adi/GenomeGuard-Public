import CareersClientPage from "./_client";

export const metadata = {
  title: "Careers \u2014 Join GenomeGuard, India\u2019s Precision Medicine Platform",
  description:
    "Join the team building India's leading AI pharmacogenomics platform. Open roles in bioinformatics, software engineering, clinical science, and product at GenomeGuard.",
  keywords: [
    "bioinformatics jobs India",
    "genomics startup careers",
    "precision medicine jobs India",
    "pharmacogenomics engineer",
    "health tech careers Bengaluru",
  ],
  alternates: { canonical: "https://www.genomeguard.in/careers" },
  openGraph: {
    title: "Careers \u2014 Join GenomeGuard, India\u2019s Precision Medicine Platform",
    description:
      "Open roles in bioinformatics, software engineering, clinical science, and product at GenomeGuard.",
    url: "https://www.genomeguard.in/careers",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CareersPage() {
  return <CareersClientPage />;
}
