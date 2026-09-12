import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

const FAQ = [
  {
    q: "How is my GPA calculated?",
    a: "GPA = the sum of (grade points × credit hours) for every graded subject, divided by the sum of those credit hours. Set a grade for each subject on the GPA page, and adjust the point scale if your institution uses a different one.",
  },
  {
    q: "How does attendance work?",
    a: "Each subject tracks classes held vs. classes attended. Use 'Present today' or 'Absent today' to log a class quickly, or open 'Manual adjust' to correct the numbers directly. 85%+ shows green, 75–85% shows yellow, and below 75% shows red.",
  },
  {
    q: "How does the Pomodoro timer work?",
    a: "Each focus session runs 25 minutes, followed by a 5-minute break. Completed focus minutes are logged automatically and feed your weekly analytics chart on the Dashboard.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Everything is stored locally in your browser's localStorage. Nothing is sent to a server, so switching browsers or devices starts fresh unless you export/import manually.",
  },
];

const FEATURES = [
  {
    name: "Dashboard",
    desc: "A snapshot of today's progress, streak, upcoming assignments, and weekly analytics.",
  },
  {
    name: "Subjects",
    desc: "Add your courses with credit hours, a teacher, and a color tag.",
  },
  {
    name: "Assignments",
    desc: "Track due dates with automatic overdue and due-soon highlighting.",
  },
  {
    name: "Planner",
    desc: "A calendar view of every assignment and goal, month by month.",
  },
  {
    name: "Pomodoro",
    desc: "A 25/5 focus timer paired with a daily goals checklist.",
  },
  {
    name: "Attendance",
    desc: "Progress rings per subject with color-coded status.",
  },
  { name: "GPA", desc: "An editable grade scale and a live GPA calculation." },
  {
    name: "Notes",
    desc: "Pinned, searchable notes tied to a subject or general study notes.",
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="pt-2 max-w-3xl mx-auto">
      <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">
        Help Center
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
        Everything you need to get the most out of AURA-X.
      </p>

      <section className="mt-6 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
        <h2 className="font-display font-semibold text-gray-800 dark:text-white mb-3">
          Quick start
        </h2>
        <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
          <li>
            Create your semester, or load sample data to explore right away.
          </li>
          <li>Add your subjects with credit hours.</li>
          <li>Log assignments, attendance, and notes as the term goes on.</li>
          <li>
            Check the Dashboard for a daily snapshot and the GPA page for your
            grade average.
          </li>
        </ol>
      </section>

      <section className="mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
        <h2 className="font-display font-semibold text-gray-800 dark:text-white mb-3">
          Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.name}
              className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {f.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10">
        <h2 className="font-display font-semibold text-gray-800 dark:text-white mb-3">
          FAQ
        </h2>
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/10">
          {FAQ.map((item, i) => (
            <div key={item.q} className="py-3">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {item.q}
                </span>
                <HiChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
