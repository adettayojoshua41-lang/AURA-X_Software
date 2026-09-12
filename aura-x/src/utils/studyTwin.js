/**
 * Study Twin — Represents a student's complete academic state.
 *
 * The Study Twin tracks:
 * - Topics (per subject) with mastery levels
 * - Quiz attempts with mistake categorization
 * - Study sessions and learning history
 * - Exam dates and readiness scores
 * - Retention risks and improvement trends
 *
 * This data powers the Study Flow Engine.
 */

import { newId } from "../hooks/useLocalStorage";
import { todayISO } from "./dateHelpers";

/** Mistake categories for quiz attempts */
export const MISTAKE_TYPES = {
  KNOWLEDGE_GAP: "knowledge_gap",
  MISUNDERSTANDING: "misunderstanding",
  CALCULATION_ERROR: "calculation_error",
  MISREADING: "misreading",
  POOR_REASONING: "poor_reasoning",
  MEMORY_FAILURE: "memory_failure",
  CARELESS_MISTAKE: "careless_mistake",
  TIME_MANAGEMENT: "time_management",
  UNKNOWN: "unknown",
};

/** Topic mastery levels */
export const MASTERY_LEVELS = {
  NOT_STARTED: 0,
  LEARNING: 0.25,
  PRACTICING: 0.5,
  PROFICIENT: 0.75,
  MASTERED: 1.0,
};

export const MASTERY_STATUS = {
  "🔴": (m) => m <= 0.4, // Red: weak (0-40%)
  "🟠": (m) => m <= 0.65, // Orange: moderate (41-65%)
  "🟢": (m) => m <= 0.85, // Green: strong (66-85%)
  "🟢🟢": (m) => m > 0.85, // Double green: mastered (86-100%)
};

/**
 * Get a topic's mastery indicator emoji and status.
 */
export function getMasteryStatus(masteryScore) {
  for (const [icon, checker] of Object.entries(MASTERY_STATUS)) {
    if (checker(masteryScore)) return icon;
  }
  return "🟢🟢";
}

/**
 * Get mastery description for display.
 */
export function getMasteryLabel(masteryScore) {
  if (masteryScore <= 0.4) return "Weak";
  if (masteryScore <= 0.65) return "Moderate";
  if (masteryScore <= 0.85) return "Strong";
  return "Mastered";
}

/**
 * Default topic (before any practice).
 */
export function createTopic(subjectId, name, description = "") {
  return {
    id: newId(),
    subjectId,
    name,
    description,
    mastery: 0, // 0-1 score
    attempts: 0, // total quiz attempts
    correct: 0, // correct answers
    lastStudied: null, // ISO date
    createdAt: todayISO(),
    retention: 1.0, // 0-1, how much has been forgotten
    difficulty: 0.5, // 0-1 perceived difficulty
    isWeak: false, // flagged as priority topic
  };
}

/**
 * A quiz attempt on a topic.
 */
export function createQuizAttempt(
  topicId,
  subjectId,
  isCorrect,
  mistakeType = MISTAKE_TYPES.UNKNOWN,
) {
  return {
    id: newId(),
    topicId,
    subjectId,
    isCorrect,
    mistakeType: isCorrect ? null : mistakeType,
    timestamp: new Date().toISOString(),
    attemptedAt: todayISO(),
  };
}

/**
 * An exam scheduled for a course.
 */
export function createExam(subjectId, examDate, topics = []) {
  return {
    id: newId(),
    subjectId,
    examDate, // ISO date
    topics, // array of topic ids being tested
    createdAt: todayISO(),
    estimatedReadiness: 0, // 0-1, calculated from topic mastery
  };
}

/**
 * Calculate mastery for a topic based on attempts.
 * Uses a simple ratio: correct / total, but decayed by retention.
 */
export function calculateTopicMastery(topic, decayByDaysSinceStudy = true) {
  if (topic.attempts === 0) return 0;

  let base = topic.correct / topic.attempts;

  // Apply retention decay if last studied > 7 days ago
  if (decayByDaysSinceStudy && topic.lastStudied) {
    const lastDate = new Date(topic.lastStudied);
    const today = new Date();
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (daysSince > 7) {
      // Decay 5% per week after first week
      const weeksOver = Math.floor((daysSince - 7) / 7);
      base *= Math.pow(0.95, weeksOver);
    }
  }

  return Math.min(1, base);
}

/**
 * Calculate exam readiness for a subject.
 * Based on mastery of all topics, with weighting toward weak topics.
 */
export function calculateExamReadiness(topics) {
  if (topics.length === 0) return 0;

  // Topics with lower mastery are weighted more heavily
  const weighted = topics.reduce((sum, t) => {
    const mastery = calculateTopicMastery(t);
    // Give lower-mastery topics more weight
    const weight = 1 - mastery;
    return sum + mastery * weight;
  }, 0);

  const totalWeight = topics.reduce((sum, t) => {
    const mastery = calculateTopicMastery(t);
    return sum + (1 - mastery);
  }, 0);

  if (totalWeight === 0) return 1; // All mastered

  return Math.round((weighted / totalWeight) * 100) / 100;
}

/**
 * Identify weak topics for a subject (mastery < 50%).
 */
export function getWeakTopics(topics) {
  return topics
    .filter((t) => calculateTopicMastery(t) < 0.5)
    .sort((a, b) => calculateTopicMastery(a) - calculateTopicMastery(b));
}

/**
 * Identify topics at risk of being forgotten (last studied > 14 days ago).
 */
export function getRetentionRiskTopics(topics) {
  const today = new Date();
  return topics.filter((t) => {
    if (!t.lastStudied) return false;
    const lastDate = new Date(t.lastStudied);
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    return daysSince > 14;
  });
}

/**
 * Identify recent mistakes (last 7 days) grouped by type.
 */
export function recentMistakesByType(attempts, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = attempts.filter((a) => {
    const date = new Date(a.timestamp);
    return !a.isCorrect && date > cutoff;
  });

  const grouped = {};
  recent.forEach((a) => {
    const type = a.mistakeType || MISTAKE_TYPES.UNKNOWN;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(a);
  });

  return grouped;
}

/**
 * Get topics that have repeated mistakes (same mistake type 2+ times in 7 days).
 */
export function getRepeatedMistakeTopics(topics, attempts) {
  const byType = recentMistakesByType(attempts);
  const problemTopics = [];

  for (const [mistakeType, attemptList] of Object.entries(byType)) {
    const topicIds = new Set(attemptList.map((a) => a.topicId));
    topicIds.forEach((topicId) => {
      const count = attemptList.filter((a) => a.topicId === topicId).length;
      if (count >= 2) {
        problemTopics.push({
          topicId,
          mistakeType,
          count,
          topic: topics.find((t) => t.id === topicId),
        });
      }
    });
  }

  return problemTopics.sort((a, b) => b.count - a.count);
}
