import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMagnifyingGlass,
  HiHome,
  HiBookOpen,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiClock,
  HiChartBar,
  HiAcademicCap,
  HiDocumentText,
  HiCog6Tooth,
  HiQuestionMarkCircle,
  HiSparkles,
} from "react-icons/hi2";

const PAGES = [
  { label: "Dashboard", path: "/", icon: HiHome },
  { label: "Subjects", path: "/subjects", icon: HiBookOpen },
  { label: "Assignments", path: "/assignments", icon: HiClipboardDocumentList },
  { label: "Planner", path: "/planner", icon: HiCalendarDays },
  { label: "Pomodoro", path: "/pomodoro", icon: HiClock },
  { label: "Attendance", path: "/attendance", icon: HiChartBar },
  { label: "GPA", path: "/gpa", icon: HiAcademicCap },
  { label: "Notes", path: "/notes", icon: HiDocumentText },
  { label: "AURA-X", path: "/assistant", icon: HiSparkles },
  { label: "Help", path: "/help", icon: HiQuestionMarkCircle },
  { label: "Settings", path: "/settings", icon: HiCog6Tooth },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const navigate = useNavigate();

  const results = useMemo(
    () =>
      PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  // Reset the search + selection whenever the palette transitions from
  // closed to open. This adjusts state during render (React's documented
  // pattern for "resetting state when a prop changes") instead of doing it
  // in an Effect, which would cause an extra render pass for no benefit.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(0);
  };

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].path);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center pt-24 px-4 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-lg rounded-2xl bg-white dark:bg-nightcard shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10">
          <HiMagnifyingGlass className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search pages... (Subjects, Pomodoro, Settings)"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline text-[10px] font-medium text-gray-400 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No matching page.
            </p>
          )}
          {results.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={p.path}
                onClick={() => go(p.path)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-highlight dark:bg-nightpurple/30 text-gray-800 dark:text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
