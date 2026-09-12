import { describe, it, expect } from "vitest";
import {
  sanitizeSemester,
  sanitizeSubjects,
  sanitizeAssignments,
  sanitizeAttendance,
  sanitizeGoals,
  sanitizeGradeScale,
  parseImportSnapshot,
} from "./persistence";

describe("sanitizeSemester", () => {
  it("returns null for missing or malformed data", () => {
    expect(sanitizeSemester(null)).toBeNull();
    expect(sanitizeSemester(undefined)).toBeNull();
    expect(sanitizeSemester("not an object")).toBeNull();
    expect(sanitizeSemester({ name: "Fall" })).toBeNull(); // missing dates
  });

  it("accepts a well-formed semester", () => {
    const s = {
      name: "Fall 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
    };
    expect(sanitizeSemester(s)).toEqual(s);
  });
});

describe("sanitizeSubjects", () => {
  it("returns an empty array for non-array input", () => {
    expect(sanitizeSubjects(null)).toEqual([]);
    expect(sanitizeSubjects({ not: "an array" })).toEqual([]);
  });

  it("drops null/non-object entries but keeps valid ones", () => {
    const result = sanitizeSubjects([
      null,
      42,
      { name: "Physics", credits: 3 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Physics");
  });

  it("fills in a missing id and falls back for a missing name", () => {
    const [subject] = sanitizeSubjects([{ credits: 3 }]);
    expect(subject.id).toBeTruthy();
    expect(subject.name).toBe("Untitled subject");
  });

  it("coerces a non-numeric credits value to 0 instead of NaN", () => {
    const [subject] = sanitizeSubjects([{ name: "Art", credits: "lots" }]);
    expect(subject.credits).toBe(0);
  });
});

describe("sanitizeAssignments", () => {
  it("drops assignments that reference a subject that no longer exists", () => {
    const validIds = new Set(["subj-1"]);
    const result = sanitizeAssignments(
      [
        { subjectId: "subj-1", title: "Essay", dueDate: "2026-05-01" },
        { subjectId: "subj-deleted", title: "Orphaned", dueDate: "2026-05-01" },
      ],
      validIds,
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Essay");
  });

  it("falls back to a valid status when the stored value is unrecognized", () => {
    const [a] = sanitizeAssignments([
      { subjectId: "s", title: "X", dueDate: "2026-01-01", status: "on-fire" },
    ]);
    expect(a.status).toBe("pending");
  });

  it("falls back to today for an invalid due date rather than crashing sort logic", () => {
    const [a] = sanitizeAssignments([
      { subjectId: "s", title: "X", dueDate: "not-a-date" },
    ]);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(a.dueDate)).toBe(true);
  });
});

describe("sanitizeAttendance", () => {
  it("clamps attended so it can never exceed held", () => {
    const [rec] = sanitizeAttendance([
      { subjectId: "s", held: 5, attended: 50 },
    ]);
    expect(rec.attended).toBe(5);
  });

  it("floors negative values at 0", () => {
    const [rec] = sanitizeAttendance([
      { subjectId: "s", held: -3, attended: -1 },
    ]);
    expect(rec.held).toBe(0);
    expect(rec.attended).toBe(0);
  });
});

describe("sanitizeGoals", () => {
  it("drops goals with empty text", () => {
    const result = sanitizeGoals([{ text: "   " }, { text: "Read chapter 3" }]);
    expect(result).toHaveLength(1);
  });
});

describe("sanitizeGradeScale", () => {
  it("falls back to the default scale when given garbage", () => {
    const result = sanitizeGradeScale("not an array");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("letter");
  });

  it("clamps out-of-range point values into 0-4", () => {
    const result = sanitizeGradeScale([{ letter: "A", points: 99 }]);
    expect(result[0].points).toBe(4);
  });
});

describe("parseImportSnapshot", () => {
  it("rejects invalid JSON", () => {
    const result = parseImportSnapshot("{not valid json");
    expect(result.ok).toBe(false);
  });

  it("rejects a file with no recognizable AURA-X data", () => {
    const result = parseImportSnapshot(JSON.stringify({ hello: "world" }));
    expect(result.ok).toBe(false);
  });

  it("accepts and repairs a realistic export, dropping orphaned references", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      semester: {
        name: "Fall",
        startDate: "2026-09-01",
        endDate: "2026-12-20",
      },
      subjects: [{ id: "s1", name: "Physics", credits: 3 }],
      assignments: [
        { id: "a1", subjectId: "s1", title: "Lab", dueDate: "2026-10-01" },
        {
          id: "a2",
          subjectId: "ghost",
          title: "Orphan",
          dueDate: "2026-10-01",
        },
      ],
    });
    const result = parseImportSnapshot(raw);
    expect(result.ok).toBe(true);
    expect(result.data.subjects).toHaveLength(1);
    expect(result.data.assignments).toHaveLength(1);
    expect(result.data.assignments[0].title).toBe("Lab");
  });
});
