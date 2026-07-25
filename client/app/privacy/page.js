"use client";

import Link from "next/link";
import { ShieldCheck, Fingerprint, Search, Flag, ChevronLeft, KeyRound } from "lucide-react";

const Section = ({ icon: Icon, iconColor, iconBg, title, children }) => (
  <section
    className="bg-white rounded-xl p-6 sm:p-8 editorial-shadow"
    style={{ border: "1px solid var(--border)" }}
  >
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconColor}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
        {title}
      </h2>
    </div>
    <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
      {children}
    </div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen pt-8 pb-20 px-4 sm:px-6"
      style={{ background: "#F8F9FA", color: "var(--text)" }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors group"
          style={{ color: "var(--subtle)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--subtle)"}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <ShieldCheck className="w-6 h-6" style={{ color: "var(--accent)" }} />
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight"
            style={{ color: "var(--text)" }}
          >
            Privacy Policy &amp; Community Rules
          </h1>

          {/* Accent underline */}
          <div
            className="rounded-full mb-5"
            style={{ width: 48, height: 3, background: "var(--accent)" }}
          />

          <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            RateMyProf PES Edition operates on strict anonymity, security, and content moderation rules to protect both students and professors.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">

          {/* PESU SSO Verified Login */}
          <Section
            icon={KeyRound}
            iconColor="#3525cd"
            iconBg="rgba(53,37,205,0.08)"
            title="PESU SSO Verified Login"
          >
            <p>
              <strong style={{ color: "var(--text)" }}>Why do we require PESU login?</strong>{" "}
              RateMyProf PES Edition uses <strong style={{ color: "var(--text)" }}>PESU Academy SSO (Single Sign-On)</strong> as the exclusive
              authentication method. This means you sign in with the same username and password you use on the official PESU Academy portal.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>Spam &amp; Bot Prevention:</strong>{" "}
              Restricting login to verified PESU Academy accounts ensures that every review on this platform comes from a real,
              currently enrolled PES University student — not bots, outsiders, or fabricated accounts. This directly protects professors
              from coordinated unfair attacks and keeps ratings trustworthy.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>We never store your password:</strong>{" "}
              Your credentials are forwarded directly to the PESU-Auth API in a single request to confirm your identity.
              The password is never logged, saved to our database, or seen by any administrator. If the PESU-Auth API confirms
              you are a valid student, we issue you a short-lived JWT token — that's all we keep.
            </p>
            <div
              className="flex items-start gap-3 p-3 rounded-xl mt-1"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
            >
              <KeyRound className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
              <p style={{ color: "var(--accent)" }}>
                <strong>TL;DR:</strong> We use PESU SSO only to verify you're a real student. We never see, store, or reuse your password.
              </p>
            </div>
          </Section>

          {/* Authentication & Anonymity */}
          <Section
            icon={Fingerprint}
            iconColor="#7c3aed"
            iconBg="rgba(124,58,237,0.08)"
            title="Authentication & Anonymity"
          >
            <p>
              <strong style={{ color: "var(--text)" }}>No Passwords Stored:</strong>{" "}
              We verify your identity via the open-source PESU-Auth API. Your password is used exactly once to prove you are a PES student and is never logged, intercepted, or saved to our databases.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>Cryptographic SRN Hashing:</strong>{" "}
              Your SRN is never stored in plaintext alongside your review. It is run through a one-way cryptographic hash. This means even system administrators cannot reverse-engineer the database to see which SRN left a specific review.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>Duplicate Prevention:</strong>{" "}
              The cryptographic hash allows us to securely prevent students from leaving multiple reviews for the same professor, without actually knowing who the student is.
            </p>
          </Section>

          {/* Content Moderation */}
          <Section
            icon={Search}
            iconColor="#b45309"
            iconBg="rgba(245,158,11,0.08)"
            title="Automated Content Moderation"
          >
            <p>
              All review submissions pass through a strict, multi-stage profanity and moderation pipeline.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-1">
              <li>
                <strong style={{ color: "var(--text)" }}>Normalisation:</strong>{" "}
                Text is checked for bypass attempts (e.g., leet-speak <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--surface2)", color: "var(--muted)" }}>f00k</code> or spaced words <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--surface2)", color: "var(--muted)" }}>f u c k</code>).
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Tiered Detection:</strong>{" "}
                Words are scored by severity (mild, strong, extreme). Academic term whitelists prevent false positives.
              </li>
              <li>
                <strong style={{ color: "var(--text)" }}>Action:</strong>{" "}
                Strong and extreme profanity is outright rejected. You will not be able to submit the review.
              </li>
            </ul>
          </Section>

          {/* Trust System & Shadow Banning */}
          <Section
            icon={Flag}
            iconColor="#dc2626"
            iconBg="rgba(239,68,68,0.08)"
            title="Trust System & Shadow Banning"
          >
            <p>
              Every user profile maintains an internal{" "}
              <strong style={{ color: "var(--text)" }}>Trust Score</strong> (starts at 50) and a{" "}
              <strong style={{ color: "var(--text)" }}>Flag Count</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Submitting clean reviews increases your trust score <strong style={{ color: "#059669" }}>(+2)</strong>.</li>
              <li>
                Attempting to submit reviews with profanity drastically reduces your score{" "}
                <strong style={{ color: "#dc2626" }}>(-10)</strong> and increases your flag count.
              </li>
            </ul>

            {/* Shadow ban callout */}
            <div
              className="p-4 rounded-xl mt-2"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
            >
              <p className="font-bold mb-2 text-sm" style={{ color: "#dc2626" }}>
                ⚠ Automatic Shadow Banning
              </p>
              <p>
                If your Flag Count reaches{" "}
                <strong style={{ color: "var(--text)" }}>5</strong>, or your Trust Score drops to{" "}
                <strong style={{ color: "var(--text)" }}>10</strong> or below, you will be automatically{" "}
                <strong style={{ color: "var(--text)" }}>shadow banned</strong>.
              </p>
              <p className="mt-2">
                When shadow banned, you can still log in and submit reviews, and they will appear normally <em>to you</em>. However,{" "}
                <strong style={{ color: "var(--text)" }}>
                  your reviews will be completely hidden from all other users
                </strong>{" "}
                and will not affect the professor's aggregate rating. Only an admin can reverse a shadow ban.
              </p>
            </div>
          </Section>

        </div>

        {/* Footer note */}
        <p
          className="mt-10 text-center text-xs italic"
          style={{ color: "var(--border2)" }}
        >
          Last updated · RateMyProf PES Edition
        </p>

      </div>
    </div>
  );
}
