/** Percentage of classes attended, safe against divide-by-zero for a subject with no classes logged yet. */
export function attendancePercent(held, attended) {
  const safeHeld = Math.max(0, Number(held) || 0);
  const safeAttended = Math.max(0, Math.min(safeHeld, Number(attended) || 0));
  if (safeHeld === 0) return 0;
  return Math.round((safeAttended / safeHeld) * 100);
}

export function attendanceStatus(pct) {
  if (pct >= 85) return "On track";
  if (pct >= 75) return "Watch this one";
  return "At risk";
}
