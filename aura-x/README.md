# ✨ AURA-X

**Learn. Organize. Achieve.**

A magical, fully offline productivity workspace for students — semester planning, assignments, attendance, GPA, notes, a Pomodoro timer, and weekly analytics, all in one app with zero backend and zero API keys.

Built for the **InventaCore AI Intern Build Challenge 2026 — Track 4: Education**.

---

## Problem

Students juggle 5+ disconnected tools to manage a single semester: a notes app, a to-do list, a spreadsheet for GPA, a separate attendance tracker, and a timer app for focus sessions. Nothing talks to anything else, and most of it requires an account or a subscription.

## Solution

AURA-X puts semester life in one offline-first app. Subjects feed assignments, attendance, and GPA; assignments and Pomodoro sessions feed a weekly analytics view; everything rolls up into a single daily dashboard. No login, no server, no cost — your data lives in your browser's `localStorage`.

## Features

- **Dashboard** — today's progress, study streak, upcoming assignments, quick actions, and weekly analytics charts
- **Subjects** — name, code, credit hours, teacher, and a color tag, with validation against empty names, duplicate codes, and non-positive credit hours
- **Assignments** — due-date sorting with automatic overdue (red) / due-soon (yellow) highlighting
- **Planner** — a monthly calendar with glowing dots on days with assignments or goals
- **Pomodoro** — 25/5 focus timer with a daily goals checklist, session logging feeds analytics
- **Attendance** — color-coded progress rings per subject (green ≥85%, yellow 75–85%, red <75%)
- **GPA Calculator** — `GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)`, with an editable grade-point scale
- **Notes** — pinned, searchable, tagged to a subject or general
- **Weekly Analytics** — Chart.js bar/line/doughnut charts built from real logged activity
- **Dark Mode** — animated sun/moon toggle, first-visit "try dark mode tonight?" prompt (evenings only, shown once), and dark-mode-safe native `<select>`/date-input contrast via `color-scheme`
- **Collapsible sidebar** — desktop collapse to icons-only (persisted, with tooltips); a proper mobile drawer with overlay, Escape-to-close, and close-on-navigate
- **Command Palette** — `Ctrl/Cmd + K` to jump to any page instantly, fully offline
- **Ambient design** — floating gradient blobs, twinkling sparkles, aurora glow, and a subtle mouse-follow glow — respects `prefers-reduced-motion`
- **Sample data button** — one click populates a realistic demo semester for reviewers
- **Backup & restore** — export all data as a JSON file and re-import it later (Settings)
- **Defensive persistence** — malformed/corrupted localStorage is repaired field-by-field instead of crashing the app; storage write failures surface as a toast
- **Error boundary** — an unexpected render error shows a recoverable screen instead of a blank page
- **Easter egg** — click the sidebar logo 7 times ✨

## Tech Stack

React 19 + Vite + Tailwind CSS v4 + React Router v7 + Chart.js (react-chartjs-2) + localStorage + Vitest. No backend, no external API, no paid services.

## Folder Structure

```
src/
  components/     Sidebar, Layout, AnimatedBackground, CommandPalette, Toasts, EmptyState...
  context/         ThemeContext, ToastContext, DataContext (the single source of truth)
  hooks/           useLocalStorage.js
  pages/           Dashboard, Subjects, Assignments, Planner, Pomodoro, Attendance, GPA, Notes, Settings, Help
  utils/           gpaCalculator.js, dateHelpers.js, quotes.js, sampleData.js
  App.jsx          Route table
  main.jsx         Entry point
```

## Environment Setup

No environment variables, `.env` file, or API keys are required — AURA-X makes zero external calls. `npm install` and `npm run dev` is the entire setup.

## Database Setup

No database and no backend. All data (semester, subjects, assignments, attendance, notes, goals, Pomodoro sessions) is stored in the browser's `localStorage` on the device running the app. See **Test Data** below for how to populate it instantly for evaluation.

## Installation & Run

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # sanity-check the production build locally
npm run test      # run the unit test suite (GPA, dates, attendance, data sanitization)
```

## Deployment (free)

Drag the generated `dist/` folder into [netlify.com/drop](https://app.netlify.com/drop) for an instant link, or connect the GitHub repo to Netlify/Vercel for auto-deploy on every push. A `public/_redirects` file is already included so client-side routing works correctly on Netlify.

## Test Data

No login is required — AURA-X has no accounts or credentials of any kind; opening the app is the entire "login" step. On first launch, click **"Load sample data instead"** on the setup screen (or **Settings → Load sample data** later) to instantly populate a demo semester with subjects, assignments, attendance, notes, and two weeks of activity history.

## Known Limitations

- Data is stored per-browser via `localStorage` — it does not sync across devices or browsers.
- Clearing browser site data will remove all stored progress; there is no cloud backup.
- The GPA calculation uses a per-subject final grade rather than per-assignment weighted grades, by design, to keep the model simple and explainable.

## AI Tools Used

This project was planned and built with the help of an AI assistant (Claude) for architecture decisions, component code, the GPA/attendance/analytics logic, and this README. All code was reviewed and is understood and explainable in full — the GPA calculation, the localStorage persistence model, and the component structure follow directly from the comments and structure in the source files.

## Future Improvements

- Cloud sync / account-based storage
- Mobile app wrapper
- Calendar (Google Calendar) integration
- Per-assignment weighted GPA calculation

## Ownership & Contributions

- **Adetayo Joshua Iyiade** — Owner and lead developer of AURA-X.
