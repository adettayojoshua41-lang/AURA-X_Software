import { HiExclamationTriangle } from "react-icons/hi2";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      labelledBy="confirm-dialog-title"
      className="animate-pop-in w-full max-w-sm rounded-3xl bg-white dark:bg-nightcard shadow-2xl p-6 border border-white/60 dark:border-white/10"
    >
      <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
        <HiExclamationTriangle className="w-6 h-6 text-rose-500" />
      </div>
      <h3 id="confirm-dialog-title" className="font-display font-semibold text-lg text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed">{message}</p>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
