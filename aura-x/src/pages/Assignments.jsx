import { useState } from "react";
import { HiPlus, HiTrash, HiCheckCircle } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import { formatDate, isOverdue, isDueSoon } from "../utils/dateHelpers";

const emptyForm = { subjectId: "", title: "", dueDate: "", status: "pending" };

export default function Assignments() {
  const { subjects, assignments, addAssignment, updateAssignment, deleteAssignment, semester } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subjectId) return setError("Choose a subject.");
    if (!form.title.trim()) return setError("Give the assignment a title.");
    if (!form.dueDate) return setError("Pick a due date.");
    if (semester?.startDate && form.dueDate < semester.startDate) {
      return setError("Due date can't be before the semester start date.");
    }
    addAssignment({ subjectId: form.subjectId, title: form.title.trim(), dueDate: form.dueDate, status: form.status, grade: "" });
    showToast(`${form.title.trim()} added.`, { title: "Assignment added" });
    setForm(emptyForm);
    setError("");
    setShowForm(false);
  };

  const sorted = [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const filtered = sorted.filter((a) => (filter === "all" ? true : a.status === filter));
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || "—";

  const cycleStatus = (a) => {
    const next = a.status === "pending" ? "submitted" : a.status === "submitted" ? "graded" : "pending";
    updateAssignment(a.id, { status: next });
  };

  return (
    <div className="pt-2 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Assignments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Never miss a deadline again.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          disabled={subjects.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HiPlus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {subjects.length === 0 && (
        <p className="text-xs text-amber-500 mt-3">Add a subject first before creating assignments.</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="animate-slide-up mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10 grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Subject</span>
            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input sf-select">
              <option value="">Select a subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Binary Tree Assignment" className="input" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Due date</span>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input sf-select">
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </label>
          {error && <p className="md:col-span-2 text-xs text-rose-500">{error}</p>}
          <div className="md:col-span-2 flex gap-3 mt-1">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-lilac-dark text-white font-medium text-sm">Add assignment</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mt-6 flex-wrap">
        {["all", "pending", "submitted", "graded"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? "bg-lilac-dark text-white" : "bg-white/70 dark:bg-nightcard/60 text-gray-500 dark:text-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No assignments here" description="Assignments you add will show up sorted by due date." />
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-5">
          {filtered.map((a) => {
            const overdue = isOverdue(a.dueDate, a.status);
            const soon = isDueSoon(a.dueDate, a.status);
            return (
              <div
                key={a.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-colors ${
                  overdue
                    ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
                    : soon
                    ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20"
                    : "bg-white/70 dark:bg-nightcard/60 border-white/60 dark:border-white/10"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{subjectName(a.subjectId)} · Due {formatDate(a.dueDate)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => cycleStatus(a)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full capitalize ${
                      a.status === "graded"
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                        : a.status === "submitted"
                        ? "bg-softcyan/50 dark:bg-nightblue/30 text-cyan-700 dark:text-cyan-300"
                        : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    <HiCheckCircle className="w-3.5 h-3.5" /> {a.status}
                  </button>
                  <button onClick={() => deleteAssignment(a.id)} aria-label="Delete assignment" className="text-gray-400 hover:text-rose-500">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`.input { border-radius: 0.75rem; border: 1px solid rgb(229 231 235); padding: 0.6rem 0.9rem; font-size: 0.875rem; background: rgba(255,255,255,0.7); outline: none; width: 100%; margin-top: 0.25rem; }
        .dark .input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; }
        .input:focus { border-color: #C8B6FF; }`}</style>
    </div>
  );
}
