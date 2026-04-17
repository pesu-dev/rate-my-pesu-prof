# RateMyProf – PES Edition

An anonymous professor rating platform built for PES University students. Students sign in with their PESU credentials, verified against the PESU Academy portal.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (mongoose) |
| Auth | JWT, PESU-Auth API, PESU Academy scraper |
| Sentiment Analysis | Nvidia NIM / Nebius LLM API (OpenAI-compatible) |
| Deployment | Render (server), Vercel (client) |

---

## Project Structure

```
rate-my-pesu-prof/
├── client/                     # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── page.js             # Home / professor catalog
│   │   ├── login/              # Login page (PESU SSO)
│   │   ├── admin/              # Admin dashboard
│   │   └── professor/[id]/     # Professor detail page
│   ├── components/             # Reusable UI components
│   └── lib/                    # API client, auth helpers
│
└── server/                     # Express backend
    ├── index.js                # Server entry point
    ├── scrape_all.js           # One-time scraper to populate professor DB
    ├── models/                 # Mongoose schemas (Professor, Review, User)
    ├── routes/                 # Express route handlers
    │   ├── auth.js             # PESU SSO + admin login
    │   ├── reviews.js          # CRUD reviews (shadow ban + sentiment)
    │   ├── professors.js       # Professor catalog
    │   ├── requests.js         # Community professor addition requests
    │   └── admin.js            # Admin moderation panel API
    ├── middleware/              # JWT auth, profanity pipeline
    │   ├── auth.js             # verifyToken, isAdmin
    │   ├── profanityMiddleware.js  # Full profanity detection middleware
    │   └── profanityFilter.js  # Legacy shim (backward compat)
    ├── scripts/
    │   └── backfillSentiment.js  # One-time script to analyze existing reviews
    ├── services/               # External integrations + business logic
    │   ├── academyService.js   # PESU Academy scraper
    │   ├── scraper.js          # Staff directory scraper
    │   └── trustService.js     # Trust score + shadow ban logic
    └── utils/
        ├── aggregateCalculator.js  # Professor rating aggregation (incl. sentiment)
        ├── fuzzyMatcher.js     # Fuzzy name matching
        ├── sentimentAnalyzer.js  # LLM-powered sentiment analysis utility
        └── profanity/          # Modular profanity detection engine
            ├── wordList.js     # Tiered word list (extreme/strong/mild + whitelist)
            ├── normalize.js    # Anti-bypass text normalisation
            ├── detector.js     # Detection engine (containsProfanity, getMatches)
            ├── scoring.js      # Severity bands + configurable thresholds
            └── censor.js       # Optional text redaction
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A MongoDB Atlas cluster (free tier works)
- A copy of `server/.env` (see below)

### Environment Variables

Create a file at `server/.env` with the following:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
PORT=5000
JWT_SECRET=<a_long_random_secret_string>

# ─── Sentiment Analysis (LLM API) ───────────────────────────────────────────
# Compatible with Nvidia NIM, Nebius, or any OpenAI-compatible endpoint
# Get a free Nvidia key at: https://build.nvidia.com/meta/llama-3_1-8b-instruct
LLM_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
LLM_API_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=meta/llama-3.1-8b-instruct
```

> **Note:** If `LLM_API_KEY` is not set or is invalid, sentiment analysis gracefully defaults to `neutral` — the app remains fully functional.

#### Optional Moderation Tuning

```env
PROFANITY_REJECT_THRESHOLD=3       # Score >= this → reject (default: 3)
PROFANITY_ALLOW_MILD=true          # Allow mild profanity through (default: true)
PROFANITY_CENSOR_MILD=false        # Auto-censor mild words (default: false)
TRUST_PENALTY=10                   # Trust score deducted per violation (default: 10)
TRUST_REWARD=2                     # Trust score added per clean review (default: 2)
SHADOW_BAN_FLAG_THRESHOLD=5        # Flag count to trigger ban (default: 5)
SHADOW_BAN_TRUST_THRESHOLD=10      # Trust score floor before ban (default: 10)
```

### Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Run in Development

Open two terminals:

