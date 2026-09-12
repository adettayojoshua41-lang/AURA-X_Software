import { describe, it, expect } from "vitest";
import { attendancePercent, attendanceStatus } from "./attendanceCalculator";

describe("attendancePercent", () => {
  it("returns 0 when no classes have been held yet", () => {
    expect(attendancePercent(0, 0)).toBe(0);
  });

  it("computes a normal percentage", () => {
    expect(attendancePercent(20, 18)).toBe(90);
  });

  it("rounds to the nearest whole percent", () => {
    expect(attendancePercent(3, 1)).toBe(33);
  });

  it("clamps attended so it can never exceed held (corrupted data safety net)", () => {
    expect(attendancePercent(10, 999)).toBe(100);
  });

  it("treats negative input defensively instead of returning NaN or a negative percent", () => {
    expect(attendancePercent(-5, -2)).toBe(0);
  });

  it("is defensive against non-numeric input", () => {
    expect(attendancePercent("ten", "five")).toBe(0);
  });
});

describe("attendanceStatus", () => {
  it("flags 85% and above as on track", () => {
    expect(attendanceStatus(85)).toBe("On track");
    expect(attendanceStatus(100)).toBe("On track");
  });

  it("flags 75-84% as worth watching", () => {
    expect(attendanceStatus(80)).toBe("Watch this one");
  });

  it("flags below 75% as at risk", () => {
    expect(attendanceStatus(50)).toBe("At risk");
  });
});
