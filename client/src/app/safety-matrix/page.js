import NavBar from "@/components/NavBar";
import SafetyMatrix from "@/components/SafetyMatrix";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = {
  title: "Drug Safety Matrix — GenomeGuard",
  description:
    "Explore the comprehensive gene-drug safety matrix. Color-coded reference guide showing pharmacogenomic risk levels for every phenotype-drug combination, powered by CPIC guidelines.",
  alternates: { canonical: "https://www.genomeguard.in/safety-matrix" },
  openGraph: {
    title: "Drug Safety Matrix — GenomeGuard",
    description:
      "Color-coded gene-drug safety grid showing risk levels for every phenotype-drug combination at a glance. Built on CPIC guidelines.",
    url: "https://www.genomeguard.in/safety-matrix",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function SafetyMatrixPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white text-[#0b1e40]">
        <NavBar />
        <SafetyMatrix />
        <Footer />
      </main>
    </ProtectedRoute>
  );
}
