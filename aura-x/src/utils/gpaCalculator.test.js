import { describe, it, expect } from "vitest";
import { calculateGPA, DEFAULT_GRADE_SCALE, gpaLabel } from "./gpaCalculator";

describe("calculateGPA", () => {
  it("returns 0 when no subjects are graded", () => {
    expect(calculateGPA([{ credits: 3, grade: "" }], DEFAULT_GRADE_SCALE)).toBe(0);
  });

  it("returns 0 for an empty subject list", () => {
    expect(calculateGPA([], DEFAULT_GRADE_SCALE)).toBe(0);
  });

  it("computes a weighted average across multiple subjects", () => {
    const subjects = [
      { credits: 3, grade: "A" }, // 4.0 * 3 = 12
      { credits: 4, grade: "B" }, // 3.0 * 4 = 12
    ];
    // (12 + 12) / 7 = 3.4285... -> rounded to 3.43
    expect(calculateGPA(subjects, DEFAULT_GRADE_SCALE)).toBeCloseTo(3.43, 2);
  });

  it("ignores subjects with no grade set", () => {
    const subjects = [
      { credits: 3, grade: "A" },
      { credits: 10, grade: "" },
    ];
    expect(calculateGPA(subjects, DEFAULT_GRADE_SCALE)).toBe(4.0);
  });

  it("ignores subjects with zero or negative credits", () => {
    const subjects = [
      { credits: 0, grade: "A" },
      { credits: -3, grade: "F" },
      { credits: 3, grade: "B" },
    ];
    expect(calculateGPA(subjects, DEFAULT_GRADE_SCALE)).toBe(3.0);
  });

  it("ignores a grade letter that isn't in the scale", () => {
    const subjects = [{ credits: 3, grade: "Z" }];
    expect(calculateGPA(subjects, DEFAULT_GRADE_SCALE)).toBe(0);
  });

  it("is defensive against non-numeric credit values", () => {
    const subjects = [{ credits: "three", grade: "A" }];
    expect(calculateGPA(subjects, DEFAULT_GRADE_SCALE)).toBe(0);
  });

  it("respects a custom grade scale", () => {
    const customScale = [{ letter: "A", points: 5.0 }];
    expect(calculateGPA([{ credits: 2, grade: "A" }], customScale)).toBe(5.0);
  });
});

describe("gpaLabel", () => {
  it("labels a 0 GPA as not yet graded", () => {
    expect(gpaLabel(0)).toBe("No grades yet");
  });

  it("labels a strong GPA as excellent", () => {
    expect(gpaLabel(3.9)).toBe("Excellent");
  });

  it("labels a weak GPA as needing attention", () => {
    expect(gpaLabel(1.5)).toBe("Needs attention");
  });
});
