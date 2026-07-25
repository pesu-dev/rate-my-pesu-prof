"use client";

import { useState, useEffect } from "react";
import ProfessorCard from "../components/ProfessorCard";
import RequestProfessorModal from "../components/RequestProfessorModal";
import { fetchProfessors } from "../lib/api";
import { AlertCircle, ChevronLeft, ChevronRight, Search, GraduationCap, Star } from "lucide-react";

const DEPARTMENTS = [
  "Architecture", "Biotechnology", "Civil", "Commerce", "Computer Application",
  "Computer Science", "Computer Science (AIML)", "Design", "Electrical & Electronics",
  "Electronics & Communications", "Law", "Management Studies", "Mechanical",
  "Pharmaceutical Sciences", "Psychology", "Science & Humanities"
];

const CAMPUS_OPTIONS = ["All", "EC Campus", "RR Campus"];
const RATING_OPTIONS = [
  { label: "Any Rating", value: 0 },
  { label: "2+ ★", value: 2 },
  { label: "3+ ★", value: 3 },
  { label: "4+ ★", value: 4 },
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 space-y-4 editorial-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl ml-4 flex-shrink-0" />
      </div>
      <div className="skeleton h-3 w-2/5" />
      <div className="border-t border-outline-variant/30" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-20 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, delay }) {
  return (
    <div
      className="fade-up inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-outline-variant/50 editorial-shadow"
      style={{ animationDelay: delay, opacity: 0, animationFillMode: "forwards" }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: "var(--accent-l)" }} />
      <span className="text-sm font-semibold text-on-surface">{value}</span>
      <span className="text-xs text-outline">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCampus, setSelectedCampus] = useState("All");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFound, setTotalFound] = useState(0);
  const [totalProfessors, setTotalProfessors] = useState(null);
  const limit = 12;

  useEffect(() => {
    fetchProfessors({ limit: 1, page: 1 })
      .then(d => setTotalProfessors(d.total))
      .catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [search, minRating, selectedDepartment, selectedCampus]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError("");
      try {
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (minRating > 0) params.minRating = minRating;
        if (selectedDepartment !== "All") params.department = selectedDepartment;
        if (selectedCampus !== "All") params.campus = selectedCampus;
        const data = await fetchProfessors(params);
        setProfessors(data.professors);
        setTotalPages(data.pages);
        setTotalFound(data.total);
      } catch {
        setError("Failed to load professors. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(load, page === 1 ? 50 : 300);
    return () => clearTimeout(timer);
  }, [search, minRating, selectedDepartment, selectedCampus, page]);

  const hasActiveFilters = search || minRating > 0 || selectedDepartment !== "All" || selectedCampus !== "All";

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FA", color: "var(--text)" }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-14 overflow-hidden" style={{ background: "#F8F9FA" }}>
        <div className="hero-aurora" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          {/* Eyebrow label */}
          <div
            className="fade-up inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              border: "1px solid var(--accent-border)",
              background: "var(--accent-bg)",
              color: "var(--accent)",
              animationDelay: "0s", animationFillMode: "forwards",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            PES University · Student Reviews
          </div>

          {/* Heading */}
          <h1
            className="fade-up font-black tracking-tight mb-2 leading-[1.05]"
            style={{
              fontSize: "clamp(3rem, 9vw, 5.5rem)",
              color: "var(--text)",
              letterSpacing: "-0.03em",
              animationDelay: "0.08s", opacity: 0, animationFillMode: "forwards",
            }}
          >
            Rate My Prof
          </h1>
          {/* Indigo underline accent */}
          <div
            className="fade-up mx-auto rounded-full mb-7"
            style={{
              width: 64, height: 3,
              background: "var(--accent)",
              animationDelay: "0.13s", opacity: 0, animationFillMode: "forwards",
            }}
          />

          <p
            className="fade-up text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto"
            style={{
              color: "var(--muted)",
              animationDelay: "0.16s", opacity: 0, animationFillMode: "forwards",
            }}
          >
            Honest, anonymous professor reviews by real PES students. Find your
            professor and make informed choices.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatPill icon={GraduationCap} value={totalProfessors ? `${totalProfessors}+` : "…"} label="professors" delay="0.22s" />
            <StatPill icon={Star} value="Anonymous" label="verified reviews" delay="0.28s" />
          </div>
        </div>
      </section>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <div
          className="rounded-2xl p-4 sm:p-5 space-y-4 bg-white editorial-shadow"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--subtle)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search professors by name…"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
              onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Campus chips */}
            {CAMPUS_OPTIONS.map(c => (
              <button key={c} onClick={() => setSelectedCampus(c)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${selectedCampus === c ? "chip-active" : "chip-inactive"}`}>
                {c === "All" ? "All Campuses" : c}
              </button>
            ))}

            <div className="w-px h-4 hidden sm:block" style={{ background: "var(--border2)" }} />

            {/* Rating chips */}
            {RATING_OPTIONS.map(r => (
              <button key={r.value} onClick={() => setMinRating(r.value)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${minRating === r.value ? "chip-active" : "chip-inactive"}`}>
                {r.label}
              </button>
            ))}

            <div className="w-px h-4 hidden sm:block" style={{ background: "var(--border2)" }} />

            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--muted)" }}
              className="border rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer transition-all"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(""); setMinRating(0); setSelectedDepartment("All"); setSelectedCampus("All"); }}
                className="ml-auto text-xs transition-colors cursor-pointer"
                style={{ color: "var(--subtle)" }}
                onMouseEnter={e => e.target.style.color = "#ef4444"}
                onMouseLeave={e => e.target.style.color = "var(--subtle)"}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {error && (
          <div className="max-w-lg mx-auto mb-8 rounded-2xl px-6 py-5 text-center"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <p className="text-sm font-medium" style={{ color: "#dc2626" }}>{error}</p>
            <p className="text-xs mt-1" style={{ color: "var(--subtle)" }}>Make sure the server is running on port 5000</p>
          </div>
        )}

        {!loading && !error && (
          <div className="mb-5">
            <p className="text-xs" style={{ color: "var(--subtle)" }}>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>{totalFound}</span>{" "}
              {hasActiveFilters ? "professors found" : `professors · page ${page} of ${totalPages}`}
            </p>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && professors.length === 0 && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white editorial-shadow"
              style={{ border: "1px solid var(--border)" }}>
              <Search className="w-5 h-5" style={{ color: "var(--subtle)" }} />
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: "var(--muted)" }}>No professors found</p>
            <p className="text-sm" style={{ color: "var(--subtle)" }}>Try adjusting your search or clearing filters</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && professors.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map((prof, i) => (
                <ProfessorCard key={prof._id} professor={prof} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed bg-white editorial-shadow"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pNum = i + 1;
                    if (totalPages > 7 && pNum !== 1 && pNum !== totalPages && Math.abs(pNum - page) > 1) {
                      if (pNum === page - 2 || pNum === page + 2)
                        return <span key={pNum} className="px-1 text-sm" style={{ color: "var(--subtle)" }}>…</span>;
                      return null;
                    }
                    return (
                      <button key={pNum} onClick={() => setPage(pNum)}
                        className="min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                        style={page === pNum
                          ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 14px rgba(53,37,205,0.30)" }
                          : { background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        {pNum}
                      </button>
                    );
                  })}
                </div>

                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed bg-white editorial-shadow"
                  style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer CTA ────────────────────────────────────────── */}
      <div style={{ borderTopColor: "var(--border)" }} className="border-t bg-white">
        <div className="max-w-xl mx-auto text-center px-4 py-12">
          <p className="text-sm mb-4" style={{ color: "var(--subtle)" }}>
            Can't find your professor in the directory?
          </p>
          <button onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer bg-white editorial-shadow"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: "var(--amber)" }} />
            Report a Missing Professor
          </button>
        </div>
      </div>

      <RequestProfessorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
