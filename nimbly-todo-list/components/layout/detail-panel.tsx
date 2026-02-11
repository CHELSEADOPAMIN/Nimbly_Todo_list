"use client";

import { ClipboardList, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { useTodoNotes } from "@/lib/hooks/use-todo-notes";
import { removeNote } from "@/lib/notes";
import type { Todo, UpdateTodoRequest } from "@/lib/types/todo";

interface DetailPanelProps {
  todo: Todo | null;
  isOpen: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTodoRequest) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

const getStatusLabel = (completed: boolean) => {
  return completed ? "Completed" : "In Progress";
};

export const DetailPanel = ({
  todo,
  isOpen,
  isUpdating,
  isDeleting,
  onClose,
  onUpdate,
  onDelete,
}: DetailPanelProps) => {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { note, setNote } = useTodoNotes(todo?.id ?? null);

  const commitTitle = async (nextTitle: string) => {
    if (!todo) {
      return;
    }

    const normalized = nextTitle.trim();

    if (!normalized || normalized === todo.todo) {
      return;
    }

    await onUpdate(todo.id, { todo: normalized });
  };

  const handleDeleteConfirm = async () => {
    if (!todo) {
      return;
    }

    const deleted = await onDelete(todo.id);

    if (!deleted) {
      return;
    }

    removeNote(todo.id);
    setDeleteDialogOpen(false);
    onClose();
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close detail panel backdrop"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[rgb(44_44_36_/_0.2)] backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-[min(100vw,20rem)] flex-col border-l border-[rgb(222_216_207_/_0.35)] bg-[rgb(240_235_229_/_0.22)] transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "lg:static lg:z-0 lg:w-80",
        )}
        aria-label="Task detail panel"
      >
        {todo ? (
          <div className="flex h-full flex-col gap-6 p-6">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <label htmlFor="detail-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Task
                </label>
                <input
                  key={`detail-title-${todo.id}-${todo.todo}`}
                  id="detail-title"
                  defaultValue={todo.todo}
                  onBlur={(event) => {
                    void commitTitle(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void commitTitle(event.currentTarget.value);
                    }
                  }}
                  className="organic-pill-input h-12 w-full rounded-2xl bg-white/70 px-4 text-lg font-semibold"
                />
              </div>

              <button
                type="button"
                aria-label="Deselect task"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:bg-muted"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2.5">
                <Checkbox
                  checked={todo.completed}
                  aria-label={todo.completed ? "Mark as in progress" : "Mark as completed"}
                  onCheckedChange={(nextCompleted) => {
                    void onUpdate(todo.id, { completed: nextCompleted });
                  }}
                />
                <span className="text-sm font-semibold text-foreground">{getStatusLabel(todo.completed)}</span>
                {isUpdating ? <span className="ml-auto text-xs text-muted-foreground">Saving...</span> : null}
              </div>
            </section>

            <hr className="border-[rgb(222_216_207_/_0.35)]" />

            <section className="space-y-2">
              <label htmlFor="todo-note" className="text-sm font-semibold text-muted-foreground">
                Notes
              </label>
              <textarea
                id="todo-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add notes..."
                className="organic-pill-input !rounded-xl h-40 w-full resize-none bg-white/70 px-4 py-3 text-sm"
              />
            </section>

            <div className="flex-1" />

            <section className="border-t border-[rgb(222_216_207_/_0.35)] pt-4">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-destructive transition-colors duration-200 hover:bg-[rgb(168_84_72_/_0.12)]"
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete Task
              </button>
            </section>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgb(93_112_82_/_0.1)] text-primary">
              <ClipboardList size={24} aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-foreground">Select a task to view details</p>
            <p className="max-w-64 text-sm text-muted-foreground">
              Edit title, update status, keep your thoughts in notes, or remove tasks from here.
            </p>
          </div>
        )}
      </aside>

      <Dialog
        open={isDeleteDialogOpen}
        tone="destructive"
        isBusy={isDeleting}
        title="Delete this task?"
        description="This action removes the task from the list."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
