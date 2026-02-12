import { QueryClient } from "@tanstack/react-query";
import {
  applyLocalDelete,
  applyLocalUpdate,
  createOptimisticTodo,
  resolveCreatedTodoId,
  rollbackIfNeeded,
  sanitizeUpdatePayload,
  withFallbackResponse,
} from "@/lib/hooks/todo-mutation-helpers";
import type { Todo, TodosResponse } from "@/lib/types/todo";
import { describe, expect, it } from "vitest";

const queryKey = ["todos", 1] as const;

const buildTodosResponse = (todos: Todo[], total = todos.length): TodosResponse => ({
  todos,
  total,
  skip: 0,
  limit: 10,
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
describe("withFallbackResponse", () => {
  it("should return existing response unchanged", () => {
    const response = buildTodosResponse([{ id: 1, todo: "Task", completed: false, userId: 1 }]);
    expect(withFallbackResponse(response)).toBe(response);
  });

  it("should return empty fallback response for undefined", () => {
    expect(withFallbackResponse()).toEqual({ todos: [], total: 0, skip: 0, limit: 0 });
  });
});

describe("createOptimisticTodo", () => {
  it("should create optimistic todo with a negative id", () => {
    const todo = createOptimisticTodo({ todo: "Optimistic", completed: false, userId: 1 });
    expect(todo.id).toBeLessThan(0);
  });

  it("should generate decreasing ids across consecutive calls", () => {
    const first = createOptimisticTodo({ todo: "A", completed: false, userId: 1 });
    const second = createOptimisticTodo({ todo: "B", completed: false, userId: 1 });
    expect(second.id).toBeLessThan(first.id);
  });

  it("should map todo/completed/userId fields correctly", () => {
    const todo = createOptimisticTodo({ todo: "Mapped", completed: true, userId: 9 });
    expect(todo).toMatchObject({ todo: "Mapped", completed: true, userId: 9 });
  });
});

describe("sanitizeUpdatePayload", () => {
  it("should keep valid todo string", () => {
    expect(sanitizeUpdatePayload({ todo: "Title" })).toEqual({ todo: "Title" });
  });

  it("should trim leading and trailing whitespace", () => {
    expect(sanitizeUpdatePayload({ todo: "  Trim me  " })).toEqual({ todo: "Trim me" });
  });

  it("should return null when todo is empty string", () => {
    expect(sanitizeUpdatePayload({ todo: "   " })).toBeNull();
  });

  it("should keep completed boolean", () => {
    expect(sanitizeUpdatePayload({ completed: false })).toEqual({ completed: false });
  });

  it("should return null when payload has no valid fields", () => {
    expect(sanitizeUpdatePayload({})).toBeNull();
  });

  it("should ignore non-string todo and non-boolean completed", () => {
    const invalidPayload = { todo: 123 as unknown as string, completed: "yes" as unknown as boolean };
    expect(sanitizeUpdatePayload(invalidPayload)).toBeNull();
  });
});

describe("resolveCreatedTodoId", () => {
  it("should return createdId when no conflict exists", () => {
    const todos = [{ id: -5, todo: "Optimistic", completed: false, userId: 1 }];
    expect(resolveCreatedTodoId(todos, -5, 120)).toBe(120);
  });

  it("should return optimisticId when createdId already exists in list", () => {
    const todos = [
      { id: -5, todo: "Optimistic", completed: false, userId: 1 },
      { id: 255, todo: "Existing", completed: false, userId: 1 },
    ];
    expect(resolveCreatedTodoId(todos, -5, 255)).toBe(-5);
  });

  it("should preserve optimistic id for DummyJSON id=255 even without collisions", () => {
    const todos = [{ id: -3, todo: "New optimistic", completed: false, userId: 1 }];
    expect(resolveCreatedTodoId(todos, -3, 255)).toBe(-3);
  });
});

describe("applyLocalUpdate", () => {
  it("should update target todo in QueryClient cache", () => {
    const client = createQueryClient();
    client.setQueryData(queryKey, buildTodosResponse([{ id: 1, todo: "Old", completed: false, userId: 1 }]));
    applyLocalUpdate(client, queryKey, 1, { todo: "New" });
    const updated = client.getQueryData<TodosResponse>(queryKey);
    expect(updated?.todos[0].todo).toBe("New");
  });

  it("should update only payload fields and keep other fields", () => {
    const client = createQueryClient();
    client.setQueryData(
      queryKey,
      buildTodosResponse([{ id: 1, todo: "Keep", completed: false, userId: 42 }]),
    );

    applyLocalUpdate(client, queryKey, 1, { completed: true });

    const updated = client.getQueryData<TodosResponse>(queryKey)?.todos[0];
    expect(updated).toEqual({ id: 1, todo: "Keep", completed: true, userId: 42 });
  });

  it("should not crash when cache is empty", () => {
    const client = createQueryClient();
    expect(() => applyLocalUpdate(client, queryKey, 1, { todo: "No cache" })).not.toThrow();
    expect(client.getQueryData(queryKey)).toBeUndefined();
  });
});

describe("applyLocalDelete", () => {
  it("should remove target todo from cache", () => {
    const client = createQueryClient();
    client.setQueryData(
      queryKey,
      buildTodosResponse(
        [
          { id: 1, todo: "Keep", completed: false, userId: 1 },
          { id: 2, todo: "Delete", completed: false, userId: 1 },
        ],
        2,
      ),
    );

    applyLocalDelete(client, queryKey, 2);
    const updated = client.getQueryData<TodosResponse>(queryKey);
    expect(updated?.todos).toEqual([{ id: 1, todo: "Keep", completed: false, userId: 1 }]);
  });

  it("should decrease total by 1", () => {
    const client = createQueryClient();
    client.setQueryData(queryKey, buildTodosResponse([{ id: 1, todo: "Task", completed: false, userId: 1 }], 1));
    applyLocalDelete(client, queryKey, 1);
    expect(client.getQueryData<TodosResponse>(queryKey)?.total).toBe(0);
  });

  it("should not let total go below 0", () => {
    const client = createQueryClient();
    client.setQueryData(queryKey, buildTodosResponse([], 0));

    applyLocalDelete(client, queryKey, 1);
    expect(client.getQueryData<TodosResponse>(queryKey)?.total).toBe(0);
  });

  it("should not crash when cache is empty", () => {
    const client = createQueryClient();
    expect(() => applyLocalDelete(client, queryKey, 1)).not.toThrow();
    expect(client.getQueryData(queryKey)).toBeUndefined();
  });
});

describe("rollbackIfNeeded", () => {
  it("should rollback cache to context.previous", () => {
    const client = createQueryClient();
    const previous = buildTodosResponse([{ id: 1, todo: "Previous", completed: false, userId: 1 }], 1);
    client.setQueryData(queryKey, buildTodosResponse([{ id: 1, todo: "Current", completed: true, userId: 1 }], 1));
    rollbackIfNeeded(client, queryKey, { previous });
    expect(client.getQueryData<TodosResponse>(queryKey)).toEqual(previous);
  });

  it("should do nothing when context is undefined", () => {
    const client = createQueryClient();
    const current = buildTodosResponse([{ id: 1, todo: "Current", completed: false, userId: 1 }], 1);
    client.setQueryData(queryKey, current);
    rollbackIfNeeded(client, queryKey, undefined);
    expect(client.getQueryData<TodosResponse>(queryKey)).toEqual(current);
  });
});
