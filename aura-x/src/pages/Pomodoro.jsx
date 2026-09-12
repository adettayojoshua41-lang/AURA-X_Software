import { useCallback, useEffect, useRef, useState } from "react";
import { HiPlay, HiPause, HiArrowPath, HiPlus, HiTrash, HiSparkles } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { todayISO } from "../utils/dateHelpers";

const FOCUS_MIN = 25;
const BREAK_MIN = 5;

export default function Pomodoro() {
  const { goals, addGoal, toggleGoal, deleteGoal, logPomodoroMinutes, pomodoroSessions } = useData();
  const { showToast } = useToast();

  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [goalText, setGoalText] = useState("");

  // Timers are timestamp-based (not a naive per-second decrement) so the
  // countdown stays correct even when the browser throttles setInterval in
  // a backgrounded tab — the visible time is always derived from the clock,
  // not from how many ticks actually fired.
  const endAtRef = useRef(null);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const finishSession = useCallback(() => {
    setRunning(false);
    endAtRef.current = null;
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1800);

    if (modeRef.current === "focus") {
      logPomodoroMinutes(FOCUS_MIN);
      setSessionsToday((n) => n + 1);
      showToast("Focus session complete. Time for a short break.", { title: "Session done" });
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      showToast("Break's over — ready for another round?", { title: "Break done" });
      setMode("focus");
      setSecondsLeft(FOCUS_MIN * 60);
    }
  }, [logPomodoroMinutes, showToast]);

  const tick = useCallback(() => {
    if (!endAtRef.current) return;
    const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining <= 0) finishSession();
  }, [finishSession]);

  useEffect(() => {
    if (!running) return;
    if (!endAtRef.current) endAtRef.current = Date.now() + secondsLeft * 1000;

    const interval = setInterval(tick, 1000);
    // Re-sync immediately when the tab regains visibility/focus, since a
    // throttled background interval can otherwise leave the display stale
    // for a few seconds after switching back.
    const handleVisibility = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tick]);

  const totalSeconds = (mode === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;

  const toggleRunning = () => {
    setRunning((r) => {
      const next = !r;
      endAtRef.current = next ? Date.now() + secondsLeft * 1000 : null;
      return next;
    });
  };

  const resetTimer = () => {
    setRunning(false);
    endAtRef.current = null;
    setMode("focus");
    setSecondsLeft(FOCUS_MIN * 60);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const pct = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  const today = todayISO();
  const todaysGoals = goals.filter((g) => g.date === today);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    addGoal({ text: goalText.trim(), date: today });
    setGoalText("");
  };

  const todayMinutes = pomodoroSessions.find((s) => s.date === today)?.minutes || 0;

  return (
    <div className="pt-2 max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Pomodoro</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">25 minutes of focus, 5 minutes to breathe.</p>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-8 border border-white/60 dark:border-white/10 flex flex-col items-center">
          <p className={`text-xs font-semibold uppercase tracking-widest ${mode === "focus" ? "text-lilac-dark dark:text-nightaccent" : "text-cyan-500"}`}>
            {mode === "focus" ? "Focus session" : "Short break"}
          </p>

          <div className="relative w-56 h-56 my-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-100 dark:text-white/10" />
              <circle
                cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round"
                stroke={mode === "focus" ? "#C8B6FF" : "#BDEFFF"}
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-4xl text-gray-800 dark:text-white tabular-nums">{minutes}:{seconds}</span>
              {celebrate && <HiSparkles className="w-6 h-6 text-lilac-dark dark:text-nightaccent animate-pop-in mt-1" />}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleRunning}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md hover:shadow-lg transition-shadow"
            >
              {running ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
              {running ? "Pause" : "Start"}
            </button>
            <button onClick={resetTimer} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-sm">
              <HiArrowPath className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="flex gap-8 mt-8 text-center">
            <div>
              <p className="font-display font-bold text-xl text-gray-800 dark:text-white">{sessionsToday}</p>
              <p className="text-xs text-gray-400">Sessions today</p>
            </div>
            <div>
              <p className="font-display font-bold text-xl text-gray-800 dark:text-white">{todayMinutes}m</p>
              <p className="text-xs text-gray-400">Focus minutes today</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
          <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-1">Today's Goals</h3>
          <p className="text-xs text-gray-400 mb-4">Small wins add up to a study streak.</p>

          <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
            <input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Add a goal for today"
              className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-lilac-dark text-white" aria-label="Add goal">
              <HiPlus className="w-4 h-4" />
            </button>
          </form>

          {todaysGoals.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No goals yet — add one above.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todaysGoals.map((g) => (
                <div key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5">
                  <input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)} className="w-4 h-4 accent-purple-400" />
                  <span className={`flex-1 text-sm ${g.done ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"}`}>{g.text}</span>
                  <button onClick={() => deleteGoal(g.id)} aria-label="Delete goal" className="text-gray-300 hover:text-rose-500">
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
