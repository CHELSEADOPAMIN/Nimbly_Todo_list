"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DetailPanel } from "@/components/layout/detail-panel";
import { NavPanel } from "@/components/layout/nav-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { TodoList } from "@/components/todos/todo-list";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTodos } from "@/lib/hooks/use-todos";
import type { Todo, TodoView, UpdateTodoRequest } from "@/lib/types/todo";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

const getWorkspaceTitle = (name?: string) => {
  if (!name) {
    return "Workspace";
  }

  return `${name}'s Workspace`;
};

export default function TodosPage() {
  const { user, initialized, logout } = useAuth();
  const todosState = useTodos(user?.id ?? 0);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [isNavigationOpen, setNavigationOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);

  const selectedTodo = useMemo(() => {
    return todosState.allTodos.find((todo) => todo.id === selectedTodoId) ?? null;
  }, [selectedTodoId, todosState.allTodos]);

  const reportError = (error: unknown) => {
    const message = error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE;
    toast.error(message || FALLBACK_ERROR_MESSAGE);
  };

  const handleCreate = async (todoText: string) => {
    try {
      await todosState.createTodo(todoText);
      toast.success("Task added");
    } catch (error) {
      reportError(error);
    }
  };

  const handleUpdate = async (id: number, payload: UpdateTodoRequest) => {
    try {
      await todosState.updateTodo(id, payload);
      toast.success("Task updated");
      return true;
    } catch (error) {
      reportError(error);
      return false;
    }
  };

  const handleRename = async (todo: Todo, nextTitle: string) => {
    await handleUpdate(todo.id, { todo: nextTitle });
  };

  const handleToggleCompleted = async (todo: Todo, nextCompleted: boolean) => {
    await handleUpdate(todo.id, { completed: nextCompleted });
  };

  const handleDelete = async (id: number) => {
    try {
      await todosState.deleteTodo(id);
      toast.success("Task deleted");
      return true;
    } catch (error) {
      reportError(error);
      return false;
    }
  };

  const handleViewChange = (nextView: TodoView) => {
    todosState.setView(nextView);
    setSelectedTodoId(null);
    setDetailOpen(false);
    setNavigationOpen(false);
  };

  if (!initialized || !user) {
    return (
      <main id="main-content" className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="rounded-full bg-[rgb(93_112_82_/_0.1)] px-4 py-2 text-sm font-semibold text-primary">
          Preparing workspace...
        </p>
      </main>
    );
  }

  const workspaceTitle = getWorkspaceTitle(user.firstName);

  return (
    <main id="main-content" className="relative flex h-dvh overflow-hidden bg-background">
      {isNavigationOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden" aria-label="Navigation drawer">
          <div className="flex h-full">
            <Sidebar user={user} onLogout={logout} />
            <NavPanel
              workspaceTitle={workspaceTitle}
              view={todosState.view}
              todayCount={todosState.todayCount}
              historyCount={todosState.historyCount}
              onViewChange={handleViewChange}
            />
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavigationOpen(false)}
            className="flex-1 bg-[rgb(44_44_36_/_0.18)] backdrop-blur-[1px]"
          />
        </div>
      ) : null}

      <Sidebar user={user} onLogout={logout} className="hidden lg:flex" />
      <NavPanel
        workspaceTitle={workspaceTitle}
        view={todosState.view}
        todayCount={todosState.todayCount}
        historyCount={todosState.historyCount}
        onViewChange={handleViewChange}
        className="hidden lg:flex"
      />

      <TodoList
        view={todosState.view}
        todos={todosState.todos}
        totalCount={todosState.totalCount}
        page={todosState.page}
        totalPages={todosState.totalPages}
        selectedId={selectedTodoId}
        isLoading={todosState.isLoading}
        isError={todosState.isError}
        error={todosState.error}
        isCreating={todosState.isCreating}
        isTodoUpdating={todosState.isTodoUpdating}
        onOpenNavigation={() => setNavigationOpen(true)}
        onLogout={logout}
        onCreate={handleCreate}
        onSelect={(id) => {
          setSelectedTodoId(id);
          setDetailOpen(true);
        }}
        onToggleCompleted={handleToggleCompleted}
        onRename={handleRename}
        onPageChange={todosState.setPage}
      />

      <DetailPanel
        key={selectedTodo?.id ?? "empty-detail"}
        todo={selectedTodo}
        isOpen={isDetailOpen && selectedTodo !== null}
        isUpdating={todosState.isTodoUpdating(selectedTodo?.id)}
        isDeleting={todosState.isTodoDeleting(selectedTodo?.id)}
        onClose={() => {
          setSelectedTodoId(null);
          setDetailOpen(false);
        }}
        onUpdate={handleUpdate}
        onDelete={async (id) => {
          const deleted = await handleDelete(id);
          if (deleted) {
            setSelectedTodoId(null);
          }
          return deleted;
        }}
      />
    </main>
  );
}
