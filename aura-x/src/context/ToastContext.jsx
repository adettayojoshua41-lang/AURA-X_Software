import { createContext, useCallback, useContext, useState } from "react";
import { newId } from "../hooks/useLocalStorage";
import { HiSparkles, HiCheckCircle, HiXCircle, HiXMark } from "react-icons/hi2";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { title = "Success", type = "success" } = {}) => {
      const id = newId();
      setToasts((list) => [...list, { id, message, title, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-[calc(100%-2.5rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop-in flex items-start gap-3 rounded-2xl border border-white/60 bg-white/90 dark:bg-nightcard/95 dark:border-white/10 backdrop-blur px-4 py-3 shadow-[0_10px_30px_-8px_rgba(140,110,255,0.35)]"
          >
            <span className="mt-0.5 text-lilac-dark dark:text-nightaccent">
              {t.type === "error" ? (
                <HiXCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <HiCheckCircle className="w-5 h-5" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-display text-gray-800 dark:text-white flex items-center gap-1">
                <HiSparkles className="w-3.5 h-3.5 text-lilac-dark dark:text-nightaccent" /> {t.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 break-words">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white shrink-0"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally co-located with its provider
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
