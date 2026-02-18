import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { DetailPanel } from "@/components/layout/detail-panel";
import { setNote } from "@/lib/notes";
import type { Todo } from "@/lib/types/todo";

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  todo: "Task 1",
  completed: false,
  userId: 1,
  ...overrides,
});

const renderDetailPanel = (
  overrides: Partial<ComponentProps<typeof DetailPanel>> = {},
) => {
  const onClose = vi.fn();
  const onUpdate = vi.fn(async () => true);
  const onDelete = vi.fn(async () => true);

  render(
    <DetailPanel
      todo={buildTodo()}
      isOpen
      isUpdating={false}
      isDeleting={false}
      onClose={onClose}
      onUpdate={onUpdate}
      onDelete={onDelete}
      {...overrides}
    />,
  );

  return {
    onClose,
    onUpdate,
    onDelete,
  };
};

describe("DetailPanel component", () => {
  it("should show empty state when no todo is selected", () => {
    renderDetailPanel({ todo: null, isOpen: false });

    expect(screen.getByText("Select a task to view details")).toBeInTheDocument();
  });

  it("should render title input, status checkbox, notes textarea, and delete button when a todo is selected", () => {
    renderDetailPanel({ todo: buildTodo({ todo: "Review PR" }) });

    expect(screen.getByLabelText("Task")).toHaveValue("Review PR");
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Task" })).toBeInTheDocument();
  });

  it("should call onUpdate when title changes on blur", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderDetailPanel({ todo: buildTodo({ id: 2, todo: "Old" }) });

    const input = screen.getByLabelText("Task");
    await user.clear(input);
    await user.type(input, "  New title  ");
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(2, { todo: "New title" });
    });
  });

  it("should not call onUpdate when title remains unchanged", () => {
    const { onUpdate } = renderDetailPanel({ todo: buildTodo({ id: 3, todo: "Same title" }) });

    fireEvent.blur(screen.getByLabelText("Task"));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should call onUpdate({ completed: !current }) when completion is toggled", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderDetailPanel({ todo: buildTodo({ id: 7, completed: false }) });

    await user.click(screen.getByRole("checkbox"));

    expect(onUpdate).toHaveBeenCalledWith(7, { completed: true });
  });

  it("should update textarea value when typing notes", async () => {
    const user = userEvent.setup();
    renderDetailPanel({ todo: buildTodo({ id: 10 }) });

    const notes = screen.getByLabelText("Notes");
    await user.type(notes, "Meeting notes");

    expect(notes).toHaveValue("Meeting notes");
  });

  it("should call onDelete and close dialog/panel when delete is confirmed", async () => {
    const user = userEvent.setup();
    const todo = buildTodo({ id: 11, todo: "Remove me" });
    setNote(todo.id, "will be removed");

    const { onClose, onDelete } = renderDetailPanel({ todo });

    await user.click(screen.getByRole("button", { name: "Delete Task" }));
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(11);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(localStorage.getItem("nimbly:notes:v1:11")).toBeNull();
  });

  it("should not call onDelete and should close dialog when delete is canceled", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDetailPanel();

    await user.click(screen.getByRole("button", { name: "Delete Task" }));
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDetailPanel();

    await user.click(screen.getByRole("button", { name: "Deselect task" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
