/**
 * Study Flow Engine
 *
 * Analyzes available student data and generates personalized study recommendations.
 *
 * The engine determines: "What is the highest-value thing this student should do next?"
 *
 * It considers:
 * - Exam dates and time remaining
 * - Topic mastery and weak areas
 * - Recent mistakes and patterns
 * - Available study time
 * - Retention risks
 */

import {
  calculateTopicMastery,
  getWeakTopics,
  getRetentionRiskTopics,
  getRepeatedMistakeTopics,
  getMasteryStatus,
} from "./studyTwin";

/**
 * Priority levels for recommendations.
 */
export const PRIORITY = {
  CRITICAL: "critical", // Weak + exam soon (high impact)
  HIGH: "high", // Weak or repeated mistakes
  MEDIUM: "medium", // Moderate mastery or moderate time pressure
  LOW: "low", // Strong or abundant time
};

/**
 * Reasons why a topic is recommended.
 */
export const RECOMMENDATION_REASON = {
  WEAK_HIGH_PRIORITY: "This is one of your weakest high-priority topics.",
  REPEATED_MISTAKES: "You've made repeated mistakes in this topic recently.",
  EXAM_SOON: "This topic will be on an upcoming exam.",
  RETENTION_RISK: "You haven't studied this in a while and risk forgetting it.",
  WELL_ROUNDED: "This is a strong topic—practicing it maintains mastery.",
  IMPROVING:
    "You're showing steady improvement; more practice will solidify it.",
};

/**
 * Analyze a single subject and generate personalized recommendations.
 *
 * Returns { recommendations, summary, readiness, analysis }
 */
