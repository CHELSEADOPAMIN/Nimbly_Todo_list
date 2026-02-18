import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import TodosPage from "@/app/todos/page";
import { API_BASE_URL } from "@/lib/api/client";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { renderWithProviders } from "../helpers/render-with-providers";
import { server } from "../mocks/server";

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

const waitForTodosLoaded = async () => {
  await screen.findByRole("button", { name: "Task 1" });
};

describe("Todo CRUD integration", () => {
  it("should optimistically add a task and clear input on Enter", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await waitForTodosLoaded();

    const input = screen.getByLabelText("Add a new task");
    await user.type(input, "Buy groceries{enter}");

    expect(await screen.findByText("Buy groceries")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("should rollback optimistic task when create fails", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/todos/add`, () => {
        return HttpResponse.json({ message: "Create failed" }, { status: 500 });
      }),
    );

    renderTodosPage();
    await waitForTodosLoaded();

    await user.type(screen.getByLabelText("Add a new task"), "Rollback task{enter}");

    await waitFor(() => {
      expect(screen.queryByText("Rollback task")).not.toBeInTheDocument();
    });
  });

  it("should mark task as completed when checkbox is toggled", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await waitForTodosLoaded();

    const checkbox = screen.getAllByRole("checkbox", {
      name: "Mark task as completed",
    })[0];

    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Task 1" })).not.toBeInTheDocument();
    });
  });

  it("should update task text after editing and pressing Enter", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await waitForTodosLoaded();

    await user.dblClick(screen.getByText("Task 2"));
    const input = screen
      .getAllByDisplayValue("Task 2")
      .find((element) => element.getAttribute("id") !== "detail-title");
    expect(input).toBeTruthy();

    if (!input) {
      return;
    }

    await user.clear(input);
    await user.type(input, "Updated task");
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Updated task")).toBeInTheDocument();
  });

  it("should remove task after confirming delete", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await waitForTodosLoaded();

    await user.click(screen.getByRole("button", { name: "Task 3" }));
    await user.click(screen.getByRole("button", { name: "Delete Task" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Task 3" })).not.toBeInTheDocument();
    });
  });

  it("should keep task when delete is canceled", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await waitForTodosLoaded();

    await user.click(screen.getByRole("button", { name: "Task 4" }));
    await user.click(screen.getByRole("button", { name: "Delete Task" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Task 4" })).toBeInTheDocument();
  });
});
