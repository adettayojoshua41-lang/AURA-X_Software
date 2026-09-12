import { useMemo, useState } from "react";
import { HiPlus, HiTrash, HiOutlineBookmark, HiBookmark, HiMagnifyingGlass } from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/dateHelpers";

const emptyForm = { subjectId: "", title: "", content: "" };

export default function Notes() {
  const { subjects, notes, addNote, updateNote, deleteNote } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || "General";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : notes;
    return [...list].sort((a, b) => (b.pinned - a.pinned) || b.createdAt.localeCompare(a.createdAt));
  }, [notes, query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Give the note a title.");
    addNote({ subjectId: form.subjectId || null, title: form.title.trim(), content: form.content.trim() });
    showToast(`${form.title.trim()} saved.`, { title: "Note added" });
    setForm(emptyForm);
    setError("");
    setShowForm(false);
  };

  return (
    <div className="pt-2 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Everything worth remembering, in one place.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <HiPlus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="relative mt-5 max-w-sm">
        <HiMagnifyingGlass className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="animate-slide-up mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-6 border border-white/60 dark:border-white/10 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Big-O cheat sheet" className="input" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Subject (optional)</span>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input sf-select">
                <option value="">General</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Content</span>
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your note..." className="input resize-none" />
          </label>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-lilac-dark text-white font-medium text-sm">Save note</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={query ? "No notes match your search" : "No notes yet"} description={query ? "Try a different search term." : "Capture your first study note."} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 border border-white/60 dark:border-white/10 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-gray-800 dark:text-white text-sm">{n.title}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => updateNote(n.id, { pinned: !n.pinned })} aria-label="Pin note" className="text-gray-400 hover:text-lilac-dark">
                    {n.pinned ? <HiBookmark className="w-4 h-4 text-lilac-dark dark:text-nightaccent" /> : <HiOutlineBookmark className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteNote(n.id)} aria-label="Delete note" className="text-gray-400 hover:text-rose-500">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{subjectName(n.subjectId)} · {formatDate(n.createdAt)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap line-clamp-6">{n.content || "—"}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`.input { border-radius: 0.75rem; border: 1px solid rgb(229 231 235); padding: 0.6rem 0.9rem; font-size: 0.875rem; background: rgba(255,255,255,0.7); outline: none; width: 100%; margin-top: 0.25rem; }
        .dark .input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; }
        .input:focus { border-color: #C8B6FF; }`}</style>
    </div>
  );
}
