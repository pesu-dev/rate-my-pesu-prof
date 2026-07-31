"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { setToken } from "../../lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { API_BASE } = require("../../lib/api");
      const isStudent = username.toUpperCase().startsWith("PES");
      const endpoint = isStudent ? "/api/auth/pesu-login" : "/api/auth/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token, data.user);
        const redirect = new URLSearchParams(window.location.search).get("redirect");
        window.location.href = data.user.role === "admin" ? "/admin" : (redirect || "/");
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle aurora background */}
      <div className="hero-aurora" />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand mark */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 overflow-hidden"
            style={{
              boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
              border: "1px solid var(--border)",
            }}
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>

          <h1
            className="text-2xl font-extrabold tracking-tight mb-1"
            style={{ color: "var(--text)" }}
          >
            Sign In
          </h1>

          <div className="flex items-center justify-center gap-1.5 mt-1">
            <p className="text-sm" style={{ color: "var(--subtle)" }}>
              Use your PESU Academy credentials
            </p>
            {/* Tooltip */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                className="cursor-help"
              >
                <HelpCircle className="w-3.5 h-3.5" style={{ color: "var(--border2)" }} />
              </button>
              {showTip && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 rounded-xl text-[11px] leading-relaxed text-center z-20"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--muted)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                  }}
                >
                  We use PESU credentials to prevent spam and ensure reviews come from verified PES students.
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                    style={{ borderTopColor: "var(--border)" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-4 editorial-shadow"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Error banner */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm mb-5 text-center"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* SRN field */}
            <div>
              <label
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: "var(--subtle)" }}
              >
                PESU SRN
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. PES1UG22CS001"
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: "var(--subtle)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Privacy checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <div className="relative flex items-center h-5 flex-shrink-0">
                <input
                  id="privacy-policy"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4 rounded appearance-none cursor-pointer transition-all"
                  style={{
                    background: accepted ? "var(--accent)" : "var(--surface2)",
                    border: `1.5px solid ${accepted ? "var(--accent)" : "var(--border2)"}`,
                  }}
                />
                {/* Custom checkmark */}
                {accepted && (
                  <svg
                    className="absolute inset-0 w-4 h-4 text-white pointer-events-none p-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <label
                htmlFor="privacy-policy"
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                I have read and agree to the{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 transition-colors"
                  style={{ color: "var(--accent)" }}
                  onMouseEnter={e => e.target.style.color = "var(--accent-l)"}
                  onMouseLeave={e => e.target.style.color = "var(--accent)"}
                >
                  Privacy Policy & Community Rules
                </Link>
                .
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !accepted}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "var(--accent)",
                boxShadow: "0 4px 14px rgba(53,37,205,0.25)",
              }}
              onMouseEnter={e => (!loading && accepted) && (e.currentTarget.style.background = "var(--accent-l)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Authenticating…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px]" style={{ color: "var(--subtle)" }}>
          Your SRN is cryptographically hashed — we never store it in plaintext.
        </p>

      </div>
    </div>
  );
}
