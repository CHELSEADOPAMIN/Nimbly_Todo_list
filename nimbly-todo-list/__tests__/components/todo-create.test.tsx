import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodoCreate } from "@/components/todos/todo-create";

describe("TodoCreate component", () => {
  it("should call onCreate with trimmed text and clear input on Enter", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(async () => {});

    render(<TodoCreate onCreate={onCreate} isCreating={false} />);

    const input = screen.getByLabelText("Add a new task");
    await user.type(input, "  Buy groceries  {enter}");

    expect(onCreate).toHaveBeenCalledWith("Buy groceries");
    expect(input).toHaveValue("");
  });

  it("should not call onCreate when submitting blank text", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(async () => {});

    render(<TodoCreate onCreate={onCreate} isCreating={false} />);
    await user.type(screen.getByLabelText("Add a new task"), "   {enter}");

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("should submit the form when clicking the plus button", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn(async () => {});

    render(<TodoCreate onCreate={onCreate} isCreating={false} />);

    await user.type(screen.getByLabelText("Add a new task"), "Ship release");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(onCreate).toHaveBeenCalledWith("Ship release");
  });

  it("should disable input and button when isCreating=true", () => {
    render(<TodoCreate onCreate={vi.fn(async () => {})} isCreating />);

    expect(screen.getByLabelText("Add a new task")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create task" })).toBeDisabled();
  });

  it("should expose accessible label and submit button aria-label", () => {
    render(<TodoCreate onCreate={vi.fn(async () => {})} isCreating={false} />);

    expect(screen.getByLabelText("Add a new task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create task" })).toBeInTheDocument();
  });
});
