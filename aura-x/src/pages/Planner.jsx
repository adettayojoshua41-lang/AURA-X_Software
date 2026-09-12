import { useMemo, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { formatDate, formatLocalDate, todayISO } from "../utils/dateHelpers";

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(formatLocalDate(new Date(year, month, d)));
  }
  return cells;
}

export default function Planner() {
  const { assignments, goals, subjects } = useData();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(null);

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = todayISO();

  const eventsFor = (iso) => ({
    assignments: assignments.filter((a) => a.dueDate === iso),
    goals: goals.filter((g) => g.date === iso),
  });

  const changeMonth = (delta) => {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelected(null);
  };

  const selectedEvents = selected ? eventsFor(selected) : null;
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || "—";

  return (
    <div className="pt-2 max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Planner</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">A calendar view of everything on your plate.</p>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-highlight dark:hover:bg-nightpurple/20" aria-label="Previous month">
              <HiChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
            <h2 className="font-display font-semibold text-gray-800 dark:text-white">{monthLabel}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-highlight dark:hover:bg-nightpurple/20" aria-label="Next month">
              <HiChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((iso, i) => {
              if (!iso) return <div key={i} />;
              const ev = eventsFor(iso);
              const hasEvents = ev.assignments.length > 0 || ev.goals.length > 0;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative transition-colors ${
                    selected === iso
                      ? "bg-lilac-dark text-white"
                      : isToday
                      ? "bg-highlight dark:bg-nightpurple/30 text-lilac-dark dark:text-nightaccent font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {Number(iso.slice(-2))}
                  {hasEvents && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${selected === iso ? "bg-white" : "bg-pink-400 animate-twinkle"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
          <h3 className="font-display font-semibold text-gray-800 dark:text-white">
            {selected ? formatDate(selected) : "Pick a date"}
          </h3>
          {!selected && <p className="text-sm text-gray-400 mt-2">Tap a glowing day to see what's due.</p>}
          {selected && selectedEvents.assignments.length === 0 && selectedEvents.goals.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">Nothing scheduled for this day.</p>
          )}
          {selected && selectedEvents.assignments.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Assignments</p>
              <div className="flex flex-col gap-2">
                {selectedEvents.assignments.map((a) => (
                  <div key={a.id} className="px-3 py-2 rounded-xl bg-babypink/30 dark:bg-nightpurple/20 text-sm">
                    <p className="text-gray-800 dark:text-white font-medium">{a.title}</p>
                    <p className="text-xs text-gray-400">{subjectName(a.subjectId)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selected && selectedEvents.goals.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Goals</p>
              <div className="flex flex-col gap-2">
                {selectedEvents.goals.map((g) => (
                  <div key={g.id} className="px-3 py-2 rounded-xl bg-softcyan/30 dark:bg-nightblue/20 text-sm text-gray-700 dark:text-gray-200">
                    {g.done ? "✅ " : "⬜ "}{g.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
