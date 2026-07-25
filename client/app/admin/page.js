"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchRequests, updateRequestStatus } from "../../lib/api";
import { getToken, getUser, clearToken } from "../../lib/auth";
import {
  CheckCircle, XCircle, Clock, BookOpen,
  ChevronLeft, LogOut, Edit3, Check, X, AlertCircle, Shield
} from "lucide-react";
import { useForm } from "react-hook-form";

// ── Shared input style helper ────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 0.15s",
};

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = status === "Approved"
    ? { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.22)", icon: <Check className="w-3 h-3" /> }
    : { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.20)", icon: <X className="w-3 h-3" /> };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon}{status}
    </span>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 animate-pulse editorial-shadow" style={{ border: "1px solid var(--border)" }}>
          <div className="flex gap-4">
            <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ label, value, color, accent }) {
  return (
    <div className="bg-white rounded-xl p-5 text-center editorial-shadow" style={{ border: "1px solid var(--border)" }}>
      <p className="text-3xl font-black tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest mt-1.5 font-semibold" style={{ color: "var(--subtle)" }}>{label}</p>
      {accent && <div className="mx-auto mt-2 h-0.5 w-8 rounded-full" style={{ background: color, opacity: 0.4 }} />}
    </div>
  );
}

// ── Request row card ─────────────────────────────────────────────
function RequestRow({ request, onApprove, onReject }) {
  return (
    <div
      className="bg-white rounded-xl p-5 sm:p-6 transition-all editorial-shadow"
      style={{ border: "1px solid var(--border)" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-border)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div className="flex flex-col md:flex-row gap-5 justify-between">
        {/* Left: info */}
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 text-white"
              style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(53,37,205,0.22)" }}
            >
              {request.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{request.name}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                  style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                  {request.department}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                  style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  {request.campus} Campus
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-0 sm:pl-14">
            <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--subtle)" }} />
            <div>
              <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: "var(--subtle)" }}>Courses</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{request.courses}</p>
            </div>
          </div>

          {request.additionalComments && (
            <div className="pl-0 sm:pl-14">
              <div className="rounded-xl px-3 py-2.5"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderLeft: "2px solid var(--border2)" }}>
                <p className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--subtle)" }}>Additional Info</p>
                <p className="text-xs italic" style={{ color: "var(--muted)" }}>"{request.additionalComments}"</p>
              </div>
            </div>
          )}

          <p className="pl-0 sm:pl-14 text-[10px] font-mono" style={{ color: "var(--border2)" }}>
            Submitted {new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Right: actions */}
        <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-start">
          <button
            onClick={() => onApprove(request)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
            style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(53,37,205,0.22)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--accent-l)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--accent)"}
          >
            <Edit3 className="w-3.5 h-3.5" /> Review &amp; Approve
          </button>
          <button
            onClick={() => { if (confirm("Reject this request?")) onReject(request._id); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit & Approve modal ──────────────────────────────────────────
function EditApproveModal({ request, onClose, onConfirm }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: request.name,
      department: request.department,
      campus: request.campus,
      courses: request.courses,
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden editorial-shadow"
        style={{ background: "#fff", border: "1px solid var(--border)" }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}
        >
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Edit3 className="w-4 h-4" style={{ color: "var(--accent)" }} />
              Review &amp; Approve
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--subtle)" }}>
              Correct any details before adding to the directory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl cursor-pointer transition-colors"
            style={{ color: "var(--subtle)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--subtle)"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(d => onConfirm(request._id, d))} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--subtle)" }}>
              Professor Name
            </label>
            <input {...register("name", { required: true })} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--subtle)" }}>
                Department
              </label>
              <input {...register("department", { required: true })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--subtle)" }}>
                Campus
              </label>
              <select {...register("campus", { required: true })}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              >
                <option value="RR">RR Campus</option>
                <option value="EC">EC Campus</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: "var(--subtle)" }}>
              Subjects (comma-separated)
            </label>
            <textarea {...register("courses", { required: true })} rows={3}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--accent-border)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--accent)", boxShadow: "0 4px 12px rgba(53,37,205,0.22)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--accent-l)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--accent)"}
            >
              <CheckCircle className="w-4 h-4" /> Finalize &amp; Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || user.role !== "admin") { router.push("/login"); return; }
    setCurrentUser(user);
    loadRequests(token);
  }, []);

  const loadRequests = async (token) => {
    setLoading(true);
    try {
      setRequests(await fetchRequests(token));
    } catch (err) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, data = null) => {
    try {
      await updateRequestStatus(id, status, data, getToken());
      setEditingRequest(null);
      loadRequests(getToken());
    } catch (err) {
      alert(err.message || "Action failed.");
    }
  };

  const pending   = requests.filter(r => r.status === "Pending");
  const processed = requests.filter(r => r.status !== "Pending");

  if (!currentUser) return null;

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FA", color: "var(--text)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm transition-colors group cursor-pointer"
            style={{ color: "var(--subtle)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--subtle)"}
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>{currentUser.username}</p>
              <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--accent)" }}>Administrator</p>
            </div>
            <button
              onClick={() => { clearToken(); router.push("/login"); }}
              className="p-2.5 rounded-xl transition-all cursor-pointer"
              style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
            >
              <Shield className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              Admin Dashboard
            </h1>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
            >
              v1.2
            </span>
          </div>
          <p className="text-sm ml-12" style={{ color: "var(--subtle)" }}>
            Review and moderate professor requests from the community.
          </p>
        </div>

        {/* ── Stats row ───────────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard label="Total Requests" value={requests.length}  color="var(--text)"   accent />
            <StatCard label="Pending"        value={pending.length}   color="#b45309"       accent />
            <StatCard label="Processed"      value={processed.length} color="#059669"       accent />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", color: "#dc2626" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {loading ? <Skeleton /> : (
          <div className="space-y-10">

            {/* ── Pending ─────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <Clock className="w-4 h-4" style={{ color: "#b45309" }} />
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Pending Approval
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(245,158,11,0.08)", color: "#b45309", border: "1px solid rgba(245,158,11,0.22)" }}
                >
                  {pending.length}
                </span>
              </div>

              {pending.length === 0 ? (
                <div
                  className="bg-white rounded-xl p-12 text-center editorial-shadow"
                  style={{ border: "1px dashed var(--border2)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
                  >
                    <CheckCircle className="w-6 h-6" style={{ color: "#059669" }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--muted)" }}>All caught up!</p>
                  <p className="text-xs" style={{ color: "var(--subtle)" }}>No pending requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map(req => (
                    <RequestRow key={req._id} request={req}
                      onApprove={r => setEditingRequest(r)}
                      onReject={id => handleStatusUpdate(id, "Rejected")}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── History ─────────────────────────────────────── */}
            {processed.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <CheckCircle className="w-4 h-4" style={{ color: "var(--border2)" }} />
                  <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                    History
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "var(--surface2)", color: "var(--subtle)", border: "1px solid var(--border)" }}>
                    {processed.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {processed.slice(0, 10).map(req => (
                    <div
                      key={req._id}
                      className="bg-white rounded-xl px-4 py-3 flex items-center justify-between editorial-shadow"
                      style={{ border: "1px solid var(--border)", opacity: 0.85 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={req.status === "Approved"
                            ? { background: "rgba(16,185,129,0.08)", color: "#059669" }
                            : { background: "rgba(239,68,68,0.08)", color: "#dc2626" }}
                        >
                          {req.status === "Approved" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{req.name}</p>
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--subtle)" }}>
                            {req.department} · {req.campus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} />
                        <span className="text-[10px] font-mono" style={{ color: "var(--border2)" }}>
                          {new Date(req.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      {/* ── Edit & Approve modal ─────────────────────────────── */}
      {editingRequest && (
        <EditApproveModal
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onConfirm={(id, data) => handleStatusUpdate(id, "Approved", data)}
        />
      )}
    </div>
  );
}
