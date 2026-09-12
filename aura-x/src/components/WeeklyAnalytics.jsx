import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";
import { useData } from "../context/DataContext";
import { lastNDays, shortDay } from "../utils/dateHelpers";
import { attendancePercent } from "../utils/attendanceCalculator";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Filler);

export default function WeeklyAnalytics() {
  const { assignments, pomodoroSessions, attendance, subjects } = useData();
  const { theme } = useTheme();
  const days = lastNDays(7);
  const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const textColor = theme === "dark" ? "#9CA3AF" : "#9CA3AF";

  const completedPerDay = days.map(
    (d) => assignments.filter((a) => a.dueDate === d && (a.status === "submitted" || a.status === "graded")).length
  );
  const focusPerDay = days.map((d) => pomodoroSessions.find((s) => s.date === d)?.minutes || 0);

  const attendanceBySubject = subjects.map((s) => {
    const rec = attendance.find((a) => a.subjectId === s.id);
    return rec ? attendancePercent(rec.held, rec.attended) : 0;
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } }, beginAtZero: true },
    },
  };

  const hasActivity = completedPerDay.some((v) => v > 0) || focusPerDay.some((v) => v > 0);

  return (
    <div className="grid lg:grid-cols-3 gap-5 mt-6">
      <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
        <p className="text-sm font-display font-semibold text-gray-800 dark:text-white mb-3">Assignments completed</p>
        <div className="h-40">
          <Bar
            data={{
              labels: days.map(shortDay),
              datasets: [{ data: completedPerDay, backgroundColor: "#C8B6FF", borderRadius: 6, maxBarThickness: 22 }],
            }}
            options={commonOptions}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
        <p className="text-sm font-display font-semibold text-gray-800 dark:text-white mb-3">Focus minutes</p>
        <div className="h-40">
          <Line
            data={{
              labels: days.map(shortDay),
              datasets: [
                {
                  data: focusPerDay,
                  borderColor: "#7C6BFF",
                  backgroundColor: "rgba(200,182,255,0.25)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                  pointBackgroundColor: "#7C6BFF",
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
        <p className="text-sm font-display font-semibold text-gray-800 dark:text-white mb-3">Attendance by subject</p>
        {subjects.length === 0 ? (
          <p className="text-xs text-gray-400 h-40 flex items-center justify-center">Add subjects to see this chart.</p>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <Doughnut
              data={{
                labels: subjects.map((s) => s.name),
                datasets: [{ data: attendanceBySubject, backgroundColor: subjects.map((s) => s.color), borderWidth: 0 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        )}
      </div>
      {!hasActivity && (
        <p className="lg:col-span-3 text-xs text-gray-400 text-center -mt-2">
          Charts fill in automatically as you complete assignments and Pomodoro sessions.
        </p>
      )}
    </div>
  );
}
