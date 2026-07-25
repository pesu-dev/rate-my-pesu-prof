"use client";

// TagBadge – styled pill for review tags
const TAG_COLORS = {
  chill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  strict: "bg-red-50 text-red-700 border-red-200",
  "slides reader": "bg-blue-50 text-blue-700 border-blue-200",
  "easy grader": "bg-green-50 text-green-700 border-green-200",
  "tough grader": "bg-orange-50 text-orange-700 border-orange-200",
  inspiring: "bg-violet-50 text-violet-700 border-violet-200",
  boring: "bg-gray-100 text-gray-600 border-gray-200",
  helpful: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "attendance mandatory": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "gives notes": "bg-teal-50 text-teal-700 border-teal-200",
  "no attendance": "bg-lime-50 text-lime-700 border-lime-200",
  "practical focused": "bg-sky-50 text-sky-700 border-sky-200",
};

const DEFAULT_COLOR = "bg-gray-100 text-gray-600 border-gray-200";

export default function TagBadge({ tag, selected, onClick }) {
  const colorClass = TAG_COLORS[tag] || DEFAULT_COLOR;
  const baseClasses = `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tag)}
        className={`${baseClasses} cursor-pointer hover:scale-105 ${selected ? colorClass + " ring-1 ring-white/20" : ""}`}
        style={!selected ? { background: "var(--surface2)", color: "var(--subtle)", borderColor: "var(--border)" } : {}}
      >
        {tag}
      </button>
    );
  }

  return <span className={`${baseClasses} ${colorClass}`}>{tag}</span>;
}

// Export available tags for the form
export const AVAILABLE_TAGS = [
  "chill",
  "strict",
  "slides reader",
  "easy grader",
  "tough grader",
  "inspiring",
  "boring",
  "helpful",
  "attendance mandatory",
  "gives notes",
  "no attendance",
  "practical focused",
];
