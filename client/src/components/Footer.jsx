export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Resources: [
      { label: "CPIC Guidelines", href: "https://cpicpgx.org/guidelines/" },
      { label: "PharmGKB", href: "https://www.pharmgkb.org/" },
      {
        label: "VCF Format Spec",
        href: "https://samtools.github.io/hts-specs/VCFv4.2.pdf",
      },
      { label: "dbSNP", href: "https://www.ncbi.nlm.nih.gov/snp/" },
    ],
    Genes: [
      { label: "CYP2D6", href: "/#genes" },
      { label: "CYP2C19", href: "/#genes" },
      { label: "CYP2C9", href: "/#genes" },
      { label: "CYP3A5", href: "/#genes" },
      { label: "SLCO1B1", href: "/#genes" },
      { label: "TPMT", href: "/#genes" },
      { label: "DPYD", href: "/#genes" },
      { label: "NAT2", href: "/#genes" },
      { label: "HLA-B", href: "/#genes" },
      { label: "G6PD", href: "/#genes" },
      { label: "VKORC1", href: "/#genes" },
      { label: "UGT1A1", href: "/#genes" },
      { label: "CYP1A2", href: "/#genes" },
      { label: "IFNL3", href: "/#genes" },
      { label: "NUDT15", href: "/#genes" },
      { label: "CYP2C8", href: "/#genes" },
      { label: "CYP2B6", href: "/#genes" },
      { label: "HLA-A", href: "/#genes" },
      { label: "CYP3A4", href: "/#genes" },
      { label: "ABCG2", href: "/#genes" },
    ],
    Navigate: [
      { label: "Partner with Us", href: "/#hospital-waitlist" },
      { label: "Analyze VCF", href: "/#analyze" },
      { label: "Genes & Drugs", href: "/#genes" },
      { label: "Careers", href: "/careers" },
      { label: "For Hospitals", href: "/#hospital-waitlist" },
      { label: "Drug Safety Matrix", href: "/safety-matrix" },
      { label: "Pricing", href: "/pricing" },
    ],
  };

  return (
    <footer className="bg-black">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#a9bb9d]/30 to-transparent" />

      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column — Spans 4 of 12 columns */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-5">
            <a href="/" className="inline-flex self-start">
              <img src="/3.svg" alt="GenomeGuard" className="h-9 w-auto" />
            </a>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              AI-powered pharmacogenomic risk analysis. Helping clinicians and
              researchers make safer, personalised medication decisions.
            </p>
            <span className="self-start inline-flex items-center gap-1.5 bg-black border border-[#a9bb9d]/20 text-[#a9bb9d] text-[11px] font-semibold px-3 py-1.5 rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              Research Use Only
            </span>
          </div>

          {/* Resources Column — Spans 2 of 12 columns */}
          <div className="col-span-6 sm:col-span-3 md:col-span-2">
            <h4 className="text-[#a9bb9d] text-xs font-semibold uppercase tracking-widest mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {links.Resources.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white text-sm transition-colors duration-150 inline-flex items-center gap-1.5 group"
                  >
                    {item.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Genes Column — Spans 4 of 12 columns */}
          <div className="col-span-12 sm:col-span-6 md:col-span-4 flex flex-col sm:items-center">
            <div className="w-fit flex flex-col items-center">
              <h4 className="text-[#a9bb9d] text-xs font-semibold uppercase tracking-widest mb-5 text-center">
                Genes
              </h4>
              <div className="flex gap-x-12">
                {/* Column 1 */}
                <div className="flex flex-col gap-3">
                  {links.Genes.slice(0, 10).map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-white/40 hover:text-white text-sm transition-colors duration-150 text-left"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                {/* Column 2 */}
                <div className="flex flex-col gap-3">
                  {links.Genes.slice(10, 20).map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-white/40 hover:text-white text-sm transition-colors duration-150 text-left"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigate Column — Spans 2 of 12 columns */}
          <div className="col-span-6 sm:col-span-3 md:col-span-2">
            <h4 className="text-[#a9bb9d] text-xs font-semibold uppercase tracking-widest mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {links.Navigate.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/40 hover:text-white text-sm transition-colors duration-150"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 text-white/30 text-xs">
          <p className="shrink-0">
            &copy; {currentYear} GenomeGuard. All rights reserved.
          </p>
          <p className="text-center">
            For Queries/Questions - mail us at <a href="mailto:contact@genomeguard.tech" className="text-white/50 hover:text-white underline transition-colors duration-150">contact@genomeguard.tech</a>
          </p>
          <div className="flex gap-6 shrink-0">
            <a href="/privacy" className="hover:text-white transition-colors duration-150">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors duration-150">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
