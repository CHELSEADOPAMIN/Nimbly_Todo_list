import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/sidebar";
import type { User } from "@/lib/types/auth";

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Stone",
  image: "https://cdn.example.com/avatar.png",
  ...overrides,
});

describe("Sidebar component", () => {
  it("should render avatar and Home button when user is provided", () => {
    render(<Sidebar user={buildUser()} onLogout={vi.fn()} />);

    expect(screen.getByRole("img", { name: "Emily Stone" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("should show initials fallback when user has no avatar", () => {
    render(
      <Sidebar
        user={buildUser({ firstName: "", lastName: "", username: "nimbly", image: "" })}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("should call onLogout when sign-out button is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();

    render(<Sidebar user={buildUser()} onLogout={onLogout} />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("should expose correct accessibility labels for sidebar and sign out", () => {
    render(<Sidebar user={buildUser()} onLogout={vi.fn()} />);

    expect(screen.getByLabelText("Primary sidebar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });
});
