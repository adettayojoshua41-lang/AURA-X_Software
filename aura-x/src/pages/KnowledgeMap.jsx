import { useMemo } from "react";
import {
  HiAcademicCap,
  HiSparkles,
  HiChartBar,
  HiArrowUpRight,
  HiArrowDownLeft,
} from "react-icons/hi2";
import { useData } from "../context/DataContext";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import { calculateTopicMastery, getMasteryStatus } from "../utils/studyTwin";

function TopicCard({ subject, topic, masteryPercent, status }) {
  const daysSinceStudy = topic.lastStudied
    ? Math.floor(
        (new Date() - new Date(topic.lastStudied)) / (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div
      className="p-4 rounded-2xl bg-gradient-to-br from-white/80 to-white/50 dark:from-nightcard/60 dark:to-nightcard/40 backdrop-blur border border-white/60 dark:border-white/10 hover:shadow-lg dark:hover:shadow-purple-900/20 transition-shadow"
      style={{
        "--accent-color": subject.color,
        borderLeftWidth: "4px",
        borderLeftColor: subject.color,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">
            {topic.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {topic.description}
          </p>
        </div>
        <div className="text-3xl ml-3 flex-shrink-0">{status}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-2.5 rounded-lg">
          <div className="font-bold text-blue-600 dark:text-blue-400">
            {masteryPercent}%
          </div>
          <div className="text-gray-600 dark:text-gray-400">Mastery</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-2.5 rounded-lg">
          <div className="font-bold text-purple-600 dark:text-purple-400">
            {topic.attempts}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Attempts</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-2.5 rounded-lg">
          <div className="font-bold text-green-600 dark:text-green-400">
            {topic.attempts > 0
              ? Math.round((topic.correct / topic.attempts) * 100)
              : 0}
            %
          </div>
          <div className="text-gray-600 dark:text-gray-400">Correct</div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/40 dark:border-white/10">
        <div className="text-xs">
          {daysSinceStudy !== null && (
            <span
              className={
                daysSinceStudy > 14
                  ? "text-orange-600 dark:text-orange-400 font-medium"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {daysSinceStudy === 0
                ? "Today"
                : daysSinceStudy === 1
                  ? "Yesterday"
                  : `${daysSinceStudy}d ago`}
            </span>
          )}
          {daysSinceStudy === null && (
            <span className="text-gray-400 dark:text-gray-500">
              Never studied
            </span>
          )}
        </div>
        {topic.isWeak && (
          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <HiArrowDownLeft className="w-3 h-3" />
            Weak
          </span>
        )}
        {masteryPercent >= 85 && (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <HiArrowUpRight className="w-3 h-3" />
            Strong
          </span>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeMap() {
  const { subjects, topics: allTopics } = useData();

  // Group topics by subject
  const topicsBySubject = useMemo(() => {
    const grouped = {};
    subjects.forEach((s) => {
      grouped[s.id] = allTopics.filter((t) => t.subjectId === s.id);
    });
    return grouped;
  }, [subjects, allTopics]);

  // Calculate stats per subject
  const subjectStats = useMemo(() => {
    return subjects.map((subject) => {
      const sTopics = topicsBySubject[subject.id] || [];
      const masteries = sTopics.map((t) => calculateTopicMastery(t));
      const avgMastery =
        sTopics.length > 0
          ? masteries.reduce((a, b) => a + b, 0) / sTopics.length
          : 0;
      const weakCount = sTopics.filter(
        (t) => calculateTopicMastery(t) < 0.5,
      ).length;
      const strongCount = sTopics.filter(
        (t) => calculateTopicMastery(t) >= 0.85,
      ).length;

      return {
        subject,
        topics: sTopics,
        avgMastery,
        masteryPercent: Math.round(avgMastery * 100),
        weakCount,
        strongCount,
      };
    });
  }, [subjects, topicsBySubject]);

  if (allTopics.length === 0) {
    return (
      <div className="pt-2 max-w-6xl mx-auto">
        <PageHeader
          icon={<HiAcademicCap className="w-6 h-6" />}
          title="Knowledge Map"
          description="Track your mastery across topics and subjects."
        />
        <div className="text-center py-20">
          <HiAcademicCap className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">No topics yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Add subjects and topics to build your knowledge map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-6xl mx-auto pb-8">
      <PageHeader
        icon={<HiAcademicCap className="w-6 h-6" />}
        title="Knowledge Map"
        description="Your mastery across all topics and subjects. Green = strong, Orange = moderate, Red = weak."
      />

      {/* Overall Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Topics
            </div>
            <HiAcademicCap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {allTopics.length}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Weak Topics
            </div>
            <div className="text-lg">🔴</div>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {allTopics.filter((t) => calculateTopicMastery(t) < 0.5).length}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Strong Topics
            </div>
            <div className="text-lg">🟢</div>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {allTopics.filter((t) => calculateTopicMastery(t) >= 0.85).length}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Mastery
            </div>
            <HiChartBar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {allTopics.length > 0
              ? Math.round(
                  (allTopics.reduce(
                    (sum, t) => sum + calculateTopicMastery(t),
                    0,
                  ) /
                    allTopics.length) *
                    100,
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Per-Subject Knowledge Maps */}
      {subjectStats.map(
        ({
          subject,
          topics: sTopics,
          masteryPercent,
          weakCount,
          strongCount,
        }) => (
          <div key={subject.id} className="mb-10">
            {/* Subject Header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <h2 className="font-display font-bold text-xl md:text-2xl text-gray-800 dark:text-white">
                  {subject.name}
                </h2>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ({subject.code})
                </span>
              </div>

              {/* Subject Stats Bar */}
              <div className="flex gap-3 flex-wrap text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                  <HiSparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-900 dark:text-blue-300">
                    {masteryPercent}% avg
                  </span>
                </div>
                {weakCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-100/50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-lg">🔴</span>
                    <span className="font-semibold text-red-700 dark:text-red-400">
                      {weakCount} weak
                    </span>
                  </div>
                )}
                {strongCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100/50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-lg">🟢</span>
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {strongCount} strong
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Topics Grid */}
            {sTopics.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No topics added yet for {subject.name}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sTopics
                  .sort(
                    (a, b) =>
                      calculateTopicMastery(a) - calculateTopicMastery(b),
                  ) // Sort by mastery (weak first)
                  .map((topic) => {
                    const mastery = calculateTopicMastery(topic);
                    const masteryPercent = Math.round(mastery * 100);
                    const status = getMasteryStatus(mastery);

                    return (
                      <TopicCard
                        key={topic.id}
                        subject={subject}
                        topic={topic}
                        masteryPercent={masteryPercent}
                        status={status}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
