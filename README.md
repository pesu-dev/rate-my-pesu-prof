# RateMyProf – PES Edition

An anonymous professor rating platform built for PES University students. Students sign in with their PESU credentials, verified against the PESU Academy portal, and can submit ratings and reviews for professors they have been taught by.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (mongoose) |
| Auth | JWT, PESU-Auth API, PESU Academy scraper |
| Deployment | Render (server), Vercel (client) |

---

## Project Structure

```
RateMyProf_PES-Edition/
├── client/                  # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── page.js          # Home / professor catalog
│   │   ├── login/           # Login page (PESU SSO)
│   │   ├── admin/           # Admin dashboard
│   │   └── professor/[id]/  # Professor detail page
│   ├── components/          # Reusable UI components
│   └── lib/                 # API client, auth helpers
│
└── server/                  # Express backend
    ├── index.js             # Server entry point
    ├── scrape_all.js        # One-time scraper to populate professor DB
    ├── models/              # Mongoose schemas (Professor, Review, User, ProfessorRequest)
    ├── routes/              # Express route handlers
    ├── services/            # Scraper and PESU Academy integration
    ├── middleware/          # JWT auth, profanity filter
    └── utils/               # Fuzzy matcher, aggregate calculator
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

The professor directory is scraped from [staff.pes.edu](https://staff.pes.edu). Run this once after setting up your database:

```bash
node server/scrape_all.js
```

This iterates over all departments on both EC and RR campuses and upserts professor records into MongoDB. The server will also trigger a small auto-seed on first startup if the collection is empty.

---

## Authentication Flow

1. Student enters their PESU SRN and password on the login page.
2. The backend verifies credentials via the [PESU-Auth API](https://pesu-auth.onrender.com).
3. On success, the server scrapes the student's academic history from PESU Academy (attendance records + past semester records) to build a list of professors they have been taught by.
4. A signed JWT (7-day expiry) is issued containing the student's SRN and their `allowedProfessors` list.
5. This token is required to submit reviews.

## Review Verification

Students can **only review professors who have taught them**. When a review is submitted:

1. The professor's name (from the database) is compared against the student's `allowedProfessors` list embedded in their JWT.
2. Matching uses **fuzzy string comparison** (Levenshtein distance, ≥85% similarity threshold) to handle minor name variations between PESU Academy records and the staff directory (e.g. `Dr. Gayatri Pisharodhy` vs `Gayathri R Pisharody`).
3. If no match is found, the review is rejected with a `403` error.
4. Each student can submit only **one review per professor** (enforced via a hashed identifier).

> **Note:** Since the allowed professor list is baked into the JWT at login time, students must log out and log back in to pick up new professors from a new semester.

---

## Admin Access

Admin credentials are seeded automatically on first startup. To log in as admin, go to `/login` and use the admin username/password configured in your database seed.

Admins can:
- View and moderate professor addition requests
- Approve or reject community-submitted professor entries
- Delete inappropriate reviews

---

## Key Scripts

| Script | Description |
|---|---|
| `node server/scrape_all.js` | Scrapes staff.pes.edu and populates the professor collection |
| `npm run dev` (server) | Starts the Express dev server with hot reload |
| `npm run dev` (client) | Starts the Next.js dev server |
| `npm run build` (client) | Builds the production Next.js bundle |
