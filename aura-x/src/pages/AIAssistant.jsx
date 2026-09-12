import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiArrowPath,
  HiBolt,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiExclamationTriangle,
  HiLockClosed,
  HiPaperAirplane,
  HiPlus,
  HiSparkles,
} from "react-icons/hi2";
import { useData } from "../context/DataContext";
import { useLocalStorage, newId } from "../hooks/useLocalStorage";
import { buildGeminiRequest } from "../utils/gemini";
import AuraCore from "../components/AuraCore";

const QUICK_PROMPTS = [
  "Help me plan my study schedule for this week.",
  "Summarize my upcoming assignments and what I should prioritize first.",
  "Give me a focused revision plan for my toughest subject.",
  "Suggest a healthy study routine based on my workload.",
];

function sanitizeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item.text === "string")
    .map((item) => ({
      id: item.id || newId(),
      role: item.role === "assistant" ? "assistant" : "user",
      text: item.text,
    }));
}

export default function AIAssistant() {
  const { semester, subjects, assignments, notes } = useData();
  const [apiKey, setApiKey] = useLocalStorage(
    "studyflow-ai-gemini-key",
    "",
    (value) => (typeof value === "string" ? value : ""),
  );
  const [messages, setMessages] = useLocalStorage(
    "studyflow-ai-chat-messages",
    [
      {
        id: newId(),
        role: "assistant",
        text: "Hi! I’m AURA-X. I can help you prioritize deadlines, plan revision sessions, and turn your study data into a smarter routine.",
      },
    ],
    sanitizeMessages,
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollTo({
      top: panelRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const upcomingCount = useMemo(
    () => assignments.filter((item) => item.status !== "graded").length,
    [assignments],
  );

  const handleSend = async (promptOverride) => {
    const prompt = (promptOverride ?? input).trim();
    if (!prompt) return;

    if (!apiKey.trim()) {
      setError(
        "Add your Gemini API key in the sidebar to enable live responses.",
      );
      return;
    }

    const nextUserMessage = { id: newId(), role: "user", text: prompt };
    const nextHistory = [...messages, nextUserMessage];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const request = buildGeminiRequest({
        apiKey: apiKey.trim(),
        userMessage: prompt,
        history: nextHistory.map(({ role, text }) => ({ role, text })),
        data: { semester, subjects, assignments, notes },
      });

      const response = await fetch(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.payload),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          payload?.error?.message || "The Gemini API rejected the request.";
        throw new Error(message);
      }

      const reply = payload?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join("\n")
        .trim();

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text:
            reply ||
            "I’m ready to help, but I didn’t get a usable reply from Gemini. Try a different question or check your API setup.",
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while contacting Gemini.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: "I hit a connection issue while contacting the Gemini API. Please verify your key and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mx-5 -mt-2 flex min-h-[calc(100vh-5.5rem)] overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-[0_18px_50px_-35px_rgba(166,140,255,0.8)] backdrop-blur-xl dark:border-white/10 dark:bg-nightcard/30 md:-mx-8">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200/70 bg-white/55 p-3 dark:border-white/10 dark:bg-nightcard/35 lg:flex">
        <button
          type="button"
          onClick={() => setMessages([])}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-highlight dark:text-gray-200 dark:hover:bg-nightpurple/20"
        >
          <HiPlus className="h-4 w-4 text-lilac-dark dark:text-nightaccent" />
          New chat
        </button>
        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Recent
        </p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-highlight px-3 py-2.5 text-left text-sm font-medium text-lilac-dark dark:bg-nightpurple/25 dark:text-white"
        >
          <HiChatBubbleLeftRight className="h-4 w-4 shrink-0" />
          AURA-X session
        </button>
        <div className="mt-auto rounded-2xl border border-lilac/40 bg-lilac/10 p-3 dark:bg-nightpurple/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
            <HiBolt className="h-3.5 w-3.5 text-lilac-dark dark:text-nightaccent" />
            Gemini 2.5 Flash
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            Your study context stays in this browser.
          </p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200/70 px-4 py-3 dark:border-white/10 md:px-7">
          <div className="flex items-center gap-3">
            <AuraCore state={loading ? "thinking" : "idle"} size="sm" />
            <div>
              <h1 className="font-display text-sm font-semibold text-gray-800 dark:text-white">
                AURA-X
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {loading
                  ? "Analyzing your question..."
                  : "Your academic copilot"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowContext((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            aria-expanded={showContext}
          >
            {showContext ? (
              <HiChevronRight className="h-4 w-4" />
            ) : (
              <HiChevronLeft className="h-4 w-4" />
            )}
            Study context
          </button>
        </header>

        <div
          ref={panelRef}
          className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(200,182,255,0.2),_transparent_42%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(110,86,207,0.2),_transparent_38%)] md:px-10"
        >
          <div className="mx-auto max-w-3xl space-y-7">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && <AuraCore state="responding" size="sm" />}
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap text-sm leading-7 ${isUser ? "rounded-2xl rounded-br-md bg-gradient-to-r from-lilac to-lilac-dark px-4 py-3 text-white shadow-md" : "pt-1 text-gray-700 dark:text-gray-200"}`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
                <AuraCore state="thinking" size="sm" />
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lilac-dark" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lilac-dark [animation-delay:0.15s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lilac-dark [animation-delay:0.3s]" />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200/70 bg-white/45 px-4 pb-4 pt-3 dark:border-white/10 dark:bg-nightcard/25 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="shrink-0 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-lilac-dark hover:text-lilac-dark dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white/85 p-2 shadow-sm dark:border-white/10 dark:bg-nightcard/80">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                aria-label="Ask AURA-X"
                placeholder="Message AURA-X..."
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-lilac to-lilac-dark text-white shadow-md transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <HiPaperAirplane className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                <HiExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <p className="mt-2 text-center text-[10px] text-gray-400 dark:text-gray-500">
              AURA-X can make mistakes. Check important academic details.
            </p>
          </div>
        </div>
      </section>

      {showContext && (
        <aside className="absolute right-0 top-0 z-10 h-full w-[min(21rem,calc(100%-1rem))] overflow-y-auto border-l border-gray-200/70 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-nightcard/95 md:relative md:top-auto md:w-80 md:shadow-none">
          <div className="rounded-[28px] bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-highlight dark:bg-nightpurple/20 p-2 text-lilac-dark dark:text-nightaccent">
                  <HiLockClosed className="w-4 h-4" />
                </div>
                <h2 className="font-display font-semibold text-gray-800 dark:text-white">
                  API key
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKey((value) => !value)}
                className="text-xs font-medium text-lilac-dark dark:text-nightaccent"
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Connect your own free Gemini API key. The key is stored locally in
              this browser and used only for your AURA-X requests.
            </p>

            <label className="mt-4 block">
              <span className="sr-only">Gemini API key</span>
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your Gemini API key"
                className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-nightcard/80 px-3 py-2.5 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-lilac-dark outline-none"
              />
            </label>

            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Official Google Gemini API
              </span>
              <button
                type="button"
                onClick={() => setApiKey("")}
                className="font-medium text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-[28px] bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-softcyan/60 dark:bg-nightblue/20 p-2 text-cyan-700 dark:text-cyan-300">
                <HiArrowPath className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-gray-800 dark:text-white">
                Study snapshot
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Semester
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {semester?.name || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Subjects
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {subjects.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Upcoming work
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {upcomingCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Notes
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {notes.length}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-r from-lilac/25 to-babypink/30 dark:from-nightpurple/25 dark:to-nightblue/20 border border-white/60 dark:border-white/10 p-5">
            <div className="flex items-center gap-2 text-gray-800 dark:text-white">
              <HiSparkles className="w-4 h-4 text-lilac-dark dark:text-nightaccent" />
              <h2 className="font-display font-semibold">How to use it</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Ask for a revision roadmap.</li>
              <li>Review assignment priorities.</li>
              <li>Turn your workload into a realistic weekly plan.</li>
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
