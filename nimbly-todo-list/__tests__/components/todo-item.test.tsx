import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { TodoItem } from "@/components/todos/todo-item";
import type { Todo } from "@/lib/types/todo";

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  todo: "Task 1",
  completed: false,
  userId: 1,
  ...overrides,
});

const renderTodoItem = (overrides: Partial<ComponentProps<typeof TodoItem>> = {}) => {
  const todo = overrides.todo ?? buildTodo();
  const onSelect = vi.fn();
  const onToggleCompleted = vi.fn(async () => {});
  const onRename = vi.fn(async () => {});

  render(
    <TodoItem
      todo={todo}
      selected={false}
      isUpdating={false}
      onSelect={onSelect}
      onToggleCompleted={onToggleCompleted}
      onRename={onRename}
      {...overrides}
    />,
  );

  return {
    todo,
    onSelect,
    onToggleCompleted,
    onRename,
  };
};

describe("TodoItem component", () => {
  it("should render incomplete todo with unchecked checkbox and no strikethrough", () => {
    renderTodoItem({ todo: buildTodo({ completed: false, todo: "Plan roadmap" }) });

    expect(screen.getByText("Plan roadmap")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Plan roadmap")).not.toHaveClass("line-through");
  });

  it("should render completed todo with checked checkbox and strikethrough text", () => {
    renderTodoItem({ todo: buildTodo({ completed: true, todo: "Done task" }) });

    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Done task")).toHaveClass("line-through");
    expect(screen.getByText("Done task")).toHaveClass("text-muted-foreground");
  });

  it("should call onToggleCompleted and not onSelect when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const { todo, onSelect, onToggleCompleted } = renderTodoItem({
      todo: buildTodo({ completed: false }),
    });

    await user.click(screen.getByRole("checkbox"));

    expect(onToggleCompleted).toHaveBeenCalledWith(todo, true);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("should call onSelect(todo.id) when row is clicked", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderTodoItem({ todo: buildTodo({ id: 42, todo: "Select me" }) });

    await user.click(screen.getByRole("button", { name: "Select me" }));
    expect(onSelect).toHaveBeenCalledWith(42);
  });

  it("should enter edit mode with prefilled text on double click", async () => {
    const user = userEvent.setup();
    renderTodoItem({ todo: buildTodo({ todo: "Rename me" }) });

    await user.dblClick(screen.getByText("Rename me"));
    expect(screen.getByDisplayValue("Rename me")).toBeInTheDocument();
  });

  it("should call onRename and exit edit mode on Enter", async () => {
    const user = userEvent.setup();
    const { todo, onRename } = renderTodoItem({ todo: buildTodo({ todo: "Old title" }) });

    await user.dblClick(screen.getByText("Old title"));
    const input = screen.getByDisplayValue("Old title");
    await user.clear(input);
    await user.type(input, "  New title  ");
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onRename).toHaveBeenCalledWith(todo, "New title");
    });
    expect(screen.queryByDisplayValue("Old title")).not.toBeInTheDocument();
  });

  it("should cancel edit on Escape without calling onRename", async () => {
    const user = userEvent.setup();
    const { onRename } = renderTodoItem({ todo: buildTodo({ todo: "Keep title" }) });

    await user.dblClick(screen.getByText("Keep title"));
    const input = screen.getByDisplayValue("Keep title");
    await user.clear(input);
    await user.type(input, "Changed");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Keep title")).toBeInTheDocument();
  });

  it("should not call onRename when edited text is unchanged", async () => {
    const user = userEvent.setup();
    const { onRename } = renderTodoItem({ todo: buildTodo({ todo: "Same" }) });

    await user.dblClick(screen.getByText("Same"));
    const input = screen.getByDisplayValue("Same");
    fireEvent.blur(input);

    expect(onRename).not.toHaveBeenCalled();
  });

  it("should show selected highlight and saving indicator", () => {
    renderTodoItem({ selected: true, isUpdating: true, todo: buildTodo({ todo: "Status task" }) });

    expect(screen.getByRole("button", { name: "Status task" })).toHaveClass("border-primary");
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("should trigger onSelect on Enter and Space keys", () => {
    const { onSelect } = renderTodoItem({ todo: buildTodo({ id: 7, todo: "Keyboard task" }) });
    const item = screen.getByRole("button", { name: "Keyboard task" });

    fireEvent.keyDown(item, { key: "Enter" });
    fireEvent.keyDown(item, { key: " " });

    expect(onSelect).toHaveBeenNthCalledWith(1, 7);
    expect(onSelect).toHaveBeenNthCalledWith(2, 7);
  });
});
