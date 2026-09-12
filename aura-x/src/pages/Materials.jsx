import { useMemo, useState } from "react";
import {
  HiArrowPath,
  HiBookOpen,
  HiCheckCircle,
  HiClipboardDocumentList,
  HiSparkles,
} from "react-icons/hi2";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { buildGeminiRequest } from "../utils/gemini";

const emptyMaterial = {
  subject: "",
  source: "",
  summary: "",
  flashcards: [],
  quiz: [],
  createdAt: "",
};

function parseJsonResponse(text, fallback) {
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return JSON.parse(fenced ? fenced[1] : text);
  } catch {
    return fallback;
  }
}

function normalizeMaterial(value) {
  if (!value || typeof value !== "object") return emptyMaterial;
  return {
    subject: typeof value.subject === "string" ? value.subject : "",
    source: typeof value.source === "string" ? value.source : "",
    summary: typeof value.summary === "string" ? value.summary : "",
    flashcards: Array.isArray(value.flashcards)
      ? value.flashcards
          .filter((card) => card && card.question && card.answer)
          .slice(0, 20)
      : [],
    quiz: Array.isArray(value.quiz)
      ? value.quiz
          .filter(
            (item) => item && item.question && Array.isArray(item.options),
          )
          .slice(0, 20)
      : [],
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
  };
}

