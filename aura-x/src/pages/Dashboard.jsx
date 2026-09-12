import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HiSparkles,
  HiClock,
  HiPencilSquare,
  HiCalendarDays,
  HiFire,
} from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { quoteOfTheDay } from "../utils/quotes";
import {
  todayISO,
  isOverdue,
  isDueSoon,
  formatDate,
  lastNDays,
  formatLocalDate,
} from "../utils/dateHelpers";
import { generateDailyStudyFlow, PRIORITY } from "../utils/studyFlowEngine";
import EmptyState from "../components/EmptyState";
import Tooltip from "../components/Tooltip";
import WeeklyAnalytics from "../components/WeeklyAnalytics";

function calculateStudyStreak(goals) {
  const days = lastNDays(60).reverse();
  let streak = 0;
  for (const date of days) {
    const dayGoals = goals.filter((g) => g.date === date);
    if (dayGoals.length === 0) break;
    if (dayGoals.every((g) => g.done)) streak++;
    else break;
  }
  return streak;
}

export default function Dashboard() {
  const {
    semester,
    subjects,
    assignments,
    goals,
    pomodoroSessions,
    gpa,
    topics,
    exams,
    quizAttempts,
  } = useData();

  const today = todayISO();
  const todaysGoals = goals.filter((g) => g.date === today);
  const progress = todaysGoals.length
    ? Math.round(
        (todaysGoals.filter((g) => g.done).length / todaysGoals.length) * 100,
      )
    : 0;

  // Generate Study Flow recommendations
  const studyFlow = useMemo(() => {
    if (subjects.length === 0) return null;

    const subjectTopics = {};
    const subjectAttempts = {};
    const subjectExams = {};

    subjects.forEach((s) => {
      subjectTopics[s.id] = topics.filter((t) => t.subjectId === s.id);
      subjectAttempts[s.id] = quizAttempts.filter((a) => a.subjectId === s.id);
      subjectExams[s.id] = exams.find((e) => e.subjectId === s.id);
    });

    return generateDailyStudyFlow({
      subjects,
      subjectTopics,
      subjectAttempts,
      subjectExams,
      availableMinutes: 60,
    });
  }, [subjects, topics, exams, quizAttempts]);

  // "Upcoming" = anything not yet graded, soonest due date first.
  const upcoming = useMemo(
    () =>
      [...assignments]
        .filter((a) => a.status !== "graded")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 3),
    [assignments],
  );

  const studyMinutesThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoISO = formatLocalDate(weekAgo);
    return pomodoroSessions
      .filter((s) => s.date >= weekAgoISO)
      .reduce((sum, s) => sum + s.minutes, 0);
  }, [pomodoroSessions]);
  const hours = Math.floor(studyMinutesThisWeek / 60);
  const mins = studyMinutesThisWeek % 60;

  const streak = useMemo(() => calculateStudyStreak(goals), [goals]);
  const subjectName = (id) =>
    subjects.find((s) => s.id === id)?.name || "Deleted subject";

  return (
    <div className="pt-2 max-w-6xl mx-auto">
      <p className="text-lilac-dark dark:text-nightaccent font-medium text-sm flex items-center gap-1.5">
        Welcome back <HiSparkles className="w-4 h-4" />
      </p>

      <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-800 dark:text-white mt-1">
        {semester?.name
          ? `Your ${semester.name.split(" ")[0]} space`
          : "Your study space"}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Stay organized, focused, and one step closer to your goals.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
        <StatCard
          label="Today's Progress"
          value={`${progress}%`}
          sub="Keep going ✨"
          color="lilac"
        />
        <StatCard
          label="Study Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          sub="You're on a roll"
          icon={<HiFire className="w-4 h-4 text-orange-400" />}
          color="pink"
        />
        <StatCard
          label="Assignments"
          value={String(upcoming.length)}
          sub="Upcoming"
          color="cyan"
        />
        <StatCard
          label="Study Time"
          value={`${hours}h ${mins}m`}
          sub="This week"
          color="lilac"
        />
      </div>

      {/* Study Flow Recommendations */}
      {studyFlow && studyFlow.yourFlow.length > 0 && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-nightpurple/30 dark:to-nightblue/30 backdrop-blur p-6 border border-purple-100/50 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-gray-800 dark:text-white">
                  Your Study Flow
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {studyFlow.totalTimeMinutes} minutes • Personalized for you
                </p>
              </div>
            </div>
            <Link
              to="/pomodoro"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
            >
              Start Flow
            </Link>
          </div>

          <div className="space-y-2">
            {studyFlow.yourFlow.map((rec, idx) => {
              const priorityColors = {
                [PRIORITY.CRITICAL]:
                  "from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border-red-200 dark:border-red-800",
                [PRIORITY.HIGH]:
                  "from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-200 dark:border-orange-800",
                [PRIORITY.MEDIUM]:
                  "from-yellow-100 to-green-100 dark:from-yellow-900/30 dark:to-green-900/30 border-yellow-200 dark:border-yellow-800",
                [PRIORITY.LOW]:
                  "from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-green-200 dark:border-green-800",
              };

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${priorityColors[rec.priority]} border flex items-start justify-between`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{rec.status}</span>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {rec.topic.name}
                      </p>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white/40 px-2 py-0.5 rounded-full">
                        {rec.mastery}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {rec.reason}
                    </p>
                  </div>
                  <div className="ml-4 font-semibold text-gray-700 dark:text-gray-300 text-sm flex-shrink-0 whitespace-nowrap">
                    {rec.timeMinutes}m
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white flex items-center gap-1.5">
              Today's Focus{" "}
              <HiSparkles className="w-4 h-4 text-lilac-dark dark:text-nightaccent" />
            </h2>
            <Link
              to="/pomodoro"
              className="text-xs font-medium bg-highlight dark:bg-nightpurple/30 text-lilac-dark dark:text-nightaccent px-3 py-1.5 rounded-full"
            >
              Focus
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Make your next study session count.
          </p>

          {upcoming.length === 0 ? (
            <EmptyState
              title="Nothing due right now"
              description="Add an assignment to see it here."
              actionLabel="Add assignment"
              onAction={() => {}}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((a) => {
                const overdue = isOverdue(a.dueDate, a.status);
                const soon = isDueSoon(a.dueDate, a.status);
                return (
                  <Link
                    to="/assignments"
                    key={a.id}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${
                      overdue
                        ? "bg-rose-50 dark:bg-rose-500/10"
                        : soon
                          ? "bg-babypink/40 dark:bg-nightpurple/20"
                          : "bg-softcyan/30 dark:bg-nightblue/20"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        {subjectName(a.subjectId)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${overdue ? "text-rose-500" : "text-lilac-dark dark:text-nightaccent"}`}
                    >
                      {overdue ? "Overdue" : formatDate(a.dueDate)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
          <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/pomodoro"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-lilac to-lilac-dark text-white font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <HiClock className="w-4 h-4" /> Start Pomodoro
            </Link>
            <Link
              to="/notes"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-babypink/50 dark:bg-nightpurple/20 text-pink-600 dark:text-pink-300 font-medium text-sm hover:-translate-y-0.5 transition-transform"
            >
              <HiPencilSquare className="w-4 h-4" /> Add Note
            </Link>
            <Link
              to="/planner"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-softcyan/40 dark:bg-nightblue/20 text-cyan-700 dark:text-cyan-300 font-medium text-sm hover:-translate-y-0.5 transition-transform"
            >
              <HiCalendarDays className="w-4 h-4" /> Open Planner
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10">
            <Tooltip
              label="Current GPA"
              description="Head to the GPA page to update subject grades."
            >
              <Link to="/gpa" className="block">
                <p className="text-3xl font-display font-bold text-gray-800 dark:text-white">
                  {gpa.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">Current GPA</p>
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>

      <WeeklyAnalytics />

      <div className="mt-6 rounded-3xl bg-gradient-to-r from-highlight to-babypink/40 dark:from-nightpurple/20 dark:to-nightblue/20 p-5 text-center">
        <p className="text-sm italic text-gray-600 dark:text-gray-300">
          "{quoteOfTheDay()}"
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  const dot =
    { lilac: "bg-lilac", pink: "bg-pink-300", cyan: "bg-softcyan" }[color] ||
    "bg-lilac";
  return (
    <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} /> {label}
      </p>
      <p className="text-2xl md:text-3xl font-display font-bold text-gray-800 dark:text-white mt-2">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
        {icon} {sub}
      </p>
    </div>
  );
}
