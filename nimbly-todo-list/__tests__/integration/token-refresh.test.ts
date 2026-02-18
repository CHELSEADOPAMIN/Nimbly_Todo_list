import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "@/lib/api/client";
import { getTodosByUser } from "@/lib/api/todos";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/token";
import { buildTodosResponse } from "../mocks/fixtures";
import { getRefreshCallCount } from "../mocks/handlers";
import { server } from "../mocks/server";

describe("Token refresh mechanism", () => {
  it("should refresh token and retry request after 401", async () => {
    let todoRequestCount = 0;
    setAccessToken("expired-access-token");
    setRefreshToken("refresh-token");

    server.use(
      http.get(`${API_BASE_URL}/todos/user/:userId`, () => {
        todoRequestCount += 1;

        if (todoRequestCount === 1) {
          return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return HttpResponse.json(buildTodosResponse(3, 1));
      }),
    );

    const response = await getTodosByUser(1);

    expect(response.todos).toHaveLength(3);
    expect(todoRequestCount).toBe(2);
    expect(getAccessToken()).toBe("fresh-access-token");
    expect(getRefreshToken()).toBe("fresh-refresh-token");
  });

  it("should trigger only one refresh for concurrent 401 requests", async () => {
    setAccessToken("expired-access-token");
    setRefreshToken("refresh-token");

    server.use(
      http.get(`${API_BASE_URL}/todos/user/:userId`, ({ request }) => {
        const token = request.headers.get("authorization");

        if (token === "Bearer expired-access-token") {
          return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return HttpResponse.json(buildTodosResponse(2, 1));
      }),
    );

    const [a, b, c] = await Promise.all([
      getTodosByUser(1),
      getTodosByUser(1),
      getTodosByUser(1),
    ]);

    expect(a.todos).toHaveLength(2);
    expect(b.todos).toHaveLength(2);
    expect(c.todos).toHaveLength(2);
    expect(getRefreshCallCount()).toBe(1);
  });

  it("should clear tokens and redirect to /login when refresh fails", async () => {
    setAccessToken("expired-access-token");
    setRefreshToken("invalid-refresh-token");

    server.use(
      http.get(`${API_BASE_URL}/todos/user/:userId`, () => {
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
      }),
    );

    await expect(getTodosByUser(1)).rejects.toBeTruthy();

    await waitFor(() => {
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });
});
