"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  IconHome,
  IconDna,
  IconFlask,
  IconTestPipe,
  IconClipboardList,
  IconRocket,
  IconLogin2,
  IconLogout,
  IconUserCircle,
  IconBriefcase,
  IconId,
  IconMenu2,
  IconX,
  IconBook,
} from "@tabler/icons-react";

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <IconHome className="h-4 w-4" />,
  },
  {
    name: "Partner with Us",
    link: "/#hospital-waitlist",
    icon: <IconClipboardList className="h-4 w-4" />,
  },
  {
    name: "Family PGx",
    link: "/familypgx",
    icon: <IconTestPipe className="h-4 w-4" />,
  },
  {
    name: "Pill Scanner",
    link: "/pill-scanner",
    icon: <IconFlask className="h-4 w-4" />,
  },
  {
    name: "ABHA Connect",
    link: "/abha",
    icon: <IconId className="h-4 w-4" />,
  },
  {
    name: "Drug Matrix",
    link: "/safety-matrix",
    icon: <IconBriefcase className="h-4 w-4" />,
  },
];
export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [mobileOpen]);

  // Close mobile menu on route change (link click)
  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
    {/* Spacer to prevent content from hiding behind fixed navbar */}
    <div className="h-16" />
    <header
      ref={menuRef}
      className="w-full fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-b border-[#a9bb9d]/15 shadow-sm shadow-[#a9bb9d]/5"
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 xl:gap-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/3.svg" alt="GenomeGuard" className="w-40 h-auto" />
          </a>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center min-w-0">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className="flex items-center gap-1.5 px-2 xl:px-3 py-1.5 rounded-full text-[13px] xl:text-sm font-medium text-[#0b1e40]/70 hover:bg-[#a9bb9d]/10 hover:text-[#0b1e40] transition-colors duration-200 whitespace-nowrap shrink-0"
              >
                <span className="hidden xl:flex items-center">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <a
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#a9bb9d]/10 border border-[#a9bb9d]/20 text-xs font-semibold text-[#6b8760] hover:bg-[#a9bb9d]/20 transition-all max-w-[160px]"
                  title={user?.fullName || "Doctor"}
                >
                  <IconUserCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.fullName || "Doctor"}</span>
                </a>
                <button
                  onClick={logout}
                  className="rounded-full bg-[#a9bb9d]/10 p-2 text-[#a9bb9d] hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                  title="Sign out"
                >
                  <IconLogout className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#a9bb9d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8fa88a] hover:shadow-lg hover:shadow-[#a9bb9d]/30 transition-all duration-300"
              >
                <IconLogin2 className="h-3.5 w-3.5" />
                Login
              </a>
            )}
          </div>

          {/* Mobile: CTA + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated ? (
              <a
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#a9bb9d]/10 px-3 py-1.5 text-xs font-semibold text-[#6b8760] border border-[#a9bb9d]/20 max-w-[140px]"
                title={user?.fullName || "Doctor"}
              >
                <IconUserCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.fullName || "Doctor"}</span>
              </a>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#a9bb9d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8fa88a] transition-all duration-300"
              >
                <IconLogin2 className="h-3 w-3" />
                Login
              </a>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 rounded-xl text-[#0b1e40]/70 hover:bg-[#a9bb9d]/10 hover:text-[#0b1e40] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <IconX className="h-5 w-5" />
              ) : (
                <IconMenu2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pb-5 pt-1 space-y-1 border-t border-[#a9bb9d]/10">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={handleNavClick}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#0b1e40]/70 hover:bg-[#a9bb9d]/10 hover:text-[#0b1e40] transition-colors duration-200"
            >
              <span className="text-[#a9bb9d]">{item.icon}</span>
              {item.name}
            </a>
          ))}

          {/* Mobile logout (when authenticated) */}
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer"
            >
              <IconLogout className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}