```bash
# Terminal 1 – Backend
cd server
npm run dev

# Terminal 2 – Frontend
cd client
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:3000`.

---

## Populating the Professor Database

The professor directory is scraped from [staff.pes.edu](https://staff.pes.edu).
Run this once after setting up your database:

```bash
node server/scrape_all.js
```

This iterates over all departments on both EC and RR campuses and upserts professor records into MongoDB. The server will also trigger a small auto-seed on first startup if the collection is empty.

---

## Authentication Flow

1. Student enters their PESU SRN and password on the login page.
2. The backend verifies credentials via the [PESU-Auth API](https://pesu-auth.onrender.com).

---

## Sentiment Analysis

Every text review is analyzed by an LLM to determine the emotional tone of the student's written feedback.

### How It Works

1. When a review is submitted (or edited), `reviewText` is sent to the configured LLM API endpoint (`/v1/chat/completions`).
2. The model returns a **score** between `-1.0` (very negative) and `+1.0` (very positive) and a **label** (`positive`, `neutral`, or `negative`).
3. These are stored on the `Review` document as `sentimentScore` and `sentimentLabel`.
4. The professor's `averageSentimentScore` is recomputed across all visible reviews with text after every submission.

### Frontend Display

- **Review cards** — each review with text shows a sentiment badge (😊 Positive / 😐 Neutral / 😞 Negative).
- **Rating breakdown panel** — a "Review Sentiment" bar slides from Negative ↔ Positive based on the professor's average.

### Backfilling Existing Reviews

To analyze all reviews already in the database, run from inside the `server/` directory:

```bash
node scripts/backfillSentiment.js
```

This processes all reviews with text, skips those without, and recalculates professor aggregates on completion.

---

## Content Moderation

All review submissions pass through a multi-stage profanity moderation pipeline:

### Detection Pipeline

1. **Normalisation** — text is lowercased, leet-speak is decoded (`@→a`, `$→s`, `5→s`, `0→o`), spaced-out evasions are collapsed (`f u c k → fuck`), and repeated characters are reduced (`fuuuuck → fuck`).
2. **Detection** — whole-word matching against a tiered word list: extreme (slurs, score 5), strong (score 3), and mild (score 1). A whitelist prevents false positives on academic terms (`assignment`, `class`, `cocktail`, etc.).
3. **Decision** — scores are evaluated against configurable thresholds. Strong/extreme content is rejected with HTTP 400. Mild content can be allowed, optionally auto-censored, or rejected depending on configuration.

### Trust System

Each user has a `trustScore` (starts at 50) and `flagCount`:

- **Clean review** → `trustScore += 2` (capped at 100)
- **Profanity violation** → `trustScore -= 10` (min 0), `flagCount += 1`
- **`flagCount >= 5` or `trustScore <= 10`** → automatic shadow ban

### Shadow Banning

Shadow-banned users experience no visible change:

- Their reviews are accepted and stored (`isHidden: true`)
- They receive normal success responses
- They see their own reviews alongside public ones
- Their reviews are **never shown to other users** and **never affect professor ratings**
- Only an admin can lift a shadow ban

---

## Admin Access

Admin credentials are seeded automatically on first startup. To log in as admin, go to `/login` and use the admin username/password configured in your database seed.

Admins can:
- View and moderate professor addition requests
- Approve or reject community-submitted professor entries
- Delete inappropriate reviews
- View all users with trust profiles (`GET /api/admin/users`)
- Manually shadow ban/unban users (`POST /api/admin/users/:id/ban|unban`)
- View hidden reviews (`GET /api/admin/reviews/hidden`)
- Unhide wrongfully hidden reviews (`POST /api/admin/reviews/:id/unhide`)

---

## Key Scripts

| Script | Description |
|---|---|
| `node server/scrape_all.js` | Scrapes staff.pes.edu and populates the professor collection |
| `node scripts/backfillSentiment.js` | Retroactively runs sentiment analysis on all existing reviews |
| `npm run dev` (server) | Starts the Express dev server with hot reload |
| `npm run dev` (client) | Starts the Next.js dev server |
| `npm run build` (client) | Builds the production Next.js bundle |
