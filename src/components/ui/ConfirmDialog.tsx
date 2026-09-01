import { Modal } from "./Modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="max-w-sm">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button className="btn-secondary" onClick={onCancel}>
          Batal
        </button>
        <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
