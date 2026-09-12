import { useId } from "react";

const fieldClass =
  "sf-input mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:border-lilac transition-colors";

function Label({ id, children }) {
  if (!children) return null;
  return (
    <label htmlFor={id} className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export function Input({ label, className = "", ...props }) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <Label id={id}>{label}</Label>
      <input id={id} className={`${fieldClass} ${className}`} {...props} />
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <Label id={id}>{label}</Label>
      <textarea id={id} className={`${fieldClass} resize-none ${className}`} {...props} />
    </label>
  );
}

/**
 * Native <select>. Dark-mode option contrast is handled globally via
 * `color-scheme` + the `.sf-select` rules in index.css, so no per-field
 * inline styling is needed here.
 */
export function Select({ label, className = "", children, ...props }) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <Label id={id}>{label}</Label>
      <select id={id} className={`sf-select ${fieldClass} ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
}
