import { useState } from "react";

export default function Tooltip({ label, description, children }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="animate-pop-in absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-52 rounded-xl bg-white/95 dark:bg-nightcard/95 border border-highlight dark:border-white/10 shadow-lg px-3 py-2 text-left backdrop-blur"
        >
          <span className="block text-xs font-semibold font-display text-gray-800 dark:text-white">{label}</span>
          {description && (
            <span className="block text-[11px] text-gray-500 dark:text-gray-300 mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
