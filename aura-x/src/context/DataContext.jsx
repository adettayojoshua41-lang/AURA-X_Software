import { createContext, useContext, useMemo } from "react";
import { useLocalStorage, newId } from "../hooks/useLocalStorage";
import { DEFAULT_GRADE_SCALE, calculateGPA } from "../utils/gpaCalculator";
import { buildSampleData } from "../utils/sampleData";
import { todayISO } from "../utils/dateHelpers";
import { createTopic, createQuizAttempt } from "../utils/studyTwin";
import {
  sanitizeSemester,
  sanitizeSubjects,
  sanitizeAssignments,
  sanitizeAttendance,
  sanitizeNotes,
  sanitizeGoals,
  sanitizePomodoroSessions,
  sanitizeGradeScale,
  sanitizeTopics,
  sanitizeExams,
  sanitizeAttempts,
  buildExportSnapshot,
  parseImportSnapshot,
} from "../utils/persistence";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [semester, setSemester] = useLocalStorage(
    "semester",
    null,
    sanitizeSemester,
  );
  const [subjects, setSubjects] = useLocalStorage(
    "subjects",
    [],
    sanitizeSubjects,
  );

  // Assignments/attendance/notes are sanitized against the subject ids that
  // were just resolved above, so a corrupted or hand-edited record pointing
  // at a subject that no longer exists is dropped instead of causing a
  // "can't find subject" crash deeper in the UI.
  const validSubjectIds = useMemo(
    () => new Set(subjects.map((s) => s.id)),
    [subjects],
  );
  const sanitizeAssignmentsBound = useMemo(
    () => (v) => sanitizeAssignments(v, validSubjectIds),
    [validSubjectIds],
  );
  const sanitizeAttendanceBound = useMemo(
    () => (v) => sanitizeAttendance(v, validSubjectIds),
    [validSubjectIds],
  );
  const sanitizeNotesBound = useMemo(
    () => (v) => sanitizeNotes(v, validSubjectIds),
    [validSubjectIds],
  );

  const [assignments, setAssignments] = useLocalStorage(
    "assignments",
    [],
    sanitizeAssignmentsBound,
  );
  const [attendance, setAttendance] = useLocalStorage(
    "attendance",
    [],
    sanitizeAttendanceBound,
  );
  const [notes, setNotes] = useLocalStorage("notes", [], sanitizeNotesBound);
  const [goals, setGoals] = useLocalStorage("goals", [], sanitizeGoals);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage(
    "pomodoroSessions",
    [],
    sanitizePomodoroSessions,
  );
  const [gradeScale, setGradeScale] = useLocalStorage(
    "gradeScale",
    DEFAULT_GRADE_SCALE,
    sanitizeGradeScale,
  );

  // ---- Study Twin: Topics ----
  const sanitizeTopicsBound = useMemo(
    () => (v) => sanitizeTopics(v, validSubjectIds),
    [validSubjectIds],
  );
  const [topics, setTopics] = useLocalStorage(
    "topics",
    [],
    sanitizeTopicsBound,
  );

  // ---- Study Twin: Exams ----
  const sanitizeExamsBound = useMemo(
    () => (v) => sanitizeExams(v, validSubjectIds),
    [validSubjectIds],
  );
  const [exams, setExams] = useLocalStorage("exams", [], sanitizeExamsBound);

  // ---- Study Twin: Quiz Attempts ----
  const sanitizeAttemptsBound = useMemo(() => (v) => sanitizeAttempts(v), []);
  const [quizAttempts, setQuizAttempts] = useLocalStorage(
    "quizAttempts",
    [],
    sanitizeAttemptsBound,
  );

  // ---- Subjects ----
  const addSubject = (subject) => {
    setSubjects((list) => [...list, { id: newId(), grade: "", ...subject }]);
  };
  const updateSubject = (id, patch) => {
    setSubjects((list) =>
      list.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };
  const deleteSubject = (id) => {
    setSubjects((list) => list.filter((s) => s.id !== id));
    setAssignments((list) => list.filter((a) => a.subjectId !== id));
    setAttendance((list) => list.filter((a) => a.subjectId !== id));
    setNotes((list) => list.filter((n) => n.subjectId !== id));
  };

  // ---- Assignments ----
  const addAssignment = (assignment) => {
    setAssignments((list) => [
      ...list,
      { id: newId(), status: "pending", grade: "", ...assignment },
    ]);
  };
  const updateAssignment = (id, patch) => {
    setAssignments((list) =>
      list.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };
  const deleteAssignment = (id) => {
    setAssignments((list) => list.filter((a) => a.id !== id));
  };

  // ---- Attendance ----
  const getAttendanceFor = (subjectId) =>
    attendance.find((a) => a.subjectId === subjectId) || {
      subjectId,
      held: 0,
      attended: 0,
    };

  const markAttendance = (subjectId, present) => {
    setAttendance((list) => {
      const existing = list.find((a) => a.subjectId === subjectId);
      if (existing) {
        return list.map((a) =>
          a.subjectId === subjectId
            ? {
                ...a,
                held: a.held + 1,
                attended: a.attended + (present ? 1 : 0),
              }
            : a,
        );
      }
      return [...list, { subjectId, held: 1, attended: present ? 1 : 0 }];
    });
  };

  const adjustAttendance = (subjectId, field, delta) => {
    setAttendance((list) => {
      const existing = list.find((a) => a.subjectId === subjectId);
      const base = existing || { subjectId, held: 0, attended: 0 };
      const next = { ...base, [field]: Math.max(0, base[field] + delta) };
      if (next.attended > next.held) next.attended = next.held;
      if (existing) {
        return list.map((a) => (a.subjectId === subjectId ? next : a));
      }
      return [...list, next];
    });
  };

  // ---- Notes ----
  const addNote = (note) =>
    setNotes((list) => [
      { id: newId(), pinned: false, createdAt: todayISO(), ...note },
      ...list,
    ]);
  const updateNote = (id, patch) =>
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const deleteNote = (id) =>
    setNotes((list) => list.filter((n) => n.id !== id));

  // ---- Goals ----
  const addGoal = (goal) =>
    setGoals((list) => [
      ...list,
      { id: newId(), date: todayISO(), done: false, ...goal },
    ]);
  const toggleGoal = (id) =>
    setGoals((list) =>
      list.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    );
  const deleteGoal = (id) =>
    setGoals((list) => list.filter((g) => g.id !== id));

  // ---- Pomodoro ----
  const logPomodoroMinutes = (minutes) => {
    const date = todayISO();
    setPomodoroSessions((list) => {
      const existing = list.find((s) => s.date === date);
      if (existing) {
        return list.map((s) =>
          s.date === date ? { ...s, minutes: s.minutes + minutes } : s,
        );
      }
      return [...list, { id: newId(), date, minutes }];
    });
  };

  // ---- Topics ----
  const addTopic = (topic) => {
    setTopics((list) => [
      ...list,
      {
        ...createTopic(topic.subjectId, topic.name, topic.description),
        ...topic,
      },
    ]);
  };
  const updateTopic = (id, patch) => {
    setTopics((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };
  const deleteTopic = (id) => {
    setTopics((list) => list.filter((t) => t.id !== id));
    setQuizAttempts((list) => list.filter((a) => a.topicId !== id));
  };
  const getTopicsForSubject = (subjectId) =>
    topics.filter((t) => t.subjectId === subjectId);

  // ---- Exams ----
  const addExam = (exam) => {
    setExams((list) => [...list, { id: newId(), ...exam }]);
  };
  const updateExam = (id, patch) => {
    setExams((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };
  const deleteExam = (id) => {
    setExams((list) => list.filter((e) => e.id !== id));
  };
  const getExamForSubject = (subjectId) =>
    exams.find((e) => e.subjectId === subjectId);

  // ---- Quiz Attempts ----
  const recordQuizAttempt = (
    topicId,
    subjectId,
    isCorrect,
    mistakeType = null,
  ) => {
    const attempt = createQuizAttempt(
      topicId,
      subjectId,
      isCorrect,
      mistakeType,
    );
    setQuizAttempts((list) => [...list, attempt]);

    // Update topic stats
    setTopics((list) =>
      list.map((t) =>
        t.id === topicId
          ? {
              ...t,
              attempts: t.attempts + 1,
              correct: t.correct + (isCorrect ? 1 : 0),
              lastStudied: todayISO(),
            }
          : t,
      ),
    );

    return attempt;
  };
  const getAttemptsForTopic = (topicId) =>
    quizAttempts.filter((a) => a.topicId === topicId);
  const getAttemptsForSubject = (subjectId) =>
    quizAttempts.filter((a) => a.subjectId === subjectId);

  // ---- Derived values ----
  const gpa = useMemo(
    () => calculateGPA(subjects, gradeScale),
    [subjects, gradeScale],
  );

  const loadSampleData = () => {
    const sample = buildSampleData();
    setSemester(sample.semester);
    setSubjects(sample.subjects);
    setAssignments(sample.assignments);
    setAttendance(sample.attendance);
    setNotes(sample.notes);
    setGoals(sample.goals);
    setPomodoroSessions(sample.pomodoroSessions);
    setTopics(sample.topics);
    setExams(sample.exams);
    setQuizAttempts(sample.quizAttempts);
  };

  const clearAllData = () => {
    setSemester(null);
    setSubjects([]);
    setAssignments([]);
    setAttendance([]);
    setNotes([]);
    setGoals([]);
    setPomodoroSessions([]);
    setGradeScale(DEFAULT_GRADE_SCALE);
    setTopics([]);
    setExams([]);
    setQuizAttempts([]);
  };

  const exportData = () =>
    buildExportSnapshot({
      semester,
      subjects,
      assignments,
      attendance,
      notes,
      goals,
      pomodoroSessions,
      gradeScale,
      topics,
      exams,
      quizAttempts,
    });

  /** Returns { ok, error } so the calling page can show the right toast. */
  const importData = (raw) => {
    const result = parseImportSnapshot(raw);
    if (!result.ok) return result;
    const { data } = result;
    setSemester(data.semester);
    setSubjects(data.subjects);
    setAssignments(data.assignments);
    setAttendance(data.attendance);
    setNotes(data.notes);
    setGoals(data.goals);
    setPomodoroSessions(data.pomodoroSessions);
    setGradeScale(data.gradeScale);
    setTopics(data.topics);
    setExams(data.exams);
    setQuizAttempts(data.quizAttempts);
    return { ok: true };
  };

  const value = {
    semester,
    setSemester,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    attendance,
    getAttendanceFor,
    markAttendance,
    adjustAttendance,
    notes,
    addNote,
    updateNote,
    deleteNote,
    goals,
    addGoal,
    toggleGoal,
    deleteGoal,
    pomodoroSessions,
    logPomodoroMinutes,
    gradeScale,
    setGradeScale,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    getTopicsForSubject,
    exams,
    addExam,
    updateExam,
    deleteExam,
    getExamForSubject,
    quizAttempts,
    recordQuizAttempt,
    getAttemptsForTopic,
    getAttemptsForSubject,
    gpa,
    loadSampleData,
    clearAllData,
    exportData,
    importData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally co-located with its provider
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
