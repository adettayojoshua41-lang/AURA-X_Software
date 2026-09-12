import { useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { todayISO } from "../utils/dateHelpers";
import ThemeToggle from "../components/ThemeToggle";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";

export default function Settings() {
  const { animationsEnabled, setAnimationsEnabled } = useTheme();
  const { loadSampleData, clearAllData, semester, exportData, importData } =
    useData();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);

  const handleClear = () => {
    clearAllData();
    setConfirmClear(false);
    showToast("All local data has been cleared.", { title: "Data cleared" });
  };

  const handleExport = () => {
    try {
      const snapshot = exportData();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStamp = todayISO();
      a.href = url;
      a.download = `aura-x-backup-${dateStamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Your data was downloaded as a JSON file.", {
        title: "Backup exported",
      });
    } catch (err) {
      console.error(err);
      showToast("Couldn't create the backup file. Please try again.", {
        title: "Export failed",
        type: "error",
      });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    try {
      const text = await file.text();
      const result = importData(text);
      if (result.ok) {
        showToast("Your backup was restored successfully.", {
          title: "Data imported",
        });
      } else {
        showToast(result.error || "That file couldn't be imported.", {
          title: "Import failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Couldn't read that file. Make sure it's an AURA-X backup.", {
        title: "Import failed",
        type: "error",
      });
    }
  };

  return (
    <div className="pt-2 max-w-2xl mx-auto">
      <PageHeader
        title="Settings"
        description="Personalize how AURA-X looks and behaves."
      />

      <div className="mt-6 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
        <Row title="Theme" description="Switch between light and dark mode.">
          <ThemeToggle />
        </Row>
        <Row
          title="Animations"
          description="Floating blobs, sparkles, and smooth transitions."
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:bg-lilac-dark transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </Row>
        <Row
          title="Semester"
          description={
            semester
              ? `${semester.name} (${semester.startDate} – ${semester.endDate})`
              : "No semester set"
          }
        />
        <Row
          title="Load sample data"
          description="Populate the app with demo subjects and activity."
        >
          <Button
            variant="ghost"
            onClick={() => {
              loadSampleData();
              showToast("Demo data loaded across every page.", {
                title: "Sample data loaded",
              });
            }}
          >
            Load
          </Button>
        </Row>
      </div>

      <div className="mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10">
        <Row
          title="Export backup"
          description="Download everything as a JSON file you can keep or move to another browser."
        >
          <Button variant="ghost" onClick={handleExport}>
            Export
          </Button>
        </Row>
        <Row
          title="Import backup"
          description="Restore data from a previously exported JSON file. This replaces what's currently stored."
        >
          <Button variant="ghost" onClick={handleImportClick}>
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </Row>
        <Row
          title="Clear all data"
          description="Permanently remove everything stored in this browser."
        >
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            Clear
          </Button>
        </Row>
      </div>

      <div className="mt-5 rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 p-5">
        <p className="text-sm font-display font-semibold text-gray-800 dark:text-white">
          About
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AURA-X — v1.0.0
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Created and owned by Adetayo Joshua Iyiade.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          A magical productivity workspace for students. All data stays in your
          browser — no backend, no account, no cost.
        </p>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        message="This removes your semester, subjects, assignments, attendance, notes, and goals from this browser. Export a backup first if you want to keep a copy. This can't be undone."
        confirmLabel="Clear everything"
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

function Row({ title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          {title}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
