"use client";

// TagBadge – styled pill for review tags with full theme-variable support
const TAG_STYLES = {
  chill:                  { bg: "var(--green-bg)",  text: "var(--green-text)",  border: "var(--green-border)" },
  strict:                 { bg: "var(--red-bg)",    text: "var(--red-text)",    border: "var(--red-border)" },
  "slides reader":        { bg: "var(--accent-bg)", text: "var(--accent-l)",    border: "var(--accent-border)" },
  "easy grader":          { bg: "var(--green-bg)",  text: "var(--green-text)",  border: "var(--green-border)" },
  "tough grader":         { bg: "var(--amber-bg)",  text: "var(--amber-text)",  border: "var(--amber-border)" },
  inspiring:              { bg: "var(--accent-bg)", text: "var(--accent-l)",    border: "var(--accent-border)" },
  boring:                 { bg: "var(--surface2)",  text: "var(--muted)",       border: "var(--border)" },
  helpful:                { bg: "var(--accent-bg)", text: "var(--accent)",      border: "var(--accent-border)" },
  "attendance mandatory": { bg: "var(--amber-bg)",  text: "var(--amber-text)",  border: "var(--amber-border)" },
  "gives notes":          { bg: "var(--green-bg)",  text: "var(--green-text)",  border: "var(--green-border)" },
  "no attendance":        { bg: "var(--green-bg)",  text: "var(--green-text)",  border: "var(--green-border)" },
  "practical focused":    { bg: "var(--accent-bg)", text: "var(--accent)",      border: "var(--accent-border)" },
};

const DEFAULT_STYLE = { bg: "var(--surface2)", text: "var(--muted)", border: "var(--border)" };

export default function TagBadge({ tag, selected, onClick }) {
  const styleObj = TAG_STYLES[tag] || DEFAULT_STYLE;
  const baseClasses = `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tag)}
        className={`${baseClasses} cursor-pointer hover:scale-105`}
        style={selected
          ? { background: styleObj.bg, color: styleObj.text, borderColor: styleObj.border, boxShadow: "0 0 0 1px var(--accent-border)" }
          : { background: "var(--surface2)", color: "var(--subtle)", borderColor: "var(--border)" }
        }
      >
        {tag}
      </button>
    );
  }

  return (
    <span
      className={baseClasses}
      style={{ background: styleObj.bg, color: styleObj.text, borderColor: styleObj.border }}
    >
      {tag}
    </span>
  );
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
