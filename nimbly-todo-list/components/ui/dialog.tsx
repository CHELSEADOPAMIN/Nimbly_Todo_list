"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type DialogTone = "default" | "destructive";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: DialogTone;
  isBusy?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const toneClasses: Record<DialogTone, string> = {
  default: "organic-button",
  destructive: "rounded-full bg-destructive px-6 text-white shadow-[0_8px_24px_-10px_rgba(168,84,72,0.35)] transition-transform duration-300 hover:scale-[1.02] active:scale-95",
};

export const Dialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isBusy = false,
  onConfirm,
  onClose,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (!isBusy) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [isBusy, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 m-0 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[rgb(222_216_207_/_0.6)] bg-[#fefefa] p-0 text-foreground shadow-[0_10px_40px_-10px_rgba(193,140,93,0.2)] backdrop:bg-[rgb(44_44_36_/_0.3)] backdrop:backdrop-blur-sm"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose();
        }
      }}
    >
      <section className="space-y-4 p-7">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="organic-outline-button inline-flex h-10 items-center px-5 text-sm font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              void onConfirm();
            }}
            className={cn(
              "inline-flex h-10 items-center px-5 text-sm font-semibold",
              toneClasses[tone],
            )}
          >
            {isBusy ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </dialog>
  );
};
