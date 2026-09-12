const TONES = {
  neutral: "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300",
  success: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
  info: "bg-softcyan/50 dark:bg-nightblue/30 text-cyan-700 dark:text-cyan-300",
  warning: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
  danger: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full capitalize ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
