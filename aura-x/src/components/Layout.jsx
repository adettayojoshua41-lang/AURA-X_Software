import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { HiBars3, HiSparkles } from "react-icons/hi2";
import Sidebar from "./Sidebar";
import AnimatedBackground from "./AnimatedBackground";
import ThemeToggle from "./ThemeToggle";
import ThemePromptModal from "./ThemePromptModal";
import CommandPalette from "./CommandPalette";
import AnimatedPage from "./AnimatedPage";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { onStorageError } from "../utils/storageEvents";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage("sidebarCollapsed", false);
  const { semester } = useData();
  const { showToast } = useToast();
  const location = useLocation();

  // Global Ctrl/Cmd+K for the command palette.
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Surface storage write failures (e.g. quota exceeded) as a toast instead
  // of failing silently — the user should know a change may not have saved.
  useEffect(() => {
    return onStorageError(({ quotaExceeded }) => {
      showToast(
        quotaExceeded
          ? "Your browser's storage is full, so this change may not be saved. Try exporting and clearing old data in Settings."
          : "A change couldn't be saved to this browser. Your session will keep working, but please export a backup from Settings.",
        { title: "Save failed", type: "error" },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the mobile drawer whenever the route changes. Adjusted during
  // render (comparing to the previous render's pathname) rather than in an
  // Effect, per React's guidance for resetting state when a value changes.
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next === 7) {
      setEasterEgg(true);
      showToast("Magic unlocked. Keep studying. ✨", { title: "Easter egg" });
      setTimeout(() => setEasterEgg(false), 2200);
      setLogoClicks(0);
    }
  };

  if (!semester) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AnimatedBackground />

      <div className="hidden md:block h-full">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onLogoClick={handleLogoClick}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex" role="presentation">
          <Sidebar
            forceExpanded
            onClose={() => setMobileOpen(false)}
            onLogoClick={handleLogoClick}
          />
          <div
            className="flex-1 bg-gray-900/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 md:px-8 py-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl bg-white/80 dark:bg-nightcard/80 shadow-sm"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <HiBars3 className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          </button>
          <div className="hidden md:block" />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto px-5 md:px-8 pb-10">
          <AnimatedPage key={location.pathname}>
            <Outlet />
          </AnimatedPage>
        </main>
      </div>

      <ThemePromptModal />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {easterEgg && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center pointer-events-none">
          <div className="animate-pop-in bg-white/95 dark:bg-nightcard/95 rounded-3xl px-10 py-8 shadow-2xl text-center backdrop-blur">
            <HiSparkles className="w-10 h-10 text-lilac-dark dark:text-nightaccent mx-auto mb-2" />
            <p className="font-display font-bold text-xl text-gray-800 dark:text-white">
              Magic unlocked.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Keep studying. ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
