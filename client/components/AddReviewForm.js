"use client";

import { useState } from "react";
import TagBadge, { AVAILABLE_TAGS } from "./TagBadge";
import { submitReview } from "../lib/api";
import { getToken, isAuthenticated, getUser } from "../lib/auth";
import Link from "next/link";

const SLIDER_FIELDS = [
  { key: "teachingQuality",      label: "Teaching Quality",  hint: "1 = Poor   5 = Excellent",  color: "#34d399" },
  { key: "difficulty",           label: "Ease of Course",    hint: "1 = Hard   5 = Easy",        color: "#60a5fa" },
  { key: "gradingStrictness",    label: "Grading",           hint: "1 = Strict  5 = Lenient",   color: "#fbbf24" },
  { key: "attendanceStrictness", label: "Attendance",        hint: "1 = Strict  5 = Lenient",   color: "#a78bfa" },
];

function SliderField({ field, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>{field.label}</label>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--subtle)" }}>{field.hint}</p>
        </div>
        <span className="text-xl font-black tabular-nums" style={{ color: field.color }}>{value}</span>
      </div>
      <div className="relative">
        <input
          type="range" min="1" max="5" step="1"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, ${field.color} ${(value - 1) * 25}%, var(--surface2) ${(value - 1) * 25}%)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        {[1,2,3,4,5].map(n => (
          <span key={n} className="text-[9px]" style={{ color: n === value ? field.color : "var(--border2)" }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AddReviewForm({ professorId, professorName, onReviewAdded }) {
  const [formData, setFormData] = useState({
    teachingQuality: 3, difficulty: 3,
    gradingStrictness: 3, attendanceStrictness: 3,
    reviewText: "", tags: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const computed = (
    (formData.teachingQuality + formData.difficulty + formData.gradingStrictness + formData.attendanceStrictness) / 4
  ).toFixed(1);

  const handleSlider = (field, val) =>
    setFormData(p => ({ ...p, [field]: parseInt(val) }));

  const toggleTag = (tag) =>
    setFormData(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setSubmitting(true);
    try {
      await submitReview({ ...formData, rating: parseFloat(computed), professorId }, getToken());
      setSuccess(true);
      setFormData({ teachingQuality: 3, difficulty: 3, gradingStrictness: 3, attendanceStrictness: 3, reviewText: "", tags: [] });
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
          <svg className="w-5 h-5" style={{ color: "var(--accent-l)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>Verification Required</h3>
        <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--subtle)" }}>
          Only verified PES students can submit reviews.
        </p>
        <Link
          href={`/login?redirect=${typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : ''}`}
          className="block w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--accent)", boxShadow: "0 4px 14px var(--accent-border)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-l)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
        >
          Sign In with PESU Academy
        </Link>
        <p className="text-[10px] italic" style={{ color: "var(--subtle)" }}>
          Your identity is 100% anonymised via cryptographic hashing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Computed score banner */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--accent-l)" }}>Calculated Rating</span>
        <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>{computed}<span className="text-sm font-medium opacity-60">/5</span></span>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {SLIDER_FIELDS.map(f => (
          <SliderField key={f.key} field={f} value={formData[f.key]} onChange={handleSlider} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Review text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>Review <span style={{ color: "var(--subtle)" }}>(optional)</span></label>
          <span className="text-xs" style={{ color: formData.reviewText.length > 280 ? "var(--red-text)" : "var(--subtle)" }}>
            {formData.reviewText.length}/300
          </span>
        </div>
        <textarea
          value={formData.reviewText}
          onChange={e => setFormData(p => ({ ...p, reviewText: e.target.value.slice(0, 300) }))}
          placeholder="Share your experience honestly…"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
          style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            color: "var(--muted)", lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: "var(--muted)" }}>
          Tags <span style={{ color: "var(--subtle)" }}>(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <TagBadge key={tag} tag={tag} selected={formData.tags.includes(tag)} onClick={toggleTag} />
          ))}
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red-text)" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green-text)" }}>
          Review submitted successfully! 🎉
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={submitting}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--accent)", boxShadow: "0 4px 14px var(--accent-border)" }}
        onMouseEnter={e => !submitting && (e.currentTarget.style.background = "var(--accent-l)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>

      <p className="text-[11px] text-center italic" style={{ color: "var(--subtle)" }}>
        Your review is completely anonymous. Be honest and constructive.
      </p>
    </form>
  );
}
