/**
 * Formats a Date object as a local-calendar-day YYYY-MM-DD string.
 *
 * This is deliberately NOT `date.toISOString().slice(0, 10)` — that method
 * converts to UTC first, which silently shifts the date by a day for part
 * of the day in any timezone ahead of or behind UTC (e.g. for someone in
 * UTC+5, local midnight is still "yesterday" in UTC). Every date-only value
 * in this app (due dates, semester dates, today's date) should be built
 * from local calendar fields instead.
 */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return formatLocalDate(new Date());
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function daysBetween(fromISO, toISO) {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function daysUntil(iso) {
  return daysBetween(todayISO(), iso);
}

export function isOverdue(iso, status) {
  if (status === "graded" || status === "submitted") return false;
  return daysUntil(iso) < 0;
}

export function isDueSoon(iso, status) {
  if (status === "graded" || status === "submitted") return false;
  const d = daysUntil(iso);
  return d >= 0 && d <= 3;
}

/** Last N calendar days as local ISO date strings, oldest first. */
export function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatLocalDate(d));
  }
  return days;
}

/** Adds (or subtracts, with a negative n) whole calendar days to a local ISO date string. */
export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return formatLocalDate(d);
}

export function shortDay(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}
