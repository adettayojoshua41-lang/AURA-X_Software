export const DEFAULT_GRADE_SCALE = [
  { letter: "A+", points: 4.0 },
  { letter: "A", points: 4.0 },
  { letter: "A-", points: 3.7 },
  { letter: "B+", points: 3.3 },
  { letter: "B", points: 3.0 },
  { letter: "B-", points: 2.7 },
  { letter: "C+", points: 2.3 },
  { letter: "C", points: 2.0 },
  { letter: "C-", points: 1.7 },
  { letter: "D", points: 1.0 },
  { letter: "F", points: 0.0 },
];

/**
 * GPA = sum(grade_points * credit_hours) / sum(credit_hours)
 * Only subjects that have both a grade and positive credit hours count.
 * Pure function: same inputs always produce the same output, easy to test/explain.
 */
export function calculateGPA(subjects, gradeScale = DEFAULT_GRADE_SCALE) {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const subject of subjects) {
    const credits = Number(subject.credits) || 0;
    if (!subject.grade || credits <= 0) continue;
    const scaleEntry = gradeScale.find((g) => g.letter === subject.grade);
    if (!scaleEntry) continue;
    totalPoints += scaleEntry.points * credits;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function gpaLabel(gpa) {
  if (gpa >= 3.7) return "Excellent";
  if (gpa >= 3.3) return "Great";
  if (gpa >= 3.0) return "Good";
  if (gpa >= 2.5) return "Fair";
  if (gpa === 0) return "No grades yet";
  return "Needs attention";
}
