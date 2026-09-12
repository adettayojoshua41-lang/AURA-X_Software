import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import { HiPlus, HiMinus } from "react-icons/hi2";
import { attendancePercent, attendanceStatus } from "../utils/attendanceCalculator";

function ringColor(pct) {
  if (pct >= 85) return "#34D399";
  if (pct >= 75) return "#FBBF24";
  return "#FB7185";
}

export default function Attendance() {
  const { subjects, getAttendanceFor, markAttendance, adjustAttendance } = useData();
  const { showToast } = useToast();

  if (subjects.length === 0) {
    return (
      <div className="pt-2 max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Attendance</h1>
        <div className="mt-6">
          <EmptyState title="No subjects to track yet" description="Add a subject first, then log your attendance here." />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Attendance</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">85%+ keeps you safely clear of most policies.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {subjects.map((s) => {
          const rec = getAttendanceFor(s.id);
          const pct = attendancePercent(rec.held, rec.attended);
          const color = ringColor(pct);
          const circumference = 2 * Math.PI * 40;
          return (
            <div key={s.id} className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="9" className="text-gray-100 dark:text-white/10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" strokeWidth="9" strokeLinecap="round"
                      stroke={color}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - pct / 100)}
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-bold text-lg text-gray-800 dark:text-white">{pct}%</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-gray-800 dark:text-white truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{rec.attended}/{rec.held} classes</p>
                  <p className="text-xs font-medium mt-1" style={{ color }}>{attendanceStatus(pct)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { markAttendance(s.id, true); showToast(`${s.name}`, { title: "Marked present" }); }}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-xs font-medium"
                >
                  Present today
                </button>
                <button
                  onClick={() => markAttendance(s.id, false)}
                  className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-300 text-xs font-medium"
                >
                  Absent today
                </button>
              </div>

              <details className="mt-3">
                <summary className="text-xs text-gray-400 cursor-pointer select-none">Manual adjust</summary>
                <div className="flex items-center justify-between gap-4 mt-2 text-xs text-gray-500 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    Held
                    <button onClick={() => adjustAttendance(s.id, "held", -1)} className="p-1 rounded bg-gray-100 dark:bg-white/10"><HiMinus className="w-3 h-3" /></button>
                    <button onClick={() => adjustAttendance(s.id, "held", 1)} className="p-1 rounded bg-gray-100 dark:bg-white/10"><HiPlus className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    Attended
                    <button onClick={() => adjustAttendance(s.id, "attended", -1)} className="p-1 rounded bg-gray-100 dark:bg-white/10"><HiMinus className="w-3 h-3" /></button>
                    <button onClick={() => adjustAttendance(s.id, "attended", 1)} className="p-1 rounded bg-gray-100 dark:bg-white/10"><HiPlus className="w-3 h-3" /></button>
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
