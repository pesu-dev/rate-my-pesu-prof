"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { X, AlertCircle, CheckCircle2, Loader2, MessageSquare, GraduationCap, MapPin, BarChart } from "lucide-react";
import { submitProfessorRequest } from "../lib/api";
import { getToken } from "../lib/auth";

const inputClass = (hasError) => ({
  width: "100%",
  background: "var(--surface2)",
  border: `1px solid ${hasError ? "var(--red-border)" : "var(--border)"}`,
  borderRadius: "0.75rem",
  padding: "0.625rem 1rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s",
});

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold mb-2"
      style={{ color: "var(--subtle)" }}>
      <Icon className="w-3 h-3" />
      {children}
    </label>
  );
}

export default function RequestProfessorModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { campus: "RR" } });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setSubmitting(true); setError("");
    try {
      await submitProfessorRequest(data, getToken());
      setSuccess(true);
      setTimeout(() => { reset(); setSuccess(false); onClose(); }, 2200);
    } catch (err) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      {/* Dismiss on backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          maxHeight: "92vh",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8"
            style={{ background: "var(--surface)", backdropFilter: "blur(4px)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--green-bg)", border: "2px solid var(--green-border)" }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: "var(--green-text)" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Submitted!</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              We'll review and update the directory soon. Thanks for helping!
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
              <AlertCircle className="w-4 h-4" style={{ color: "var(--amber)" }} />
              Report Missing Professor
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--subtle)" }}>
              Help us keep the PESU directory up to date
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-colors cursor-pointer"
            style={{ color: "var(--subtle)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--subtle)"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto">

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
              style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)", color: "var(--red-text)" }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Campus */}
          <div>
            <FieldLabel icon={MapPin}>Campus *</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {["RR", "EC"].map(c => (
                <label key={c}
                  className="relative flex items-center justify-center py-3 rounded-xl cursor-pointer transition-all text-sm font-semibold"
                  style={watch("campus") === c
                    ? { background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent-l)" }
                    : { background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--subtle)" }
                  }
                >
                  <input {...register("campus", { required: true })} type="radio" value={c} className="sr-only" />
                  {c === "RR" ? "Ring Road (RR)" : "Electronic City (EC)"}
                </label>
              ))}
            </div>
          </div>

          {/* Name & Dept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={GraduationCap}>Full Name *</FieldLabel>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Dr. Jane Smith"
                style={inputClass(errors.name)}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = errors.name ? "var(--red-border)" : "var(--border)"}
              />
              {errors.name && <p className="text-[10px] mt-1" style={{ color: "var(--red-text)" }}>{errors.name.message}</p>}
            </div>
            <div>
              <FieldLabel icon={BarChart}>Department *</FieldLabel>
              <input
                {...register("department", { required: "Department is required" })}
                placeholder="e.g. CSE, ECE"
                style={inputClass(errors.department)}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = errors.department ? "var(--red-border)" : "var(--border)"}
              />
              {errors.department && <p className="text-[10px] mt-1" style={{ color: "var(--red-text)" }}>{errors.department.message}</p>}
            </div>
          </div>

          {/* Courses */}
          <div>
            <FieldLabel icon={CheckCircle2}>Subjects Handled *</FieldLabel>
            <input
              {...register("courses", { required: "At least one subject is required" })}
              placeholder="e.g. OS, DBMS, AI (comma-separated)"
              style={inputClass(errors.courses)}
              onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
              onBlur={e => e.target.style.borderColor = errors.courses ? "var(--red-border)" : "var(--border)"}
            />
            {errors.courses && <p className="text-[10px] mt-1" style={{ color: "var(--red-text)" }}>{errors.courses.message}</p>}
          </div>

          {/* Comments */}
          <div>
            <FieldLabel icon={MessageSquare}>Additional Comments</FieldLabel>
            <textarea
              {...register("additionalComments")}
              placeholder="Anything else to help us identify them?"
              rows={3}
              className="w-full rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none transition-all"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "var(--accent)", boxShadow: "0 4px 14px var(--accent-border)" }}
            onMouseEnter={e => !submitting && (e.currentTarget.style.background = "var(--accent-l)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Report"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] italic" style={{ color: "var(--border2)" }}>
            All submissions are reviewed by admins before appearing in the directory.
          </p>
        </div>
      </div>
    </div>
  );
}
