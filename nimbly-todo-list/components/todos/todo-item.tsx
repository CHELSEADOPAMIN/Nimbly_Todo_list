"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";
import type { Todo } from "@/lib/types/todo";

interface TodoItemProps {
  todo: Todo;
  selected: boolean;
  isUpdating: boolean;
  onSelect: (id: number) => void;
  onToggleCompleted: (todo: Todo, nextCompleted: boolean) => Promise<void>;
  onRename: (todo: Todo, nextTitle: string) => Promise<void>;
}

export const TodoItem = ({
  todo,
  selected,
  isUpdating,
  onSelect,
  onToggleCompleted,
  onRename,
}: TodoItemProps) => {
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const isEditing = editingTitle !== null;

  const commitRename = async () => {
    if (editingTitle === null) {
      return;
    }

    const normalized = editingTitle.trim();

    if (!normalized || normalized === todo.todo) {
      setEditingTitle(null);
      return;
    }

    await onRename(todo, normalized);
    setEditingTitle(null);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(todo.id)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !isEditing) {
          event.preventDefault();
          onSelect(todo.id);
        }
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
        "hover:bg-[rgb(240_235_229_/_0.5)] focus-visible:bg-[rgb(240_235_229_/_0.5)]",
        selected
          ? "border-l-2 border-primary bg-[rgb(93_112_82_/_0.06)]"
          : "border-l-2 border-transparent",
      )}
      aria-label={todo.todo}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Checkbox
          checked={todo.completed}
          aria-label={todo.completed ? "Mark task as not completed" : "Mark task as completed"}
          onCheckedChange={(nextCompleted) => {
            void onToggleCompleted(todo, nextCompleted);
          }}
        />
      </div>

      <div
        className="min-w-0 flex-1"
        onDoubleClick={() => {
          setEditingTitle(todo.todo);
        }}
      >
        {isEditing ? (
          <input
            autoFocus
            value={editingTitle ?? ""}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onChange={(event) => setEditingTitle(event.target.value)}
            onBlur={() => {
              void commitRename();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commitRename();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setEditingTitle(null);
              }
            }}
            className="organic-pill-input h-9 w-full rounded-xl bg-white/70 px-3 text-sm"
          />
        ) : (
          <p
            className={cn(
              "truncate text-sm",
              todo.completed ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {todo.todo}
          </p>
        )}
      </div>

      {isUpdating ? <span className="text-xs text-muted-foreground">Saving...</span> : null}
    </article>
  );
};
