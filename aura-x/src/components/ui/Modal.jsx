import { useEffect, useRef } from "react";

/**
 * Shared modal shell used by ConfirmDialog, ThemePromptModal, and CommandPalette.
 * Handles the a11y plumbing every dialog needs once, instead of each dialog
 * re-implementing Escape-to-close, backdrop click, and focus return.
 */
export default function Modal({ open, onClose, labelledBy, children, align = "center", className = "" }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;

    const focusable = panelRef.current?.querySelector(
      'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] flex px-4 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm ${
        align === "top" ? "items-start justify-center pt-24" : "items-center justify-center"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={className}>
        {children}
      </div>
    </div>
  );
}
