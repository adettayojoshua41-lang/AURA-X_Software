import { useState } from "react";
import { Navigate } from "react-router-dom";
import { HiSparkles } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import AnimatedBackground from "../components/AnimatedBackground";

export default function SemesterSetup() {
  const { semester, setSemester, loadSampleData } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  if (semester) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give your semester a name.");
    if (!startDate || !endDate)
      return setError("Pick both a start and end date.");
    if (startDate >= endDate)
      return setError("End date must be after the start date.");
    setError("");
    setSemester({ name: name.trim(), startDate, endDate });
    showToast(`${name.trim()} is ready to go.`, { title: "Semester created" });
  };

  const handleSample = () => {
    loadSampleData();
    showToast("Demo subjects, assignments, and analytics are loaded.", {
      title: "Sample data loaded",
    });
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      id="SemesterSetup"
    >
      <AnimatedBackground />
      <div className="animate-pop-in w-full max-w-md rounded-3xl bg-white/90 dark:bg-nightcard/90 backdrop-blur-xl shadow-2xl p-8 border border-white/60 dark:border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <HiSparkles className="w-6 h-6 text-lilac-dark dark:text-nightaccent" />
          <h1 className="font-display font-bold text-2xl text-gray-800 dark:text-white">
            AURA-X
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Let's set up your semester before we organize your academic universe.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Semester name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fall Semester 2026"
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac"
              />
            </div>
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-linear-to-r from-lilac to-babypink text-gray-800 font-display font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Create semester
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
          <span className="text-xs text-gray-400">or</span>
          <span className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
        </div>

        <button
          onClick={handleSample}
          className="w-full py-2.5 rounded-xl border border-lilac/40 dark:border-nightpurple/50 text-lilac-dark dark:text-nightaccent font-medium text-sm hover:bg-highlight dark:hover:bg-nightpurple/20 transition-colors"
        >
          ✨ Load sample data instead
        </button>
      </div>
    </div>
  );
}
