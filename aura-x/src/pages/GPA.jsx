import { useState } from "react";
import { useData } from "../context/DataContext";
import { gpaLabel } from "../utils/gpaCalculator";
import EmptyState from "../components/EmptyState";

export default function GPA() {
  const { subjects, updateSubject, gradeScale, setGradeScale, gpa } = useData();
  const [editingScale, setEditingScale] = useState(false);

  const circumference = 2 * Math.PI * 70;
  const pct = Math.min(gpa / 4, 1);

  const handleScaleChange = (letter, points) => {
    setGradeScale((scale) => scale.map((g) => (g.letter === letter ? { ...g, points: Number(points) } : g)));
  };

  if (subjects.length === 0) {
    return (
      <div className="pt-2 max-w-4xl mx-auto">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">GPA</h1>
        <div className="mt-6">
          <EmptyState title="Add a subject to calculate your GPA" description="Once you have subjects with credit hours, set a grade for each to see your GPA here." />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 max-w-4xl mx-auto">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">GPA</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)</p>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-8 border border-white/60 dark:border-white/10 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-white/10" />
              <circle
                cx="80" cy="80" r="70" fill="none" strokeWidth="12" strokeLinecap="round"
                stroke="url(#gpaGradient)"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct)}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C8B6FF" />
                  <stop offset="100%" stopColor="#FF9FD1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-4xl text-gray-800 dark:text-white">{gpa.toFixed(2)}</span>
              <span className="text-xs text-lilac-dark dark:text-nightaccent font-medium mt-1">{gpaLabel(gpa)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
          <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-4">Subject grades</h3>
          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.credits} credits</p>
                </div>
                <select
                  value={s.grade || ""}
                  onChange={(e) => updateSubject(s.id, { grade: e.target.value })}
                  className="sf-select rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-1.5 text-sm text-gray-700 dark:text-white outline-none"
                >
                  <option value="">Not graded</option>
                  {gradeScale.map((g) => <option key={g.letter} value={g.letter}>{g.letter}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-gray-800 dark:text-white">Grade point scale</h3>
          <button onClick={() => setEditingScale((v) => !v)} className="text-xs font-medium text-lilac-dark dark:text-nightaccent">
            {editingScale ? "Done" : "Edit scale"}
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
          {gradeScale.map((g) => (
            <div key={g.letter} className="text-center">
              <p className="text-xs text-gray-400 mb-1">{g.letter}</p>
              {editingScale ? (
                <input
                  type="number" step="0.1" min="0" max="4"
                  value={g.points}
                  onChange={(e) => handleScaleChange(g.letter, e.target.value)}
                  className="w-full text-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 py-1 text-sm text-gray-800 dark:text-white outline-none"
                />
              ) : (
                <p className="font-display font-semibold text-gray-800 dark:text-white">{g.points.toFixed(1)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
