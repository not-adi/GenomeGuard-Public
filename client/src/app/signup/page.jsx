"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  IconStethoscope,
  IconUser,
  IconMail,
  IconLock,
  IconUserPlus,
  IconAlertTriangle,
} from "@tabler/icons-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { signup, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, fullName);
      router.push(returnTo);
    } catch (err) {
      setError(err?.message || "Signup failed.");
    }
    setLoading(false);
  };

  // ── Google Sign-In callback ──
  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) return;
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      router.push(returnTo);
    } catch (err) {
      setError(err?.message || "Google sign-up failed.");
    }
    setLoading(false);
  }, [loginWithGoogle, router]);

  // ── Initialize Google Sign-In button ──
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      const btnContainer = document.getElementById("google-signin-btn-signup");
      if (btnContainer) {
        btnContainer.innerHTML = "";
        window.google.accounts.id.renderButton(btnContainer, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: "400",
          text: "signup_with",
          shape: "pill",
          logo_alignment: "left",
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 5000);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-[#f6f9f4] border-r border-[#a9bb9d]/15 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: "linear-gradient(rgba(169,187,157,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(169,187,157,.08) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#a9bb9d]/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#a9bb9d]/8 blur-3xl" />

        <div className="relative z-10">
          <a href="/" className="inline-flex"><img src="/3.svg" alt="GenomeGuard" className="h-8 w-auto" /></a>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <span className="block w-8 h-px bg-[#a9bb9d]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#a9bb9d]">Join GenomeGuard</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-[#1a1a1a] tracking-tight leading-[1.15]">
            Start your<br />
            <span className="text-[#a9bb9d]">genomics journey.</span>
          </h1>
          <p className="text-[#777] text-sm leading-relaxed max-w-sm">
            Create your doctor account to access personalized pharmacogenomic analysis tools and CPIC-guided prescribing.
          </p>
          <div className="space-y-3 pt-4">
            {[
              { icon: "🩺", text: "Clinical-grade PGx analysis" },
              { icon: "🧬", text: "Personalized drug-gene insights" },
              { icon: "📋", text: "PDF report generation" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <span className="text-base">{b.icon}</span>
                <span className="text-sm text-[#555]">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[#bbb] text-[11px] leading-relaxed">GenomeGuard · Research use only.</p>
        </div>
      </div>

      {/* ── Right panel — signup form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <a href="/"><img src="/3.svg" alt="GenomeGuard" className="h-7 w-auto" /></a>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5a7a52]/10 text-[#5a7a52]">
              <IconStethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a] tracking-tight">Doctor Sign Up</h2>
              <p className="text-xs text-[#bbb] mt-0.5">Healthcare Professional</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
              <IconAlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a9bb9d] block mb-1.5">Full Name</label>
              <div className="relative">
                <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#a9bb9d]/20 focus:border-[#a9bb9d] focus:ring-2 focus:ring-[#a9bb9d]/10 outline-none text-sm text-[#1a1a1a] placeholder:text-[#ddd] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a9bb9d] block mb-1.5">Email</label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#a9bb9d]/20 focus:border-[#a9bb9d] focus:ring-2 focus:ring-[#a9bb9d]/10 outline-none text-sm text-[#1a1a1a] placeholder:text-[#ddd] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a9bb9d] block mb-1.5">Password</label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#a9bb9d]/20 focus:border-[#a9bb9d] focus:ring-2 focus:ring-[#a9bb9d]/10 outline-none text-sm text-[#1a1a1a] placeholder:text-[#ddd] transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim() || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#5a7a52] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-2 hover:bg-[#4a6a44] hover:shadow-lg hover:shadow-[#5a7a52]/20"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  Create Account
                  <IconUserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#e8e8e8]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ccc]">or</span>
            <div className="flex-1 h-px bg-[#e8e8e8]" />
          </div>

          {/* ── Google Sign-Up Button ── */}
          <div className="flex justify-center">
            <div id="google-signin-btn-signup" />
          </div>

          <p className="text-center text-[10px] text-[#ccc] mt-5 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-[#a9bb9d] font-semibold hover:text-[#6b8760] transition-colors">Terms of Service</a>{" "}
            and <a href="#" className="text-[#a9bb9d] font-semibold hover:text-[#6b8760] transition-colors">Privacy Policy</a>.
          </p>

          <p className="text-center text-xs text-[#ccc] mt-4">
            Already have an account?{" "}
            <a href={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="text-[#a9bb9d] font-semibold hover:text-[#6b8760] transition-colors">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white/60 backdrop-blur-md">
          <video
            src="/loader.webm"
            autoPlay
            muted
            loop
            playsInline
            className="w-[166px] h-[166px] object-contain"
          />
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}
