import type { QueryClient } from "@tanstack/react-query";
import type { CreateTodoRequest, Todo, TodosResponse, UpdateTodoRequest } from "@/lib/types/todo";

export type TodosQueryKey = readonly ["todos", number];

type MutationContext = { previous: TodosResponse | undefined };

let optimisticIdSeed = -1;

export const withFallbackResponse = (response?: TodosResponse): TodosResponse => {
  return response ?? { todos: [], total: 0, skip: 0, limit: 0 };
};

const getNextOptimisticId = () => {
  optimisticIdSeed -= 1;
  return optimisticIdSeed;
};

export const createOptimisticTodo = (input: CreateTodoRequest): Todo => {
  return {
    id: getNextOptimisticId(),
    todo: input.todo,
    completed: input.completed,
    userId: input.userId,
  };
};

export const rollbackIfNeeded = (
  queryClient: QueryClient,
  queryKey: TodosQueryKey,
  context?: MutationContext,
) => {
  if (context) {
    queryClient.setQueryData(queryKey, context.previous);
  }
};

export const sanitizeUpdatePayload = (data: UpdateTodoRequest): UpdateTodoRequest | null => {
  const payload: UpdateTodoRequest = {};

  if (typeof data.todo === "string") {
    const title = data.todo.trim();
    if (title) {
      payload.todo = title;
    }
  }

  if (typeof data.completed === "boolean") {
    payload.completed = data.completed;
  }

  return Object.keys(payload).length ? payload : null;
};

export const applyLocalUpdate = (
  queryClient: QueryClient,
  queryKey: TodosQueryKey,
  id: number,
  payload: UpdateTodoRequest,
) => {
  queryClient.setQueryData<TodosResponse>(queryKey, (oldValue) => {
    if (!oldValue) {
      return oldValue;
    }

    return {
      ...oldValue,
      todos: oldValue.todos.map((todo) => (todo.id === id ? { ...todo, ...payload } : todo)),
    };
  });
};

export const applyLocalDelete = (queryClient: QueryClient, queryKey: TodosQueryKey, id: number) => {
  queryClient.setQueryData<TodosResponse>(queryKey, (oldValue) => {
    if (!oldValue) {
      return oldValue;
    }

    return {
      ...oldValue,
      todos: oldValue.todos.filter((todo) => todo.id !== id),
      total: Math.max(0, oldValue.total - 1),
    };
  });
};

export const resolveCreatedTodoId = (
  todos: Todo[],
  optimisticId: number,
  createdId: number,
): number => {
  // DummyJSON returns id=255 for created todos, but that id is not persisted
  // and cannot be updated/deleted afterward (404). Keep optimistic id local.
  if (createdId === 255) {
    return optimisticId;
  }

  // DummyJSON can return a repeated id (e.g. 255) for every POST /todos/add.
  // Preserve the optimistic id when a collision is detected to keep list identity stable.
  const hasCollision = todos.some((todo) => todo.id === createdId && todo.id !== optimisticId);
  return hasCollision ? optimisticId : createdId;
};
