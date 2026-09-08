"use client";
import { useState } from "react";

const SUPPORTED_DRUGS = [
  { name: "CODEINE", gene: "CYP2D6", desc: "Pain reliever / opioid" },
  { name: "WARFARIN", gene: "CYP2C9", desc: "Blood thinner" },
  { name: "CLOPIDOGREL", gene: "CYP2C19", desc: "Antiplatelet" },
  { name: "SIMVASTATIN", gene: "SLCO1B1", desc: "Cholesterol statin" },
  { name: "AZATHIOPRINE", gene: "TPMT", desc: "Immunosuppressant" },
  { name: "FLUOROURACIL", gene: "DPYD", desc: "Chemotherapy" },
];

const ALL_SUPPORTED_DRUGS = [
  "ALLOPURINOL", "AMITRIPTYLINE", "APIXABAN", "ARIPIPRAZOLE", "ATAZANAVIR", "ATORVASTATIN",
  "AZATHIOPRINE", "BUPROPION", "CAPECITABINE", "CARBAMAZEPINE", "CARVEDILOL", "CITALOPRAM",
  "CLOPIDOGREL", "CLOZAPINE", "CODEINE", "DABIGATRAN", "DULOXETINE", "EFAVIRENZ",
  "ESCITALOPRAM", "ESOMEPRAZOLE", "FENTANYL", "FLUOROURACIL", "FLUOXETINE", "FLUVASTATIN",
  "HALOPERIDOL", "HYDROCODONE", "IRINOTECAN", "ISONIAZID", "LAMOTRIGINE", "LOVASTATIN",
  "MERCAPTOPURINE", "METHADONE", "METOPROLOL", "MORPHINE", "MYCOPHENOLATE", "NORTRIPTYLINE",
  "OMEPRAZOLE", "OXCARBAMAZEPINE", "OXYCODONE", "PANTOPRAZOLE", "PAROXETINE", "PRAVASTATIN",
  "PRIMAQUINE", "PROPAFENONE", "RASBURICASE", "RIBAVIRIN", "RIFAMPICIN", "RISPERIDONE",
  "ROSUVASTATIN", "SERTRALINE", "SIMVASTATIN", "TACROLIMUS", "TAMOXIFEN", "THEOPHYLLINE",
  "TRAMADOL", "VENLAFAXINE", "VORICONAZOLE", "WARFARIN"
];

export default function DrugInput({ drugs, onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrug = (name) => {
    const upperName = name.toUpperCase();
    onChange(
      drugs.includes(upperName)
        ? drugs.filter((d) => d !== upperName)
        : [...drugs, upperName],
    );
  };

  const removeDrug = (name) => {
    onChange(drugs.filter((d) => d !== name.toUpperCase()));
  };

  const filteredDrugs = ALL_SUPPORTED_DRUGS.filter((d) =>
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-[#a9bb9d]/20 rounded-2xl p-6 shadow-sm relative">
      {/* Click-outside backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 flex items-center justify-center text-[#5a7a52] text-sm font-bold">
          02
        </div>
        <div>
          <h3 className="text-[#0b1e40] font-semibold text-sm">
            Select Drug(s)
          </h3>
          <p className="text-[#94a3b8] text-xs">
            Choose quick-select options or search below
          </p>
        </div>
      </div>

      {/* Drug grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {SUPPORTED_DRUGS.map((drug) => {
          const active = drugs.includes(drug.name);
          return (
            <button
              key={drug.name}
              onClick={() => toggleDrug(drug.name)}
              className={`relative p-3 rounded-xl border text-left transition-all duration-150 group ${active
                  ? "border-[#a9bb9d]/50 bg-[#a9bb9d]/10"
                  : "border-[#a9bb9d]/20 hover:border-[#a9bb9d]/40 hover:bg-[#a9bb9d]/5"
                }`}
            >
              {active && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#a9bb9d] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-2.5 h-2.5 text-white"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`text-xs font-bold mb-0.5 ${active ? "text-[#5a7a52]" : "text-[#0b1e40]"}`}
              >
                {drug.name}
              </div>
              <div className="text-[10px] text-[#94a3b8] font-mono">
                {drug.gene}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${active ? "text-[#5a7a52]/70" : "text-[#94a3b8]"}`}
              >
                {drug.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative z-40 mt-4">
        <label className="block text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
          Search all supported drugs
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search drug (e.g. isoniazid, allopurinol)..."
            className="w-full bg-[#a9bb9d]/5 border border-[#a9bb9d]/20 focus:border-[#a9bb9d]/50 focus:bg-white text-[#0b1e40] text-xs px-3.5 py-2.5 pl-9 rounded-xl outline-none placeholder:text-[#94a3b8] transition-all"
          />
          <span className="absolute left-3 top-3 text-[#94a3b8]">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#0b1e40] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && filteredDrugs.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-[#a9bb9d]/30 rounded-xl shadow-xl py-1 divide-y divide-gray-50 scrollbar-thin">
            {filteredDrugs.map((drug) => {
              const selected = drugs.includes(drug);
              return (
                <button
                  key={drug}
                  onClick={() => {
                    toggleDrug(drug);
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-[#a9bb9d]/10 transition-colors"
                >
                  <span className={`font-semibold ${selected ? "text-[#5a7a52]" : "text-[#0b1e40]"}`}>
                    {drug}
                  </span>
                  {selected && (
                    <span className="text-[#5a7a52] text-[10px] font-bold">Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected drugs list */}
      {drugs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#a9bb9d]/20">
          <p className="text-[#94a3b8] text-[10px] font-semibold uppercase tracking-widest mb-2">
            Selected ({drugs.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {drugs.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 bg-[#a9bb9d]/10 border border-[#a9bb9d]/25 text-[#5a7a52] text-xs px-2.5 py-1 rounded-full font-semibold animate-in fade-in zoom-in-95 duration-100"
              >
                {d}
                <button
                  onClick={() => removeDrug(d)}
                  className="hover:text-red-500 transition-colors w-3 h-3 flex items-center justify-center cursor-pointer"
                  aria-label={`Remove ${d}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-3 h-3"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
