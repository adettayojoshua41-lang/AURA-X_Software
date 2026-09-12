const VARIANTS = {
  primary:
    "bg-gradient-to-r from-lilac to-babypink text-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5",
  dark: "bg-lilac-dark text-white hover:bg-lilac-dark/90",
  secondary:
    "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  ghost: "text-lilac-dark dark:text-nightaccent hover:bg-highlight dark:hover:bg-nightpurple/20",
};

/** Consistent button styling across the whole app (replaces one-off button classes per page). */
export default function Button({ variant = "primary", className = "", disabled, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