export function analyzeSubjectFlow({
  subject,
  topics = [],
  attempts = [],
  exam = null,
  availableMinutes = 60,
}) {
  // Calculate key metrics
  const weakTopics = getWeakTopics(topics);
  const retentionRisk = getRetentionRiskTopics(topics);
  const repeatedMistakes = getRepeatedMistakeTopics(topics, attempts);

  const daysUntilExam = exam
    ? Math.ceil((new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const examUrgent = daysUntilExam && daysUntilExam <= 7;
  const examModerate = daysUntilExam && daysUntilExam <= 21;

  // Score each topic for recommendation
  const scoredTopics = topics.map((topic) => {
    const mastery = calculateTopicMastery(topic);
    let score;
    let reason;

    // Weak topics are priority (base score 80-100)
    if (mastery < 0.5) {
      score = 80 + (1 - mastery * 2) * 20; // 80-100 based on how weak
      reason = RECOMMENDATION_REASON.WEAK_HIGH_PRIORITY;

      // Boost urgency if exam is soon
      if (examUrgent) score += 30;
      else if (examModerate) score += 15;
    }
    // Moderate mastery (50-75%), some practice helps
    else if (mastery < 0.75) {
      score = 50 + (1 - mastery) * 50; // 50-75
      reason = RECOMMENDATION_REASON.IMPROVING;

      if (examUrgent) score += 20;
      else if (examModerate) score += 10;
    }
    // Strong mastery (75+%), lower priority but maintenance helps
    else {
      score = 20 + (1 - mastery) * 30; // 20-30
      reason = RECOMMENDATION_REASON.WELL_ROUNDED;
    }

    // Boost if it has repeated recent mistakes
    const hasMistakes = repeatedMistakes.some((m) => m.topicId === topic.id);
    if (hasMistakes) {
      score += 25;
      reason = RECOMMENDATION_REASON.REPEATED_MISTAKES;
    }

    // Boost if retention is at risk
    if (retentionRisk.includes(topic)) {
      score += 20;
      reason = RECOMMENDATION_REASON.RETENTION_RISK;
    }

    return {
      topic,
      score: Math.round(score),
      mastery: Math.round(mastery * 100),
      reason,
      priority:
        score >= 80
          ? PRIORITY.CRITICAL
          : score >= 60
            ? PRIORITY.HIGH
            : score >= 40
              ? PRIORITY.MEDIUM
              : PRIORITY.LOW,
    };
  });

  // Sort by score (highest = most important)
  scoredTopics.sort((a, b) => b.score - a.score);

  // Build personalized recommendations based on available time
  const recommendations = buildRecommendations(scoredTopics, availableMinutes);

  // Calculate overall readiness
  const averageMastery =
    topics.length > 0
      ? Math.round(
          (topics.reduce((sum, t) => sum + calculateTopicMastery(t), 0) /
            topics.length) *
            100,
        )
      : 0;

  return {
    subject,
    recommendations,
    summary: {
      totalTopics: topics.length,
      weakCount: weakTopics.length,
      strongCount: topics.filter((t) => calculateTopicMastery(t) >= 0.75)
        .length,
      daysUntilExam,
      averageMastery,
    },
    analysis: {
      weakTopics: weakTopics.map((t) => ({
        name: t.name,
        mastery: Math.round(calculateTopicMastery(t) * 100),
      })),
      retentionRisk: retentionRisk.map((t) => t.name),
      repeatedMistakes: repeatedMistakes.slice(0, 3).map((m) => ({
        topic: m.topic?.name,
        mistakeType: m.mistakeType,
        count: m.count,
      })),
    },
  };
}

/**
 * Build a time-optimized study flow for the available minutes.
 */
function buildRecommendations(scoredTopics, availableMinutes) {
  const recommendations = [];
  let timeUsed = 0;

  // Always prioritize weak/urgent topics first
  for (const item of scoredTopics) {
    if (timeUsed >= availableMinutes) break;

    // Allocate time based on topic importance and available time
    let timeAlloc;

    if (item.priority === PRIORITY.CRITICAL) {
      timeAlloc = Math.min(
        availableMinutes - timeUsed,
        Math.ceil(availableMinutes * 0.4),
      );
    } else if (item.priority === PRIORITY.HIGH) {
      timeAlloc = Math.min(
        availableMinutes - timeUsed,
        Math.ceil(availableMinutes * 0.3),
      );
    } else if (item.priority === PRIORITY.MEDIUM) {
      timeAlloc = Math.min(
        availableMinutes - timeUsed,
        Math.ceil(availableMinutes * 0.2),
      );
    } else {
      timeAlloc = Math.min(
        availableMinutes - timeUsed,
        Math.ceil(availableMinutes * 0.1),
      );
    }

    if (timeAlloc > 0) {
      recommendations.push({
        topic: item.topic,
        timeMinutes: timeAlloc,
        priority: item.priority,
        mastery: item.mastery,
        reason: item.reason,
        status: getMasteryStatus(item.mastery / 100),
      });

      timeUsed += timeAlloc;
    }
  }

  return recommendations;
}

/**
 * Generate a complete personalized Study Flow for today.
 *
 * Analyzes all subjects and returns a prioritized list of what to study.
 */
export function generateDailyStudyFlow({
  subjects = [],
  subjectTopics = {}, // { subjectId: [topics] }
  subjectAttempts = {}, // { subjectId: [attempts] }
  subjectExams = {}, // { subjectId: exam }
  availableMinutes = 60,
  weeklyStudiedMinutes = 0,
  weeklyGoalMinutes = 300,
}) {
  const flows = [];

  for (const subject of subjects) {
    const flow = analyzeSubjectFlow({
      subject,
      topics: subjectTopics[subject.id] || [],
      attempts: subjectAttempts[subject.id] || [],
      exam: subjectExams[subject.id],
      availableMinutes,
      weeklyGoalMinutes,
      weeklyStudiedMinutes,
    });

    flows.push(flow);
  }

  // Merge all recommendations and prioritize
  const allRecs = flows.flatMap((f) =>
    f.recommendations.map((r) => ({
      ...r,
      subject: f.subject,
    })),
  );

  // Sort by priority
  const priorityOrder = {
    [PRIORITY.CRITICAL]: 0,
    [PRIORITY.HIGH]: 1,
    [PRIORITY.MEDIUM]: 2,
    [PRIORITY.LOW]: 3,
  };

  allRecs.sort((a, b) => {
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.mastery / 100 - a.mastery / 100; // Then by mastery
  });

  // Build your study flow
  const yourFlow = [];
  let timeUsed = 0;

  for (const rec of allRecs) {
    if (timeUsed >= availableMinutes) break;

    const timeToUse = Math.min(rec.timeMinutes, availableMinutes - timeUsed);

    yourFlow.push({
      subject: rec.subject,
      topic: rec.topic,
      timeMinutes: timeToUse,
      priority: rec.priority,
      reason: rec.reason,
    });

    timeUsed += timeToUse;
  }

  return {
    yourFlow,
    totalTimeMinutes: timeUsed,
    totalAvailableMinutes: availableMinutes,
    flows,
  };
}

/**
 * Generate "Exam Rescue" mode for an imminent exam.
 *
 * Assumes exam is within 7 days and creates an aggressive review schedule.
 */
export function generateExamRescue({
  subject,
  topics = [],
  exam,
  minutesPerDay = 120,
  daysAvailable = 7,
}) {
  const weakTopics = getWeakTopics(topics);
  const moderateTopics = topics.filter((t) => {
    const m = calculateTopicMastery(t);
    return m >= 0.5 && m < 0.75;
  });

  const must = { label: "🔴 MUST LEARN", topics: weakTopics.slice(0, 3) };
  const should = {
    label: "🟠 SHOULD REVIEW",
    topics: moderateTopics.slice(0, 3),
  };
  const strong = {
    label: "🟢 ALREADY STRONG",
    topics: topics.filter((t) => calculateTopicMastery(t) >= 0.75).slice(0, 2),
  };

  // Allocate time: 50% must, 35% should, 15% strong
  const totalMinutes = minutesPerDay * daysAvailable;
  const mustMinutes = Math.ceil(totalMinutes * 0.5);
  const shouldMinutes = Math.ceil(totalMinutes * 0.35);
  const strongMinutes = totalMinutes - mustMinutes - shouldMinutes;

  return {
    subject,
    exam,
    daysAvailable,
    minutesPerDay,
    schedule: [
      {
        ...must,
        totalMinutes: mustMinutes,
        perTopicMinutes: Math.floor(mustMinutes / (must.topics.length || 1)),
        activities: [
          "Focus on understanding the core concept",
          "Work through difficult practice problems",
          "Identify and fix common mistakes",
        ],
      },
      {
        ...should,
        totalMinutes: shouldMinutes,
        perTopicMinutes: Math.floor(
          shouldMinutes / (should.topics.length || 1),
        ),
        activities: [
          "Quick review of key points",
          "Practice similar problems",
          "Solidify understanding",
        ],
      },
      {
        ...strong,
        totalMinutes: strongMinutes,
        perTopicMinutes: Math.floor(
          strongMinutes / (strong.topics.length || 1),
        ),
        activities: [
          "Maintenance practice",
          "Advanced problem solving",
          "Teach others or explain concepts",
        ],
      },
    ],
  };
}
