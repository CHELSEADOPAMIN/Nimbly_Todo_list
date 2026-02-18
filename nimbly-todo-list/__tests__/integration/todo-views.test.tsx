import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodosPage from "@/app/todos/page";
import { API_BASE_URL } from "@/lib/api/client";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { renderWithProviders } from "../helpers/render-with-providers";
import { buildTodosResponse } from "../mocks/fixtures";
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

describe("View switching and pagination", () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_BASE_URL}/todos/user/:userId`, () => {
        return HttpResponse.json(buildTodosResponse(25, 10));
      }),
    );
  });

  it("should default to Today view and show only incomplete tasks", async () => {
    renderTodosPage();

    expect(await screen.findByRole("button", { name: "Task 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Task 16" })).not.toBeInTheDocument();
  });

  it("should switch to History view and reset to page 1", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(screen.getByRole("button", { name: "2" }));
    expect(await screen.findByRole("button", { name: "Task 11" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /History/ })[0]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
    expect(screen.getByRole("button", { name: "Task 16" })).toBeInTheDocument();
  });

  it("should show up to 10 items per page and render tasks 11-15 on page 2", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });

    const firstPageItems = screen.getAllByRole("button", { name: /Task \d+/ });
    expect(firstPageItems).toHaveLength(10);

    await user.click(screen.getByRole("button", { name: "2" }));

    expect(await screen.findByRole("button", { name: "Task 11" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Task 15" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Task 10" })).not.toBeInTheDocument();
  });

  it("should show filtered counts in badges: Today=15 and History=10", async () => {
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });

    const [todayButton] = screen.getAllByRole("button", { name: /Today/ });
    const [historyButton] = screen.getAllByRole("button", { name: /History/ });

    expect(todayButton.textContent).toContain("15");
    expect(historyButton.textContent).toContain("10");
  });

  it("should decrease Today and increase History count after completing a Today task", async () => {
    const user = userEvent.setup();
    renderTodosPage();

    await screen.findByRole("button", { name: "Task 1" });
    await user.click(
      screen.getAllByRole("checkbox", { name: "Mark task as completed" })[0],
    );

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Task 1" })).not.toBeInTheDocument();
    });

    const [historyButton] = screen.getAllByRole("button", { name: /History/ });
    expect(historyButton.textContent).toContain("11");
  });
});
