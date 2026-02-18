import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import { API_BASE_URL } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/token";
import { renderWithProviders } from "../helpers/render-with-providers";
import { server } from "../mocks/server";

const routerReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: routerReplace,
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const AuthProbe = () => {
  const { initialized, isAuthenticated, user, logout } = useAuth();

  if (!initialized) {
    return <p>loading</p>;
  }

  return (
    <div>
      <p>{isAuthenticated ? "authenticated" : "guest"}</p>
      <p>{user?.username ?? "none"}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("Auth flow integration", () => {
  beforeEach(() => {
    routerReplace.mockReset();
  });

  it("should store tokens and redirect to /todos on successful login", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Username"), "emilys");
    await user.type(screen.getByLabelText("Password"), "emilyspass");
    await user.click(screen.getByRole("button", { name: "Enter Workspace" }));

    await waitFor(() => {
      expect(getAccessToken()).toBe("access-token");
      expect(getRefreshToken()).toBe("refresh-token");
      expect(routerReplace).toHaveBeenCalledWith("/todos");
    });
  });

  it("should show invalid credentials error on failed login", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ message: "Invalid username or password" }, { status: 401 }),
      ),
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Username"), "bad-user");
    await user.type(screen.getByLabelText("Password"), "bad-pass");
    await user.click(screen.getByRole("button", { name: "Enter Workspace" }));

    expect(
      await screen.findByText("Invalid username or password. Please try the demo account."),
    ).toBeInTheDocument();
  });

  it("should show network error message when request fails", async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/auth/login`, () => {
        return HttpResponse.error();
      }),
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Username"), "emilys");
    await user.type(screen.getByLabelText("Password"), "emilyspass");
    await user.click(screen.getByRole("button", { name: "Enter Workspace" }));

    expect(
      await screen.findByText("Network request failed. Please check your connection and try again."),
    ).toBeInTheDocument();
  });

  it("should restore authenticated state from valid persisted token", async () => {
    setAccessToken("access-token");
    setRefreshToken("refresh-token");

    renderWithProviders(<AuthProbe />);

    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
      expect(screen.getByText("emilys")).toBeInTheDocument();
    });
  });

  it("should clear tokens when /auth/me returns 401", async () => {
    setAccessToken("expired-access-token");
    setRefreshToken("refresh-token");

    server.use(
      http.get(`${API_BASE_URL}/auth/me`, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    renderWithProviders(<AuthProbe />);

    await waitFor(() => {
      expect(screen.getByText("guest")).toBeInTheDocument();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  it("should clear tokens and redirect to /login on logout", async () => {
    const user = userEvent.setup();
    setAccessToken("access-token");
    setRefreshToken("refresh-token");

    renderWithProviders(<AuthProbe />);

    await screen.findByText("authenticated");
    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(routerReplace).toHaveBeenCalledWith("/login");
  });
});
