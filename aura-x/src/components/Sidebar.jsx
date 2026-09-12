import { NavLink } from "react-router-dom";
import {
  HiSparkles,
  HiHome,
  HiBookOpen,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiClock,
  HiChartBar,
  HiAcademicCap,
  HiDocumentText,
  HiRectangleStack,
  HiCog6Tooth,
  HiQuestionMarkCircle,
  HiUserCircle,
  HiXMark,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi2";
import Tooltip from "./Tooltip";
import { useData } from "../context/DataContext";

const WORKSPACE = [
  { label: "Dashboard", path: "/", icon: HiHome, end: true },
  { label: "Subjects", path: "/subjects", icon: HiBookOpen },
  { label: "Assignments", path: "/assignments", icon: HiClipboardDocumentList },
  { label: "Planner", path: "/planner", icon: HiCalendarDays },
  { label: "Pomodoro", path: "/pomodoro", icon: HiClock },
];

const PROGRESS = [
  { label: "Attendance", path: "/attendance", icon: HiChartBar },
  { label: "GPA", path: "/gpa", icon: HiAcademicCap },
  { label: "Knowledge Map", path: "/knowledge-map", icon: HiAcademicCap },
  { label: "Exam Center", path: "/exam-center", icon: HiCalendarDays },
  { label: "Notes", path: "/notes", icon: HiDocumentText },
  { label: "Materials", path: "/materials", icon: HiRectangleStack },
  { label: "AURA-X", path: "/assistant", icon: HiSparkles },
];

const SUPPORT = [
  { label: "Help", path: "/help", icon: HiQuestionMarkCircle },
  { label: "Settings", path: "/settings", icon: HiCog6Tooth },
];

function NavGroup({ title, items, onNavigate, collapsed }) {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 text-[11px] font-semibold tracking-wider text-lilac-dark dark:text-nightaccent uppercase mb-2">
          {title}
        </p>
      )}
      <div className="flex flex-col gap-1 w-full">
        {items.map(({ label, path, icon: Icon, end }) => {
          const link = (
            <NavLink
              to={path}
              end={end}
              onClick={onNavigate}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-highlight dark:bg-nightpurple/30 text-lilac-dark dark:text-white"
                    : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && label}
            </NavLink>
          );
          return collapsed ? (
            <Tooltip key={path} label={label}>
              {link}
            </Tooltip>
          ) : (
            <span key={path}>{link}</span>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  onClose,
  onLogoClick,
  collapsed,
  onToggleCollapsed,
  forceExpanded,
}) {
  const isCollapsed = collapsed && !forceExpanded;
  const { clearAllData } = useData();

  const handleAccountClick = () => {
    clearAllData();
    onClose();
  };

  const content = (
    <div
      className={`flex flex-col h-full shrink-0 bg-white/80 dark:bg-nightcard/60 backdrop-blur-xl border-r border-highlight/60 dark:border-white/5 py-6 transition-[width] duration-300 ${
        isCollapsed ? "w-20 px-2" : "w-72 px-4"
      }`}
    >
      <div
        className={`flex items-center mb-8 ${isCollapsed ? "flex-col gap-3 px-0" : "justify-between px-2"}`}
      >
        <button
          onClick={onLogoClick}
          className="text-left"
          aria-label="AURA-X logo, click for a surprise"
        >
          {isCollapsed ? (
            <HiSparkles className="w-6 h-6 text-lilac-dark dark:text-nightaccent mx-auto" />
          ) : (
            <>
              <p className="font-display font-bold text-xl flex items-center gap-1.5 text-gray-800 dark:text-white">
                <HiSparkles className="w-5 h-5 text-lilac-dark dark:text-nightaccent" />
                AURA-{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lilac-dark to-pink-400">
                  X
                </span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Learn. Organize. Achieve.
              </p>
            </>
          )}
        </button>
        {forceExpanded && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400"
            aria-label="Close menu"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav
        className={`flex flex-col flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? "gap-5 items-center" : "gap-7"}`}
      >
        <NavGroup
          title="Workspace"
          items={WORKSPACE}
          onNavigate={onClose}
          collapsed={isCollapsed}
        />
        <NavGroup
          title="Progress"
          items={PROGRESS}
          onNavigate={onClose}
          collapsed={isCollapsed}
        />
        <NavGroup
          title="Support"
          items={SUPPORT}
          onNavigate={onClose}
          collapsed={isCollapsed}
        />
      </nav>

      <div className={`pt-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        <Tooltip label="Account">
          <NavLink
            to="/setup"
            onClick={handleAccountClick}
            aria-label="Account"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-highlight dark:bg-nightpurple/30 text-lilac-dark dark:text-white"
                  : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              }`
            }
          >
            <HiUserCircle className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && "Account"}
          </NavLink>
        </Tooltip>
        {!isCollapsed && (
          <p className="text-[11px] text-gray-300 dark:text-gray-600 px-2 pb-3">
            Press{" "}
            <kbd className="border border-gray-200 dark:border-white/10 rounded px-1">
              Ctrl
            </kbd>
            +
            <kbd className="border border-gray-200 dark:border-white/10 rounded px-1">
              K
            </kbd>{" "}
            to search
          </p>
        )}
        {!forceExpanded && (
          <Tooltip label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <button
              onClick={onToggleCollapsed}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={isCollapsed}
              className="hidden md:flex items-center justify-center w-full gap-2 py-2 rounded-xl text-gray-400 hover:text-lilac-dark hover:bg-highlight dark:hover:bg-nightpurple/20 transition-colors"
            >
              {isCollapsed ? (
                <HiChevronDoubleRight className="w-4 h-4" />
              ) : (
                <HiChevronDoubleLeft className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  if (forceExpanded) {
    // Mobile drawer: always full width, regardless of the desktop collapsed preference.
    return <div className="animate-pop-in h-full">{content}</div>;
  }

  return content;
}
