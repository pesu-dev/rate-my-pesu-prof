"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { fetchProfessor, fetchReviews } from "../../../lib/api";
import StarRating from "../../../components/StarRating";
import RatingBreakdown from "../../../components/RatingBreakdown";
import ReviewCard from "../../../components/ReviewCard";
import AddReviewForm from "../../../components/AddReviewForm";
import { isAuthenticated, getToken } from "../../../lib/auth";

// ── Loading skeleton ─────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="skeleton h-4 w-32 mb-8 rounded-lg" />
      <div className="rounded-xl p-8 mb-6 editorial-shadow" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex gap-6">
          <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-7 w-1/2 rounded-lg" />
            <div className="skeleton h-4 w-1/3 rounded-lg" />
            <div className="skeleton h-4 w-1/4 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton rounded-xl h-64" />
        <div className="skeleton rounded-xl h-64" />
      </div>
    </div>
  );
}

export default function ProfessorDetailPage({ params }) {
  const { id } = use(params);
  const [professor, setProfessor] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const [prof, revData] = await Promise.all([fetchProfessor(id), fetchReviews(id, token)]);
      setProfessor(prof);
      setReviewData(revData);
    } catch {
      setError("Failed to load professor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleReviewAdded = () => { loadData(); setShowForm(false); };

  if (loading) return <DetailSkeleton />;

  if (error || !professor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center" style={{ background: "var(--bg)" }}>
        <p className="text-base mb-4 text-red-600">{error || "Professor not found"}</p>
        <Link href="/" className="text-sm transition-colors" style={{ color: "var(--accent-l)" }}>
          ← Back to all professors
        </Link>
      </div>
    );
  }

  // Rating config (theme-adaptive)
  const r = professor.averageRating;
  const ratingColor = r >= 4 ? "var(--green-text)" : r >= 3 ? "var(--amber-text)" : r > 0 ? "var(--red-text)" : "var(--subtle)";
  const ratingBg   = r >= 4 ? "var(--green-bg)" : r >= 3 ? "var(--amber-bg)" : r > 0 ? "var(--red-bg)" : "var(--surface2)";
  const ratingBorder = r >= 4 ? "var(--green-border)" : r >= 3 ? "var(--amber-border)" : r > 0 ? "var(--red-border)" : "var(--border)";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Back link ─────────────────────────────────────── */}
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors group"
          style={{ color: "var(--subtle)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent-l)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--subtle)"}
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All professors
        </Link>

        {/* ── Professor Header Card ──────────────────────────── */}
        <section className="rounded-xl p-6 sm:p-8 mb-6 editorial-shadow" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Breadcrumb chips */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              {professor.department}
            </span>
            {professor.campus && professor.campus !== "Unknown" && (
              <span className="px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider"
                style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {professor.campus}
              </span>
            )}
          </div>

          {/* Name + Stats row */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight" style={{ color: "var(--text)" }}>
                {professor.name}
              </h1>

              {/* Stars row */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={r} size="text-base" />
                <span className="text-sm" style={{ color: "var(--subtle)" }}>
                  {professor.totalReviews === 0
                    ? "No reviews yet"
                    : `Based on ${professor.totalReviews} ${professor.totalReviews === 1 ? "review" : "reviews"}`}
                </span>
              </div>

              {/* Subject chips */}
              {professor.subjects && professor.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {professor.subjects.map(s => (
                    <span key={s} className="text-xs px-3 py-1 rounded-lg"
                      style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats overview — three boxes */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto flex-shrink-0">
              {/* Overall score */}
              <div className="flex-1 lg:flex-none min-w-[110px] rounded-xl p-4 flex flex-col items-center justify-center text-white"
                style={{ background: "var(--accent)", boxShadow: "0 4px 16px var(--accent-border)" }}>
                <span className="text-3xl font-black tracking-tight">
                  {r > 0 ? r.toFixed(1) : "–"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-0.5">Overall</span>
              </div>

              {/* Breakdown quick stat */}
              {reviewData?.breakdown?.teachingQuality != null && (
                <div className="flex-1 lg:flex-none min-w-[110px] rounded-xl p-4 flex flex-col items-center justify-center editorial-shadow"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                    {reviewData.breakdown.teachingQuality?.toFixed(1) ?? "–"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--subtle)" }}>Teaching</span>
                </div>
              )}

              {/* Difficulty */}
              {reviewData?.breakdown?.difficulty != null && (
                <div className="flex-1 lg:flex-none min-w-[110px] rounded-xl p-4 flex flex-col items-center justify-center editorial-shadow"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                    {reviewData.breakdown.difficulty?.toFixed(1) ?? "–"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--subtle)" }}>Ease</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Breakdown + Write review ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Breakdown */}
          <div className="rounded-xl p-6 editorial-shadow" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-xs font-bold mb-5 uppercase tracking-widest" style={{ color: "var(--subtle)" }}>
              Rating Distribution
            </h2>
            {reviewData?.breakdown
              ? <RatingBreakdown breakdown={reviewData.breakdown} />
              : <p className="text-sm" style={{ color: "var(--subtle)" }}>No reviews yet</p>
            }
          </div>

          {/* Write a Review */}
          <div className="rounded-xl p-6 editorial-shadow" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-xs font-bold mb-5 uppercase tracking-widest" style={{ color: "var(--subtle)" }}>
              Rate This Professor
            </h2>
            {!showForm ? (
              <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)] text-center py-8 gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                  <svg className="w-5 h-5" style={{ color: "var(--accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--subtle)" }}>
                  Had this professor? Share your experience anonymously.
                </p>
                <button
                  onClick={() => {
                    if (!isAuthenticated()) {
                      window.location.href = `/login?redirect=/professor/${id}`;
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="text-sm font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer text-white"
                  style={{ background: "var(--accent)", boxShadow: "0 4px 14px rgba(53,37,205,0.25)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-l)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--accent)"}
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <AddReviewForm professorId={id} professorName={professor.name} onReviewAdded={handleReviewAdded} />
            )}
          </div>
        </div>

        {/* ── Reviews List ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Student Reviews
              </h2>
              {reviewData?.totalReviews > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                  {reviewData.totalReviews}
                </span>
              )}
            </div>
          </div>

          {reviewData?.reviews && reviewData.reviews.length > 0 ? (
            <div className="space-y-3">
              {reviewData.reviews.map(review => (
                <ReviewCard key={review._id} review={review} onUpdate={loadData} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-12 text-center editorial-shadow" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--subtle)" }}>
                No reviews yet — be the first to rate this professor.
              </p>
            </div>
          )}
        </div>

        {/* ── Disclaimer ────────────────────────────────────── */}
        <p className="mt-10 text-center text-xs italic" style={{ color: "var(--border2)" }}>
          All reviews are anonymous student opinions and do not represent official evaluations.
        </p>
      </div>
    </div>
  );
}
