"use client";

import Link from "next/link";
import StarRating from "./StarRating";

function getRatingConfig(rating) {
  if (rating >= 4.5) return {
    bg: "rgba(16,185,129,0.10)", text: "#059669", border: "rgba(16,185,129,0.25)",
    glow: "glow-green", badge: "Top Rated", badgeBg: "rgba(16,185,129,0.08)",
    badgeText: "#059669", badgeBorder: "rgba(16,185,129,0.22)",
  };
  if (rating >= 4) return {
    bg: "rgba(16,185,129,0.08)", text: "#059669", border: "rgba(16,185,129,0.20)",
    glow: "glow-green", badge: null,
  };
  if (rating >= 3) return {
    bg: "rgba(245,158,11,0.08)", text: "#b45309", border: "rgba(245,158,11,0.22)",
    glow: "glow-amber", badge: null,
  };
  if (rating > 0) return {
    bg: "rgba(239,68,68,0.08)", text: "#dc2626", border: "rgba(239,68,68,0.20)",
    glow: "glow-red", badge: null,
  };
  // No reviews
  return {
    bg: "var(--surface2)", text: "var(--subtle)", border: "var(--border)",
    glow: "", badge: "New",
    badgeBg: "var(--accent-bg)", badgeText: "var(--accent)", badgeBorder: "var(--accent-border)",
  };
}

export default function ProfessorCard({ professor, index = 0 }) {
  const { _id, name, department, campus, subjects, averageRating, totalReviews } = professor;
  const cfg = getRatingConfig(averageRating);

  return (
    <Link href={`/professor/${_id}`} className="block group">
      <div
        className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 editorial-shadow ${cfg.glow ? `hover:${cfg.glow}` : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-border)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
      >
        {/* Badge */}
        {cfg.badge && (
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: cfg.badgeBg, color: cfg.badgeText, border: `1px solid ${cfg.badgeBorder}` }}>
            {cfg.badge === "Top Rated" ? "🔥 " : ""}{cfg.badge}
          </span>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className={`flex items-start justify-between mb-3 ${cfg.badge ? "mt-5" : ""}`}>
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-[15px] font-semibold leading-snug truncate transition-colors"
                style={{ color: "var(--text)" }}
                onMouseEnter={e => e.target.style.color = "var(--accent-l)"}
                onMouseLeave={e => e.target.style.color = "var(--text)"}
              >
                {name}
              </h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--subtle)" }}>
                {department}{campus && campus !== "Unknown" ? ` · ${campus}` : ""}
              </p>
            </div>

            {/* Rating badge */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-base font-black"
              style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
              {averageRating > 0 ? averageRating.toFixed(1) : "–"}
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={averageRating} size="text-sm" />
            <span className="text-xs" style={{ color: "var(--subtle)" }}>
              {totalReviews === 0 ? "No reviews yet" : `${totalReviews} ${totalReviews === 1 ? "review" : "reviews"}`}
            </span>
          </div>

          {/* Divider */}
          <div className="mb-4" style={{ height: 1, background: "var(--border)" }} />

          {/* Subjects */}
          {subjects && subjects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 3).map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-md truncate max-w-[140px]"
                  style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  {s}
                </span>
              ))}
              {subjects.length > 3 && (
                <span className="text-[11px] px-1" style={{ color: "var(--subtle)" }}>
                  +{subjects.length - 3}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs italic" style={{ color: "var(--subtle)" }}>No subjects listed</p>
          )}
        </div>

        {/* Arrow */}
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <svg className="w-4 h-4" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
