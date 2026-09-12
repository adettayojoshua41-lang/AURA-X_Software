import { newId } from "../hooks/useLocalStorage";
import { todayISO, lastNDays, addDays, formatLocalDate } from "./dateHelpers";
import { createTopic, createQuizAttempt, MISTAKE_TYPES } from "./studyTwin";

/** Builds a fully populated demo dataset so evaluators see a working app instantly. */
export function buildSampleData() {
  const today = todayISO();
  const start = new Date();
  start.setMonth(start.getMonth() - 2);
  const end = new Date();
  end.setMonth(end.getMonth() + 2);

  const subjects = [
    {
      id: newId(),
      name: "Data Structures",
      code: "CS201",
      credits: 3,
      color: "#7C6BFF",
      teacher: "Dr. Farah Khan",
      grade: "A-",
    },
    {
      id: newId(),
      name: "Calculus II",
      code: "MATH210",
      credits: 4,
      color: "#FF7EB6",
      teacher: "Prof. Ahsan Raza",
      grade: "B+",
    },
    {
      id: newId(),
      name: "Digital Logic Design",
      code: "EE150",
      credits: 3,
      color: "#33C7C0",
      teacher: "Dr. Sana Iqbal",
      grade: "A",
    },
    {
      id: newId(),
      name: "Technical Writing",
      code: "ENG110",
      credits: 2,
      color: "#FFB86B",
      teacher: "Ms. Hira Malik",
      grade: "",
    },
  ];

  const assignments = [
    {
      id: newId(),
      subjectId: subjects[0].id,
      title: "Linked List Lab Report",
      dueDate: addDays(today, -2),
      status: "graded",
      grade: "A",
    },
    {
      id: newId(),
      subjectId: subjects[0].id,
      title: "Binary Tree Assignment",
      dueDate: addDays(today, 2),
      status: "pending",
      grade: "",
    },
    {
      id: newId(),
      subjectId: subjects[1].id,
      title: "Integration Problem Set",
      dueDate: addDays(today, 1),
      status: "pending",
      grade: "",
    },
    {
      id: newId(),
      subjectId: subjects[1].id,
      title: "Series Convergence Quiz",
      dueDate: addDays(today, -5),
      status: "graded",
      grade: "B",
    },
    {
      id: newId(),
      subjectId: subjects[2].id,
      title: "Karnaugh Map Exercise",
      dueDate: addDays(today, 5),
      status: "pending",
      grade: "",
    },
    {
      id: newId(),
      subjectId: subjects[3].id,
      title: "Research Proposal Draft",
      dueDate: addDays(today, -1),
      status: "submitted",
      grade: "",
    },
  ];

  const attendance = [
    { subjectId: subjects[0].id, held: 20, attended: 18 },
    { subjectId: subjects[1].id, held: 22, attended: 15 },
    { subjectId: subjects[2].id, held: 18, attended: 17 },
    { subjectId: subjects[3].id, held: 14, attended: 10 },
  ];

  const notes = [
    {
      id: newId(),
      subjectId: subjects[0].id,
      title: "Big-O cheat sheet",
      content:
        "O(1) constant, O(log n) log, O(n) linear, O(n log n), O(n^2) quadratic. Always check nested loops first.",
      pinned: true,
      createdAt: today,
    },
    {
      id: newId(),
      subjectId: subjects[2].id,
      title: "K-map grouping rules",
      content:
        "Group in powers of 2 (1, 2, 4, 8). Groups can wrap around edges. Aim for the fewest, largest groups.",
      pinned: false,
      createdAt: today,
    },
  ];

  const last14 = lastNDays(14);
  const goals = last14.flatMap((date, i) => [
    { id: newId(), date, text: "Review lecture notes", done: i < 10 },
    {
      id: newId(),
      date,
      text: "Complete one practice problem set",
      done: i < 8,
    },
  ]);

  const pomodoroSessions = last14.map((date, i) => ({
    id: newId(),
    date,
    minutes: [50, 25, 0, 75, 100, 25, 50, 0, 125, 75, 25, 50, 100, 25][i] ?? 0,
  }));

  // ---- Study Twin: Topics ----
  const topics = [
    // Data Structures topics
    {
      ...createTopic(
        subjects[0].id,
        "Arrays & Linked Lists",
        "Fundamental data structures",
      ),
      mastery: 0.88,
      attempts: 12,
      correct: 11,
      lastStudied: addDays(today, -1),
      difficulty: 0.3,
    },
    {
      ...createTopic(
        subjects[0].id,
        "Trees & Graphs",
        "Hierarchical and network data",
      ),
      mastery: 0.72,
      attempts: 15,
      correct: 11,
      lastStudied: addDays(today, -3),
      difficulty: 0.65,
      isWeak: true,
    },
    {
      ...createTopic(
        subjects[0].id,
        "Sorting Algorithms",
        "Efficiency and optimization",
      ),
      mastery: 0.81,
      attempts: 10,
      correct: 8,
      lastStudied: addDays(today, -2),
      difficulty: 0.5,
    },
    {
      ...createTopic(subjects[0].id, "Hash Tables", "Key-value storage"),
      mastery: 0.65,
      attempts: 8,
      correct: 5,
      lastStudied: addDays(today, -5),
      difficulty: 0.6,
      isWeak: true,
    },
    // Calculus topics
    {
      ...createTopic(
        subjects[1].id,
        "Limits & Continuity",
        "Foundation of calculus",
      ),
      mastery: 0.87,
      attempts: 14,
      correct: 12,
      lastStudied: addDays(today, -1),
      difficulty: 0.4,
    },
    {
      ...createTopic(subjects[1].id, "Differentiation", "Rates of change"),
      mastery: 0.79,
      attempts: 16,
      correct: 13,
      lastStudied: addDays(today, -2),
      difficulty: 0.45,
    },
    {
      ...createTopic(subjects[1].id, "Integration", "Accumulation and area"),
      mastery: 0.58,
      attempts: 18,
      correct: 10,
      lastStudied: addDays(today, -8),
      difficulty: 0.75,
      isWeak: true,
    },
    {
      ...createTopic(
        subjects[1].id,
        "Integration by Substitution",
        "Advanced technique",
      ),
      mastery: 0.42,
      attempts: 12,
      correct: 5,
      lastStudied: addDays(today, -10),
      difficulty: 0.85,
      isWeak: true,
    },
    // Digital Logic topics
    {
      ...createTopic(subjects[2].id, "Boolean Algebra", "Logic fundamentals"),
      mastery: 0.91,
      attempts: 10,
      correct: 9,
      lastStudied: addDays(today, -1),
      difficulty: 0.3,
    },
    {
      ...createTopic(
        subjects[2].id,
        "Combinational Circuits",
        "Circuit design basics",
      ),
      mastery: 0.85,
      attempts: 12,
      correct: 10,
      lastStudied: addDays(today, -2),
      difficulty: 0.5,
    },
    {
      ...createTopic(
        subjects[2].id,
        "Karnaugh Maps",
        "Simplification technique",
      ),
      mastery: 0.76,
      attempts: 11,
      correct: 8,
      lastStudied: addDays(today, -4),
      difficulty: 0.55,
    },
  ];

  // ---- Study Twin: Exams ----
  const exams = [
    {
      id: newId(),
      subjectId: subjects[0].id,
      examDate: addDays(today, 15),
      topics: [topics[0].id, topics[1].id, topics[2].id, topics[3].id],
      createdAt: today,
      estimatedReadiness: 0.76,
    },
    {
      id: newId(),
      subjectId: subjects[1].id,
      examDate: addDays(today, 22),
      topics: [topics[4].id, topics[5].id, topics[6].id, topics[7].id],
      createdAt: today,
      estimatedReadiness: 0.68,
    },
    {
      id: newId(),
      subjectId: subjects[2].id,
      examDate: addDays(today, 18),
      topics: [topics[8].id, topics[9].id, topics[10].id],
      createdAt: today,
      estimatedReadiness: 0.84,
    },
  ];

  // ---- Study Twin: Quiz Attempts ----
  const quizAttempts = [
    // Recent mistakes in Integration by Substitution
    {
      ...createQuizAttempt(
        topics[7].id,
        subjects[1].id,
        false,
        MISTAKE_TYPES.CALCULATION_ERROR,
      ),
      attemptedAt: addDays(today, -1),
    },
    {
      ...createQuizAttempt(
        topics[7].id,
        subjects[1].id,
        false,
        MISTAKE_TYPES.MISUNDERSTANDING,
      ),
      attemptedAt: addDays(today, -2),
    },
    {
      ...createQuizAttempt(topics[7].id, subjects[1].id, true),
      attemptedAt: addDays(today, -3),
    },
    // Recent attempts in Integration
    {
      ...createQuizAttempt(topics[6].id, subjects[1].id, true),
      attemptedAt: addDays(today, -1),
    },
    {
      ...createQuizAttempt(
        topics[6].id,
        subjects[1].id,
        false,
        MISTAKE_TYPES.CARELESS_MISTAKE,
      ),
      attemptedAt: addDays(today, -4),
    },
    // Hash table struggles
    {
      ...createQuizAttempt(
        topics[3].id,
        subjects[0].id,
        false,
        MISTAKE_TYPES.KNOWLEDGE_GAP,
      ),
      attemptedAt: addDays(today, -5),
    },
    {
      ...createQuizAttempt(
        topics[3].id,
        subjects[0].id,
        false,
        MISTAKE_TYPES.MEMORY_FAILURE,
      ),
      attemptedAt: addDays(today, -6),
    },
  ];

  return {
    semester: {
      name: "Fall Semester 2026",
      startDate: formatLocalDate(start),
      endDate: formatLocalDate(end),
    },
    subjects,
    assignments,
    attendance,
    notes,
    goals,
    pomodoroSessions,
    topics,
    exams,
    quizAttempts,
  };
}
