import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { TodoList } from "@/components/todos/todo-list";
import type { Todo } from "@/lib/types/todo";

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  todo: "Task 1",
  completed: false,
  userId: 1,
  ...overrides,
});

const renderTodoList = (overrides: Partial<ComponentProps<typeof TodoList>> = {}) => {
  const props: ComponentProps<typeof TodoList> = {
    view: "today",
    todos: [],
    totalCount: 0,
    page: 1,
    totalPages: 1,
    selectedId: null,
    isLoading: false,
    isError: false,
    error: null,
    isCreating: false,
    isTodoUpdating: () => false,
    onOpenNavigation: vi.fn(),
    onLogout: vi.fn(),
    onCreate: vi.fn(async () => {}),
    onSelect: vi.fn(),
    onToggleCompleted: vi.fn(async () => {}),
    onRename: vi.fn(async () => {}),
    onPageChange: vi.fn(),
    ...overrides,
  };

  return render(<TodoList {...props} />);
};

describe("TodoList component", () => {
  it("should render skeleton while loading and hide empty/error states", () => {
    const { container } = renderTodoList({ isLoading: true });

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByText("No tasks in this view")).not.toBeInTheDocument();
    expect(screen.queryByText("Failed to load tasks")).not.toBeInTheDocument();
  });

  it("should show today empty-state copy when no todos exist in Today view", () => {
    renderTodoList({ view: "today", todos: [], totalCount: 0 });

    expect(screen.getByText("No tasks in this view")).toBeInTheDocument();
    expect(screen.getByText(/Enjoy the calm/)).toBeInTheDocument();
  });

  it("should show history empty-state copy when no todos exist in History view", () => {
    renderTodoList({ view: "history", todos: [], totalCount: 0 });

    expect(screen.getByText("No tasks in this view")).toBeInTheDocument();
    expect(screen.getByText(/Completed tasks will collect here/)).toBeInTheDocument();
  });

  it("should show error title and message when loading fails", () => {
    renderTodoList({
      isError: true,
      error: new Error("boom"),
    });

    expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("should render todo items and header count when data exists", () => {
    renderTodoList({
      view: "today",
      todos: [buildTodo({ id: 1, todo: "Task A" }), buildTodo({ id: 2, todo: "Task B" })],
      totalCount: 2,
    });

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });

  it("should have aria-label='Todo list panel'", () => {
    renderTodoList();
    expect(screen.getByLabelText("Todo list panel")).toBeInTheDocument();
  });
});
