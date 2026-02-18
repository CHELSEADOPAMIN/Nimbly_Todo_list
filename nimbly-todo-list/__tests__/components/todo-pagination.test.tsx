import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodoPagination } from "@/components/todos/todo-pagination";

describe("TodoPagination component", () => {
  it("should disable prev/next and highlight page 1 when there is only one page", () => {
    render(<TodoPagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    expect(screen.getByText("Previous page").closest("button")).toBeDisabled();
    expect(screen.getByText("Next page").closest("button")).toBeDisabled();
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
  });

  it("should disable previous and enable next on the first page", () => {
    render(<TodoPagination page={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByText("Previous page").closest("button")).toBeDisabled();
    expect(screen.getByText("Next page").closest("button")).not.toBeDisabled();
  });

  it("should call onPageChange(3) when page 3 is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<TodoPagination page={1} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should call onPageChange(current + 1) when next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<TodoPagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByText("Next page").closest("button") as HTMLButtonElement);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should show ellipsis and always show first/last page when totalPages > 7", () => {
    render(<TodoPagination page={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("should expose correct accessibility attributes", () => {
    render(<TodoPagination page={4} totalPages={8} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("Todo pagination")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Previous page")).toBeInTheDocument();
    expect(screen.getByText("Next page")).toBeInTheDocument();
  });
});
