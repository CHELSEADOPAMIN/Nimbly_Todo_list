import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavPanel } from "@/components/layout/nav-panel";

describe("NavPanel component", () => {
  it("should render workspace title, Today/History items, and badges", () => {
    render(
      <NavPanel
        workspaceTitle="Emily's Workspace"
        view="today"
        todayCount={15}
        historyCount={10}
        onViewChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Emily's Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Today/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /History/ })).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should set aria-current on Today when Today is active", () => {
    render(
      <NavPanel
        workspaceTitle="Workspace"
        view="today"
        todayCount={3}
        historyCount={1}
        onViewChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Today/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /History/ })).not.toHaveAttribute("aria-current");
  });

  it("should call onViewChange('history') when History is clicked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(
      <NavPanel
        workspaceTitle="Workspace"
        view="today"
        todayCount={3}
        historyCount={1}
        onViewChange={onViewChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /History/ }));
    expect(onViewChange).toHaveBeenCalledWith("history");
  });
});
