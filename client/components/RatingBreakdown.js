"use client";

// RatingBreakdown – horizontal bar chart showing category averages
function sentimentToPercent(score) {
  return Math.round(((score + 1) / 2) * 100);
}

// Bar with animated fill
function RatingBar({ value, color }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="relative h-3 w-full rounded-full overflow-hidden" style={{ background: "var(--bar-track)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)" }}>
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

const CATEGORIES = [
  { key: "overall",             label: "Overall",             color: "var(--accent)" },
  { key: "teachingQuality",     label: "Teaching Quality",    color: "var(--green)" },
  { key: "difficulty",          label: "Ease of Course",      color: "var(--accent-l)" },
  { key: "gradingStrictness",   label: "Grading",             color: "var(--amber)" },
  { key: "attendanceStrictness",label: "Attendance",          color: "#a78bfa" },
];

export default function RatingBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const hasSentiment = breakdown.averageSentimentScore !== undefined && breakdown.averageSentimentScore !== null;
  const sentScore = breakdown.averageSentimentScore ?? 0;
  const sentPct = sentimentToPercent(sentScore);
  const sentColor = sentScore > 0.2 ? "var(--green)" : sentScore < -0.2 ? "var(--red)" : "var(--subtle)";
  const sentLabel = sentScore > 0.2 ? "Positive" : sentScore < -0.2 ? "Negative" : "Neutral";
  const sentBg = sentScore > 0.2 ? "var(--green-bg)" : sentScore < -0.2 ? "var(--red-bg)" : "var(--surface2)";
  const sentBorder = sentScore > 0.2 ? "var(--green-border)" : sentScore < -0.2 ? "var(--red-border)" : "var(--border)";

  return (
    <div className="space-y-4">
      {CATEGORIES.map(({ key, label, color }) => {
        const value = key === "overall" ? breakdown.overall : breakdown[key];
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: value ? color : "var(--subtle)" }}>
                {value ? value.toFixed(1) : "–"}<span style={{ color: "var(--border2)" }}>/5</span>
              </span>
            </div>
            <RatingBar value={value} color={color} />
          </div>
        );
      })}

      {/* Sentiment */}
      {hasSentiment && (
        <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Review Sentiment</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: sentBg, color: sentColor, border: `1px solid ${sentBorder}` }}
            >
              {sentLabel}
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{ width: `${sentPct}%`, background: sentColor }} />
            <div className="absolute top-0 left-1/2 w-px h-full" style={{ background: "var(--border2)" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px]" style={{ color: "var(--border2)" }}>Negative</span>
            <span className="text-[9px]" style={{ color: "var(--border2)" }}>Positive</span>
          </div>
        </div>
      )}
    </div>
  );
}