export default function Materials() {
  const [apiKey] = useLocalStorage("studyflow-ai-gemini-key", "", (value) =>
    typeof value === "string" ? value : "",
  );
  const [savedMaterial, setSavedMaterial] = useLocalStorage(
    "studyflow-ai-materials",
    emptyMaterial,
    normalizeMaterial,
  );
  const [subject, setSubject] = useState(savedMaterial.subject);
  const [source, setSource] = useState(savedMaterial.source);
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const outputReady = Boolean(
    savedMaterial.summary ||
    savedMaterial.flashcards.length ||
    savedMaterial.quiz.length,
  );
  const score = useMemo(
    () =>
      savedMaterial.quiz.reduce(
        (total, item, index) =>
          total + (quizAnswers[index] === item.answer ? 1 : 0),
        0,
      ),
    [savedMaterial.quiz, quizAnswers],
  );

  const generateMaterials = async (event) => {
    event.preventDefault();
    if (!apiKey.trim()) {
      setError("Add your Gemini API key in the AI Assistant page first.");
      return;
    }
    if (source.trim().length < 40) {
      setError("Paste at least a few sentences of study material.");
      return;
    }

    setLoading(true);
    setError("");
    setQuizSubmitted(false);
    setRevealedCards(new Set());
    try {
      const request = buildGeminiRequest({
        apiKey: apiKey.trim(),
        userMessage: `Turn the following ${subject || "study"} material into structured revision resources. Return ONLY valid JSON with this exact shape: {"summary":"...", "flashcards":[{"question":"...","answer":"..."}], "quiz":[{"question":"...", "options":["...","...","...","..."], "answer":"...", "explanation":"..."}]}. Create 8 to 12 flashcards and 8 multiple-choice questions. Keep facts grounded in the source and make the questions useful for exam preparation. Source material:\n${source}`,
        data: {},
      });
      const response = await fetch(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.payload),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          payload?.error?.message || "Gemini rejected the request.",
        );
      const text =
        payload?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .join("\n")
          .trim() || "";
      const parsed = parseJsonResponse(text, null);
      if (
        !parsed?.summary ||
        !Array.isArray(parsed.flashcards) ||
        !Array.isArray(parsed.quiz)
      ) {
        throw new Error(
          "Gemini returned an unexpected format. Try again with clearer notes.",
        );
      }
      setSavedMaterial({
        subject: subject.trim(),
        source: source.trim(),
        summary: parsed.summary,
        flashcards: parsed.flashcards,
        quiz: parsed.quiz,
        createdAt: new Date().toISOString(),
      });
      setActiveTab("summary");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Could not generate study materials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "summary", label: "Summary", icon: HiBookOpen },
    { id: "flashcards", label: "Flashcards", icon: HiSparkles },
    { id: "quiz", label: "Quiz", icon: HiClipboardDocumentList },
  ];

  return (
    <div className="pt-2 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-lilac-dark dark:text-nightaccent">
            Study studio
          </p>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">
            Turn notes into revision tools
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Paste a lesson, chapter, or formula sheet and generate a summary,
            flashcards, and practice quiz.
          </p>
        </div>
        {outputReady && (
          <span className="text-xs text-gray-400">Saved in this browser</span>
        )}
      </div>

      <form
        onSubmit={generateMaterials}
        className="mt-6 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur p-5 md:p-6 border border-white/60 dark:border-white/10"
      >
        <div className="grid md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] gap-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Subject or topic
            </span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Physics: projectile motion"
              className="input"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Your notes or source text
            </span>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              rows={6}
              placeholder="Paste your notes here..."
              className="input resize-y"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-400">
            Your source text is sent to Gemini only when you generate materials.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium text-sm shadow-md disabled:opacity-60"
          >
            {loading ? (
              <HiArrowPath className="w-4 h-4 animate-spin" />
            ) : (
              <HiSparkles className="w-4 h-4" />
            )}
            {loading ? "Generating..." : "Generate materials"}
          </button>
        </div>
      </form>

      {!outputReady ? (
        <div className="mt-8 rounded-3xl border border-dashed border-lilac/50 bg-lilac/10 p-10 text-center">
          <HiBookOpen className="mx-auto w-9 h-9 text-lilac-dark dark:text-nightaccent" />
          <h2 className="mt-3 font-display font-semibold text-gray-800 dark:text-white">
            Your revision pack will appear here
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your Gemini key under AURA-X, then paste some notes above.
          </p>
        </div>
      ) : (
        <section className="mt-8 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 overflow-hidden">
          <div className="flex gap-1 p-2 border-b border-gray-200/70 dark:border-white/10 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${activeTab === id ? "bg-highlight text-lilac-dark dark:bg-nightpurple/30 dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
          <div className="p-5 md:p-7">
            {activeTab === "summary" && (
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                {savedMaterial.summary}
              </div>
            )}
            {activeTab === "flashcards" && (
              <div className="grid md:grid-cols-2 gap-4">
                {savedMaterial.flashcards.map((card, index) => {
                  const revealed = revealedCards.has(index);
                  return (
                    <button
                      type="button"
                      key={`${card.question}-${index}`}
                      onClick={() =>
                        setRevealedCards((current) => {
                          const next = new Set(current);
                          if (next.has(index)) next.delete(index);
                          else next.add(index);
                          return next;
                        })
                      }
                      className="min-h-40 text-left rounded-2xl border border-lilac/30 bg-lilac/10 p-5 hover:border-lilac transition-colors"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-lilac-dark dark:text-nightaccent">
                        Card {index + 1}
                      </span>
                      <p className="mt-3 font-medium text-gray-800 dark:text-white">
                        {card.question}
                      </p>
                      <p
                        className={`mt-4 text-sm text-gray-600 dark:text-gray-300 ${revealed ? "" : "blur-sm select-none"}`}
                      >
                        {card.answer}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
            {activeTab === "quiz" && (
              <div className="space-y-5">
                {savedMaterial.quiz.map((item, index) => (
                  <fieldset
                    key={`${item.question}-${index}`}
                    className="rounded-2xl border border-gray-200/80 dark:border-white/10 p-4"
                  >
                    <legend className="px-1 text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}. {item.question}
                    </legend>
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {item.options.map((option) => (
                        <label
                          key={option}
                          className={`flex items-start gap-2 rounded-xl border p-3 text-sm cursor-pointer ${quizSubmitted && option === item.answer ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10" : "border-gray-200 dark:border-white/10"}`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${index}`}
                            value={option}
                            checked={quizAnswers[index] === option}
                            onChange={() =>
                              setQuizAnswers((current) => ({
                                ...current,
                                [index]: option,
                              }))
                            }
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                    {quizSubmitted && (
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {item.explanation || `Correct answer: ${item.answer}`}
                      </p>
                    )}
                  </fieldset>
                ))}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setQuizSubmitted(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lilac-dark text-white text-sm font-medium"
                  >
                    <HiCheckCircle className="w-4 h-4" /> Check answers
                  </button>
                  {quizSubmitted && (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Score: {score}/{savedMaterial.quiz.length}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <style>{`.input { border-radius: 0.75rem; border: 1px solid rgb(229 231 235); padding: 0.6rem 0.9rem; font-size: 0.875rem; background: rgba(255,255,255,0.7); outline: none; width: 100%; margin-top: 0.25rem; } .dark .input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: white; } .input:focus { border-color: #C8B6FF; }`}</style>
    </div>
  );
}
