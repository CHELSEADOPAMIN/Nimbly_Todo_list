"use client";

import { ListChecks, LogOut, Menu } from "lucide-react";
import { useMemo } from "react";
import { TodoCreate } from "@/components/todos/todo-create";
import { TodoItem } from "@/components/todos/todo-item";
import { TodoPagination } from "@/components/todos/todo-pagination";
import { TodoSkeleton } from "@/components/todos/todo-skeleton";
import type { Todo, TodoView } from "@/lib/types/todo";

interface TodoListProps {
  view: TodoView;
  todos: Todo[];
  totalCount: number;
  page: number;
  totalPages: number;
  selectedId: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isCreating: boolean;
  isTodoUpdating: (id: number) => boolean;
  onOpenNavigation: () => void;
  onLogout: () => void;
  onCreate: (todoText: string) => Promise<void>;
  onSelect: (id: number) => void;
  onToggleCompleted: (todo: Todo, nextCompleted: boolean) => Promise<void>;
  onRename: (todo: Todo, nextTitle: string) => Promise<void>;
  onPageChange: (nextPage: number) => void;
}

const VIEW_LABELS: Record<TodoView, string> = {
  today: "Today",
  history: "History",
};

export const TodoList = ({
  view,
  todos,
  totalCount,
  page,
  totalPages,
  selectedId,
  isLoading,
  isError,
  error,
  isCreating,
  isTodoUpdating,
  onOpenNavigation,
  onLogout,
  onCreate,
  onSelect,
  onToggleCompleted,
  onRename,
  onPageChange,
}: TodoListProps) => {
  const keyedTodos = useMemo(() => {
    const seenIds = new Map<number, number>();

    return todos.map((todo) => {
      const duplicateIndex = seenIds.get(todo.id) ?? 0;
      seenIds.set(todo.id, duplicateIndex + 1);

      const key =
        duplicateIndex === 0 ? `todo-${todo.id}` : `todo-${todo.id}-${duplicateIndex}`;

      return { todo, key };
    });
  }, [todos]);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-background" aria-label="Todo list panel">
      <header className="flex items-center gap-3 px-6 py-4">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenNavigation}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary transition-colors duration-200 hover:bg-muted lg:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-2xl font-bold text-foreground lg:text-3xl">{VIEW_LABELS[view]}</h1>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[rgb(93_112_82_/_0.1)] px-2 text-xs font-semibold text-primary">
            {totalCount}
          </span>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          onClick={onLogout}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-destructive transition-colors duration-200 hover:bg-[rgb(168_84_72_/_0.12)] lg:hidden"
        >
          <LogOut size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="px-6 pb-3">
        <TodoCreate onCreate={onCreate} isCreating={isCreating} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
        {isLoading ? (
          <TodoSkeleton />
        ) : isError ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 rounded-3xl border border-[rgb(222_216_207_/_0.5)] bg-[rgb(240_235_229_/_0.25)] p-6 text-center">
            <p className="text-base font-semibold text-destructive">Failed to load tasks</p>
            <p className="text-sm text-muted-foreground">{error?.message ?? "Please try again shortly."}</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[rgb(222_216_207_/_0.7)] bg-[rgb(240_235_229_/_0.2)] p-8 text-center">
            <ListChecks size={28} className="text-primary" aria-hidden="true" />
            <p className="text-base font-semibold text-foreground">No tasks in this view</p>
            <p className="max-w-64 text-sm text-muted-foreground">
              {view === "today"
                ? "Enjoy the calm. Add a new task when you are ready."
                : "Completed tasks will collect here as your history."}
            </p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {keyedTodos.map(({ todo, key }) => (
              <TodoItem
                key={key}
                todo={todo}
                selected={selectedId === todo.id}
                isUpdating={isTodoUpdating(todo.id)}
                onSelect={onSelect}
                onToggleCompleted={onToggleCompleted}
                onRename={onRename}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[rgb(222_216_207_/_0.32)] px-6 py-4">
        <TodoPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </footer>
    </section>
  );
};
