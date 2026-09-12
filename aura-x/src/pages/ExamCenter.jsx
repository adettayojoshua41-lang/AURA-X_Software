import { useMemo, useState } from "react";
import {
  HiCalendarDays,
  HiXMark,
  HiCheck,
  HiExclamationTriangle,
} from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import { addDays, todayISO } from "../utils/dateHelpers";
import {
  calculateTopicMastery,
  calculateExamReadiness,
  getWeakTopics,
  getMasteryStatus,
} from "../utils/studyTwin";
import { createExam } from "../utils/studyTwin";

const emptyForm = { subjectId: "", examDate: addDays(todayISO(), 14) };

export default function ExamCenter() {
  const { subjects, topics: allTopics, exams, addExam, deleteExam } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Group topics by subject
  const topicsBySubject = useMemo(() => {
    const grouped = {};
    subjects.forEach((s) => {
      grouped[s.id] = allTopics.filter((t) => t.subjectId === s.id);
    });
    return grouped;
  }, [subjects, allTopics]);

  // Calculate readiness for each exam
  const examsWithReadiness = useMemo(() => {
    return exams.map((exam) => {
      const subject = subjects.find((s) => s.id === exam.subjectId);
      const examTopics = topicsBySubject[exam.subjectId] || [];
      const readiness = calculateExamReadiness(examTopics);
      const daysUntil = Math.ceil(
        (new Date(exam.examDate) - new Date()) / (1000 * 60 * 60 * 24),
      );

      return {
        exam,
        subject,
        readiness: Math.round(readiness * 100),
        topics: examTopics,
        weakCount: getWeakTopics(examTopics).length,
        daysUntil,
      };
    });
  }, [exams, subjects, topicsBySubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.subjectId.trim()) {
      setError("Select a subject.");
      return;
    }

    if (!form.examDate) {
      setError("Enter an exam date.");
      return;
    }

    const examDate = new Date(form.examDate);
    if (examDate < new Date()) {
      setError("Exam date cannot be in the past.");
      return;
    }

    const exam = createExam(form.subjectId, form.examDate, []);
    addExam(exam);
    showToast(
      `Exam added for ${subjects.find((s) => s.id === form.subjectId)?.name}`,
    );
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleDelete = (examId) => {
    deleteExam(examId);
    showToast("Exam removed");
  };

  const getReadinessColor = (readiness) => {
    if (readiness >= 80)
      return "text-green-600 dark:text-green-400 bg-green-100/30 dark:bg-green-900/20";
    if (readiness >= 60)
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100/30 dark:bg-yellow-900/20";
    return "text-red-600 dark:text-red-400 bg-red-100/30 dark:bg-red-900/20";
  };

  if (subjects.length === 0) {
    return (
      <div className="pt-2 max-w-6xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">
          Exam Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your exam readiness and preparation progress.
        </p>
        <div className="text-center py-20">
          <HiCalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No subjects yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Add subjects to start tracking exams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-6xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">
            Exam Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track your exam readiness and preparation progress.
          </p>
        </div>
        {examsWithReadiness.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-full bg-purple-500 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            + Add Exam
          </button>
        )}
      </div>

      {/* Add Exam Form */}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                Add Exam
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              >
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
              >
                Add Exam
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {examsWithReadiness.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HiCalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No exams scheduled yet
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-full bg-purple-500 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              + Schedule an Exam
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {examsWithReadiness.map(
            ({ exam, subject, readiness, topics, weakCount, daysUntil }) => (
              <div
                key={exam.id}
                className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-gray-800 dark:text-white">
                          {subject?.name}
                        </h3>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {subject?.code}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {daysUntil <= 0
                        ? "Exam is today!"
                        : `in ${daysUntil} days • ${new Date(exam.examDate).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl font-bold text-lg ${getReadinessColor(readiness)}`}
                    >
                      {readiness}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Estimated Readiness
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        readiness >= 80
                          ? "from-green-400 to-green-500"
                          : readiness >= 60
                            ? "from-yellow-400 to-yellow-500"
                            : "from-red-400 to-red-500"
                      }`}
                      style={{ width: `${readiness}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      {topics.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Topics
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                      {
                        topics.filter((t) => calculateTopicMastery(t) >= 0.85)
                          .length
                      }
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Strong
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${weakCount > 0 ? "bg-red-100/50 dark:bg-red-900/20" : "bg-green-100/50 dark:bg-green-900/20"}`}
                  >
                    <div
                      className={`text-sm font-semibold ${weakCount > 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}
                    >
                      {weakCount}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Weak Topics
                    </div>
                  </div>
                </div>

                {/* Topics Grid (if there are weak topics) */}
                {weakCount > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <HiExclamationTriangle className="w-4 h-4 text-red-500" />
                      Focus on these weak topics:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getWeakTopics(topics)
                        .slice(0, 4)
                        .map((topic) => (
                          <div
                            key={topic.id}
                            className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100/50 dark:border-red-900/30"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                  {topic.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.round(
                                    calculateTopicMastery(topic) * 100,
                                  )}
                                  % mastery
                                </p>
                              </div>
                              <span className="ml-2 text-lg">
                                {getMasteryStatus(calculateTopicMastery(topic))}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {readiness >= 80 && (
                  <div className="mt-4 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100/50 dark:border-green-900/30 flex items-center gap-2">
                    <HiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      You're well-prepared for this exam!
                    </span>
                  </div>
                )}
              </div>
            ),
          )}

          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-3xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
          >
            + Add Another Exam
          </button>
        </div>
      )}
    </div>
  );
}
