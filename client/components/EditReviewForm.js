"use client";

import { useState } from "react";
import TagBadge, { AVAILABLE_TAGS } from "./TagBadge";
import { updateReview } from "../lib/api";
import { getToken } from "../lib/auth";

const SLIDER_FIELDS = [
  { key: "teachingQuality",      label: "Teaching Quality", color: "#34d399" },
  { key: "difficulty",           label: "Ease of Course",   color: "#60a5fa" },
  { key: "gradingStrictness",    label: "Grading",          color: "#fbbf24" },
  { key: "attendanceStrictness", label: "Attendance",       color: "#a78bfa" },
];

export default function EditReviewForm({ review, onReviewUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    rating: review.rating,
    teachingQuality: review.teachingQuality,
    difficulty: review.difficulty,
    gradingStrictness: review.gradingStrictness,
    attendanceStrictness: review.attendanceStrictness,
    reviewText: review.reviewText || "",
    tags: review.tags || [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      await updateReview(review._id, { ...formData, rating: parseFloat(computed) }, getToken());
      if (onReviewUpdated) onReviewUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Computed banner */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--accent-l)" }}>Updated Rating</span>
        <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>{computed}<span className="text-sm font-medium opacity-60">/5</span></span>
      </div>

      {/* Sliders */}
      {SLIDER_FIELDS.map(f => (
        <div key={f.key}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>{f.label}</label>
            <span className="text-lg font-black" style={{ color: f.color }}>{formData[f.key]}</span>
          </div>
          <input type="range" min="1" max="5" step="1"
            value={formData[f.key]}
            onChange={e => handleSlider(f.key, e.target.value)}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${f.color} ${(formData[f.key] - 1) * 25}%, var(--surface2) ${(formData[f.key] - 1) * 25}%)` }}
          />
        </div>
      ))}

      {/* Review text */}
      <div>
        <label className="text-sm font-medium mb-2 block" style={{ color: "var(--muted)" }}>Review</label>
        <textarea
          value={formData.reviewText}
          onChange={e => setFormData(p => ({ ...p, reviewText: e.target.value.slice(0, 300) }))}
          placeholder="Update your experience…"
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
          style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}
          onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium mb-3 block" style={{ color: "var(--muted)" }}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <TagBadge key={tag} tag={tag} selected={formData.tags.includes(tag)} onClick={toggleTag} />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
          style={{ background: "var(--accent)", boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}>
          {submitting ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
