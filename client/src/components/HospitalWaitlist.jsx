"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Mail,
  User,
  Phone,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  BedDouble,
} from "lucide-react";

const ORG_TYPES = [
  "Hospital",
  "Multi-Specialty Clinic",
  "Diagnostic Lab",
  "IVF Center",
  "Pharmacy Chain",
  "Research Institute",
  "Other",
];

export default function HospitalWaitlist() {
  const [form, setForm] = useState({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    orgType: "",
    bedCount: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      let response;
      try {
        response = await fetch(`${API_URL}/api/waitlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });
      } catch (fetchErr) {
        // Fallback from localhost to 127.0.0.1 (IPv4) in case of IPv6 resolution issues on Windows
        if (API_URL.includes("localhost")) {
          const fallbackUrl = API_URL.replace("localhost", "127.0.0.1");
          try {
            response = await fetch(`${fallbackUrl}/api/waitlist`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(form),
            });
          } catch (fallbackErr) {
            throw new Error(`Connection failed. Tried primary: ${API_URL}/api/waitlist (${fetchErr.message}) and fallback: ${fallbackUrl}/api/waitlist (${fallbackErr.message}). Is backend running?`);
          }
        } else {
          throw new Error(`Connection failed to ${API_URL}/api/waitlist: ${fetchErr.message}`);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit waitlist details.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="hospital-waitlist"
      className="relative py-24 px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(168deg, #0b1e40 0%, #0f2847 40%, #132f52 70%, #0b1e40 100%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(169,187,157,1) 1px, transparent 1px), linear-gradient(90deg, rgba(169,187,157,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a9bb9d]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#a9bb9d]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* ─── Left: Copy ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-[#a9bb9d]/20 text-[#a9bb9d] text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Partner Program
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-5">
              Bring Precision Medicine
              <br />
              <span className="text-[#a9bb9d]">to Your Institution</span>
            </h2>

            <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              We are currently seeking pilot institutes to partner with us for research and early-stage deployment. Collaborate with us to integrate pharmacogenomic analysis into clinical workflows ahead of general availability.
            </p>

            {/* Stats / trust signals */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "20", label: "Genes Covered" },
                { value: "45+", label: "Drugs Analyzed" },
                { value: "<30s", label: "Report Time" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl py-4 px-2"
                >
                  <div className="text-xl sm:text-2xl font-bold text-[#a9bb9d] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-[11px] font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/30 text-xs">
              🔒 Your data is never shared. We comply with Indian health data
              regulations.
            </p>
          </motion.div>

          {/* ─── Right: Form ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl">
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#a9bb9d]/10 to-transparent rounded-tr-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <h3 className="text-white text-xl font-bold mb-1">
                      Partner with Us
                    </h3>
                    <p className="text-white/40 text-sm mb-6">
                      Fill in your details and we'll reach out with next steps.
                    </p>

                    {/* Org Name */}
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <input
                        name="orgName"
                        type="text"
                        required
                        placeholder="Hospital / Clinic Name"
                        value={form.orgName}
                        onChange={handleChange}
                        className="w-full bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all"
                      />
                    </div>

                    {/* Contact Name */}
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <input
                        name="contactName"
                        type="text"
                        required
                        placeholder="Contact Person Name"
                        value={form.contactName}
                        onChange={handleChange}
                        className="w-full bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Official Email Address"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none select-none">+91</span>
                      <input
                        name="phone"
                        type="tel"
                        required
                        placeholder="Mobile Number"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        value={form.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setForm((prev) => ({ ...prev, phone: val }));
                          setError("");
                        }}
                        className="w-full bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-[4.25rem] pr-4 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all"
                      />
                    </div>

                    {/* Row: Org Type + Bed Count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Org Type */}
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                        <select
                          name="orgType"
                          required
                          value={form.orgType}
                          onChange={handleChange}
                          className="w-full appearance-none bg-white/[0.05] border border-white/10 text-white rounded-xl pl-10 pr-8 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all cursor-pointer"
                        >
                          <option value="" disabled className="text-gray-800">
                            Organization Type
                          </option>
                          {ORG_TYPES.map((t) => (
                            <option key={t} value={t} className="text-gray-800">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Bed Count */}
                      <div className="relative">
                        <BedDouble className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                        <input
                          name="bedCount"
                          type="number"
                          min="1"
                          placeholder="Approx. Bed Count"
                          value={form.bedCount}
                          onChange={handleChange}
                          className="w-full bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#a9bb9d]/40 focus:ring-1 focus:ring-[#a9bb9d]/20 transition-all"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/25 text-red-200 text-xs rounded-xl">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                       type="submit"
                       disabled={loading}
                       className="w-full relative bg-[#a9bb9d] hover:bg-[#97ad8e] text-[#0b1e40] font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-[#a9bb9d]/10 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
                     >
                       <span
                         className={`inline-flex items-center gap-2 transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}
                       >
                         Submit Partnership Request
                       </span>
                       {loading && (
                         <span className="absolute inset-0 flex items-center justify-center">
                           <span className="w-5 h-5 border-2 border-[#0b1e40]/30 border-t-[#0b1e40] rounded-full animate-spin" />
                         </span>
                       )}
                     </button>
 
                     <p className="text-white/20 text-[11px] text-center mt-2">
                       No commitment required · Review in 48 hours
                     </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-8 h-8 text-[#a9bb9d]" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      You're on the List!
                    </h3>
                    <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                      Thank you for your interest. Our partnerships team will
                      reach out within 48 hours to discuss integration with{" "}
                      <span className="text-[#a9bb9d] font-semibold">
                        {form.orgName || "your institution"}
                      </span>
                      .
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
