import { HiMoon } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";
import Modal from "./ui/Modal";

export default function ThemePromptModal() {
  const { showThemePrompt, dismissThemePrompt } = useTheme();

  return (
    <Modal
      open={showThemePrompt}
      onClose={() => dismissThemePrompt(false)}
      labelledBy="theme-prompt-title"
      className="animate-pop-in w-full max-w-sm rounded-3xl bg-white dark:bg-nightcard shadow-2xl p-7 text-center border border-white/60 dark:border-white/10"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nightpurple to-nightblue flex items-center justify-center mx-auto mb-4">
        <HiMoon className="w-7 h-7 text-nightaccent" />
      </div>
      <h3 id="theme-prompt-title" className="font-display font-semibold text-lg text-gray-800 dark:text-white">
        ✨ Welcome!
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed">
        Would you like to experience Dark Mode tonight?
      </p>
      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={() => dismissThemePrompt(true)}
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-nightpurple to-nightblue text-white font-medium text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          Try Dark Mode
        </button>
        <button
          onClick={() => dismissThemePrompt(false)}
          className="w-full px-4 py-2.5 rounded-xl text-gray-500 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
