# Project Description — AURA-X

**Submitted for:** InventaCore AI Intern Build Challenge 2026
**Track:** Track 4 — Education

## Project Name

AURA-X — _Learn. Organize. Achieve._

**Owner:** Adetayo Joshua Iyiade

## Problem

Students typically juggle five or more disconnected tools to manage a single semester: a notes app, a to-do list, a spreadsheet for GPA tracking, a separate attendance tracker, and a timer app for focus sessions. None of these tools talk to each other, and most require an account, an internet connection, or a subscription just to get started.

## Proposed Solution

AURA-X is a single, fully offline productivity workspace that puts an entire semester in one place. Subjects feed into assignments, attendance, and GPA; assignments and Pomodoro focus sessions feed a weekly analytics view; everything rolls up into one daily dashboard. There is no login, no backend, and no cost — all data is stored locally in the browser, with export/import for backup and portability.

## Target Users

University and college students who want one lightweight tool to track a semester — subjects, deadlines, attendance thresholds, GPA, and study habits — without adopting five separate apps or handing their data to a third-party server.

## Main Features

- Semester setup and a "load sample data" instant-demo path
- Subjects with validation (no empty names, no duplicate codes, no non-positive credit hours)
- Assignments with automatic overdue/due-soon highlighting
- A monthly planner calendar
- A 25/5 Pomodoro focus timer with a daily goals checklist
- Attendance tracking with color-coded progress rings (85% / 75% thresholds)
- A GPA calculator with an editable, per-institution grade-point scale
- Searchable, pinnable notes
- Weekly analytics (Chart.js) built from real logged activity, not placeholder numbers
- Dark mode, a collapsible sidebar, and a `Ctrl/Cmd+K` command palette
- JSON export/import for backup and data portability
- Defensive data handling: malformed or corrupted local data is repaired automatically instead of crashing the app

## Workflow

1. Student creates a semester (or loads sample data to explore immediately).
2. Student adds subjects with credit hours.
3. As the term progresses, the student logs assignments, attendance, and notes; runs Pomodoro sessions; and checks off daily goals.
4. The Dashboard and Weekly Analytics automatically reflect all of this activity.
5. The GPA page turns per-subject grades into a live GPA using an editable point scale.
6. The student can export a JSON backup at any time from Settings.

## Technologies

React 19, Vite, Tailwind CSS v4, React Router v7, Chart.js (via react-chartjs-2), the browser's `localStorage` API, and Vitest for unit testing. No backend, no database server, and no external API of any kind.

## Tools Used

Visual Studio Code for development; Claude (Anthropic) as an AI coding assistant for architecture decisions, component implementation, and the persistence/validation logic; Netlify for free static deployment.

## Challenges

- **Timezone correctness:** an early version computed "today" using `Date.toISOString()`, which converts to UTC first — this silently shifted due-date calculations by a day for users in timezones ahead of UTC. Fixed by deriving all date-only values from local calendar fields instead of UTC, and covered with unit tests across multiple timezones.
- **Data integrity without a database:** since everything lives in `localStorage`, the app has to assume the stored JSON can be missing, corrupted, or hand-edited. Every collection now has a dedicated sanitizer that repairs or drops invalid records (e.g. an assignment referencing a deleted subject) instead of letting bad data crash the UI.
- **Keeping the ambient visual design (animated background, sparkles, dark mode) from competing with usability** — solved by keeping all ambient effects CSS-driven and respecting `prefers-reduced-motion`, rather than animating with React state.

## Future Improvements

- Optional cloud sync / account-based storage for cross-device access
- A native mobile wrapper
- Calendar (Google Calendar) integration for assignments and planner events
- Per-assignment weighted GPA calculation, as an alternative to the current per-subject final-grade model
