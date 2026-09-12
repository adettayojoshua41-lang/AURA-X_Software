import { HiSparkles } from "react-icons/hi2";

export default function EmptyState({ title = "Your journey begins here.", description, actionLabel, onAction }) {
  return (
    <div className="animate-slide-up flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-dashed border-lilac/50 dark:border-nightpurple/40 bg-white/60 dark:bg-nightcard/50 backdrop-blur">
      <div className="w-14 h-14 rounded-2xl bg-highlight dark:bg-nightpurple/30 flex items-center justify-center mb-4">
        <HiSparkles className="w-7 h-7 text-lilac-dark dark:text-nightaccent" />
      </div>
      <h3 className="font-display font-semibold text-lg text-gray-800 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lilac to-babypink text-gray-800 font-medium font-display text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
