import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TodosPage from "@/app/todos/page";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { renderWithProviders } from "../helpers/render-with-providers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderTodosPage = () => {
  setAccessToken("access-token");
  setRefreshToken("refresh-token");
  renderWithProviders(<TodosPage />);
};

describe("Detail panel and notes", () => {
  it("should display task details after selecting a task", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(screen.getByRole("button", { name: "Task 1" }));

    expect(screen.getByLabelText("Task")).toHaveValue("Task 1");
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("should persist notes to localStorage after debounce", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(screen.getByRole("button", { name: "Task 1" }));

    const notes = screen.getByLabelText("Notes");
    await user.type(notes, "Meeting notes");

    await waitFor(
      () => {
        expect(localStorage.getItem("nimbly:notes:v1:1")).toBe("Meeting notes");
      },
      { timeout: 1200 },
    );
  });

  it("should restore saved note when reselecting the same task", async () => {
    const user = userEvent.setup();
    localStorage.setItem("nimbly:notes:v1:1", "Persisted note");

    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(screen.getByRole("button", { name: "Task 1" }));

    expect(screen.getByLabelText("Notes")).toHaveValue("Persisted note");
  });

  it("should clear the related note after deleting a task", async () => {
    const user = userEvent.setup();
    localStorage.setItem("nimbly:notes:v1:1", "to be deleted");

    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(screen.getByRole("button", { name: "Task 1" }));
    await user.click(screen.getByRole("button", { name: "Delete Task" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(localStorage.getItem("nimbly:notes:v1:1")).toBeNull();
    });
  });
});
