import { HiMoon, HiSun } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className={`relative w-16 h-8 rounded-full flex items-center px-1 transition-colors duration-500 shrink-0 ${
        isDark ? "bg-nightpurple" : "bg-highlight"
      }`}
    >
      <HiSun className={`w-4 h-4 absolute left-1.5 transition-opacity duration-300 ${isDark ? "opacity-30 text-white" : "opacity-100 text-amber-400"}`} />
      <HiMoon className={`w-4 h-4 absolute right-1.5 transition-opacity duration-300 ${isDark ? "opacity-100 text-nightaccent" : "opacity-30 text-gray-400"}`} />
      <span
        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}
