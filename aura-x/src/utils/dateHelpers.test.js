import { describe, it, expect } from "vitest";
import { isOverdue, isDueSoon, daysBetween, todayISO, addDays } from "./dateHelpers";

describe("isOverdue", () => {
  const today = todayISO();

  it("is true for a pending assignment due in the past", () => {
    expect(isOverdue(addDays(today, -1), "pending")).toBe(true);
  });

  it("is false for a pending assignment due today", () => {
    expect(isOverdue(today, "pending")).toBe(false);
  });

  it("is false for a pending assignment due in the future", () => {
    expect(isOverdue(addDays(today, 3), "pending")).toBe(false);
  });

  it("is never true once submitted, even if the date has passed", () => {
    expect(isOverdue(addDays(today, -5), "submitted")).toBe(false);
  });

  it("is never true once graded, even if the date has passed", () => {
    expect(isOverdue(addDays(today, -5), "graded")).toBe(false);
  });
});

describe("isDueSoon", () => {
  const today = todayISO();

  it("is true for a pending assignment due in 2 days", () => {
    expect(isDueSoon(addDays(today, 2), "pending")).toBe(true);
  });

  it("is true for a pending assignment due today", () => {
    expect(isDueSoon(today, "pending")).toBe(true);
  });

  it("is false for a pending assignment due in 4+ days", () => {
    expect(isDueSoon(addDays(today, 4), "pending")).toBe(false);
  });

  it("is false for an already-overdue assignment (that's a different state)", () => {
    expect(isDueSoon(addDays(today, -1), "pending")).toBe(false);
  });

  it("is false once graded or submitted", () => {
    expect(isDueSoon(today, "graded")).toBe(false);
    expect(isDueSoon(today, "submitted")).toBe(false);
  });
});

describe("daysBetween", () => {
  it("computes whole-day differences", () => {
    expect(daysBetween("2026-01-01", "2026-01-10")).toBe(9);
    expect(daysBetween("2026-01-10", "2026-01-01")).toBe(-9);
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0);
  });
});
