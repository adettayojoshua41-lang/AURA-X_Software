import { useState } from "react";
import { HiPlus, HiTrash, HiPencil, HiBookOpen } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";

const COLORS = ["#7C6BFF", "#FF7EB6", "#33C7C0", "#FFB86B", "#6E9CFF", "#FF6B81"];

const emptyForm = { name: "", code: "", credits: "", teacher: "", color: COLORS[0] };

export default function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject, assignments } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim();
    const credits = Number(form.credits);

    if (!name) return setError("Subject name is required.");
    if (!code) return setError("Subject code is required.");
    if (subjects.some((s) => s.code.toLowerCase() === code.toLowerCase() && s.id !== editingId)) {
      return setError("That subject code already exists.");
    }
    if (!credits || credits <= 0) return setError("Credit hours must be a positive number.");

    if (editingId) {
      updateSubject(editingId, { name, code, credits, teacher: form.teacher.trim(), color: form.color });
      showToast(`${name} updated.`, { title: "Subject updated" });
    } else {
      addSubject({ name, code, credits, teacher: form.teacher.trim(), color: form.color });
      showToast(`${name}`, { title: "Subject added" });
    }
    resetForm();
  };

  const startEdit = (s) => {
    setForm({ name: s.name, code: s.code, credits: String(s.credits), teacher: s.teacher || "", color: s.color });
    setEditingId(s.id);
    setShowForm(true);
    setError("");
  };

  const confirmDelete = () => {
    const s = subjects.find((x) => x.id === pendingDelete);
    deleteSubject(pendingDelete);
    showToast(`${s?.name} and its linked data were removed.`, { title: "Subject deleted" });
    setPendingDelete(null);
  };

  const linkedCount = (id) => assignments.filter((a) => a.subjectId === id).length;

  return (
    <div className="pt-2 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Subjects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Keep track of all your courses.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <HiPlus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="animate-slide-up mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10 grid md:grid-cols-2 gap-4">
          <Field label="Subject name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" className="input" />
          </Field>
          <Field label="Subject code">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS201" className="input" />
          </Field>
          <Field label="Credit hours">
            <input type="number" min="0" step="0.5" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="3" className="input" />
          </Field>
          <Field label="Teacher (optional)">
            <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="Dr. Farah Khan" className="input" />
          </Field>
          <div className="md:col-span-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Color tag</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  style={{ background: c }}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-nightcard scale-110" : ""}`}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>
          {error && <p className="md:col-span-2 text-xs text-rose-500">{error}</p>}
          <div className="md:col-span-2 flex gap-3 mt-1">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-lilac-dark text-white font-medium text-sm">
              {editingId ? "Save changes" : "Add subject"}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {subjects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your journey begins here."
            description="Create your first subject to start tracking assignments, attendance, and grades."
            actionLabel="Add subject"
            onAction={() => setShowForm(true)}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {subjects.map((s) => {
            const total = linkedCount(s.id);
            const done = assignments.filter((a) => a.subjectId === s.id && a.status !== "pending").length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={s.id} className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}22` }}>
                    <HiBookOpen className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(s)} className="p-1.5 text-gray-400 hover:text-lilac-dark" aria-label="Edit subject">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPendingDelete(s.id)} className="p-1.5 text-gray-400 hover:text-rose-500" aria-label="Delete subject">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-gray-800 dark:text-white mt-3">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.code} · {s.credits} credits{s.teacher ? ` · ${s.teacher}` : ""}</p>
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{pct}% · Assignments {total}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this subject?"
        message="This will also remove its linked assignments, attendance records, and notes. This can't be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <style>{`.input { border-radius: 0.75rem; border: 1px solid rgb(229 231 235); padding: 0.6rem 0.9rem; font-size: 0.875rem; background: rgba(255,255,255,0.7); outline: none; width: 100%; margin-top: 0.25rem; }
        .dark .input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; }
        .input:focus { border-color: #C8B6FF; }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}
