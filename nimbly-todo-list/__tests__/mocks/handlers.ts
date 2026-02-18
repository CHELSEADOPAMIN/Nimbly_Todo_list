import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@/lib/api/client";
import type { LoginRequest, User } from "@/lib/types/auth";
import type {
  CreateTodoRequest,
  Todo,
  TodosResponse,
  UpdateTodoRequest,
} from "@/lib/types/todo";
import { buildTodo, buildUser, seedTodos } from "./fixtures";

const defaultUser: User = buildUser();

const defaultTokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

let todos: Todo[] = seedTodos();
let refreshCallCount = 0;

const getBearerToken = (authorizationHeader: string | null) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
};

const isAuthorized = (authorizationHeader: string | null) => {
  const token = getBearerToken(authorizationHeader);

  if (!token) {
    return false;
  }

  return token !== "expired-access-token";
};

const withUnauthorized = () => {
  return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
};

export const resetMockState = () => {
  todos = seedTodos();
  refreshCallCount = 0;
};

export const getRefreshCallCount = () => refreshCallCount;

export const handlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const payload = (await request.json()) as LoginRequest;

    if (payload.username !== "emilys" || payload.password !== "emilyspass") {
      return HttpResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      ...defaultUser,
      ...defaultTokens,
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      return withUnauthorized();
    }

    return HttpResponse.json(defaultUser);
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, async ({ request }) => {
    refreshCallCount += 1;
    const payload = (await request.json()) as { refreshToken?: string };

    if (!payload.refreshToken || payload.refreshToken === "invalid-refresh-token") {
      return withUnauthorized();
    }

    return HttpResponse.json({
      accessToken: "fresh-access-token",
      refreshToken: "fresh-refresh-token",
    });
  }),

  http.get(`${API_BASE_URL}/todos/user/:userId`, ({ request, params }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      return withUnauthorized();
    }

    const userId = Number(params.userId);
    const userTodos = todos.filter((todo) => todo.userId === userId);

    const response: TodosResponse = {
      todos: userTodos,
      total: userTodos.length,
      skip: 0,
      limit: 0,
    };

    return HttpResponse.json(response);
  }),

  http.post(`${API_BASE_URL}/todos/add`, async ({ request }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      return withUnauthorized();
    }

    const payload = (await request.json()) as CreateTodoRequest;
    const created = buildTodo({
      id: 255,
      todo: payload.todo,
      completed: payload.completed,
      userId: payload.userId,
    });

    todos = [created, ...todos];

    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/todos/:id`, async ({ request, params }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      return withUnauthorized();
    }

    const id = Number(params.id);
    const payload = (await request.json()) as UpdateTodoRequest;
    const target = todos.find((todo) => todo.id === id);

    if (!target) {
      return HttpResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    const updated = {
      ...target,
      ...payload,
    };

    todos = todos.map((todo) => (todo.id === id ? updated : todo));
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/todos/:id`, ({ request, params }) => {
    if (!isAuthorized(request.headers.get("authorization"))) {
      return withUnauthorized();
    }

    const id = Number(params.id);
    const target = todos.find((todo) => todo.id === id);

    if (!target) {
      return HttpResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    todos = todos.filter((todo) => todo.id !== id);
    return HttpResponse.json(target);
  }),
];
