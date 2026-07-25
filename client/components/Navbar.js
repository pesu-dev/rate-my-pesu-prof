"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, clearToken } from "../lib/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setUser(getUser()); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { clearToken(); setUser(null); window.location.reload(); };

  return (
    <nav
      style={{
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(248,249,250,0.80)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
      }}
      className="sticky top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all overflow-hidden"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                border: "1px solid var(--border)",
              }}
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span
                className="block text-[15px] font-bold tracking-tight transition-colors"
                style={{ color: "var(--text)", lineHeight: 1.2 }}
              >
                RateMyProf
              </span>
              <span className="block text-[9px] tracking-widest uppercase font-medium" style={{ color: "var(--subtle)" }}>
                PES Edition
              </span>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3">
            <p className="hidden lg:block text-[11px] italic" style={{ color: "var(--subtle)" }}>
              Student opinions, not official evaluations
            </p>
            <div className="hidden lg:block w-px h-5" style={{ background: "var(--border2)" }} />

            {user ? (
              <div className="flex items-center gap-3">
                <span
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  {user.role === "admin" ? "Admin" : user.srn || "Student"}
                </span>

                {user.role === "admin" && (
                  <Link href="/admin"
                    className="text-xs font-medium transition-colors"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={e => e.target.style.color = "var(--text)"}
                    onMouseLeave={e => e.target.style.color = "var(--muted)"}
                  >
                    Dashboard
                  </Link>
                )}

                <button onClick={handleLogout}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                  style={{
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    color: "var(--muted)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="text-sm font-semibold px-5 py-2 rounded-xl transition-all active:scale-95 text-white"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 4px 14px rgba(53,37,205,0.25)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--accent-l)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--accent)"}
              >
                Sign In to Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
