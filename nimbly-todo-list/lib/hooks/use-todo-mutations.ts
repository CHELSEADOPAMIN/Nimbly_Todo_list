"use client";

import { useMutation, useMutationState, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  updateTodo as updateTodoRequest,
} from "@/lib/api/todos";
import {
  applyLocalDelete,
  applyLocalUpdate,
  createOptimisticTodo,
  resolveCreatedTodoId,
  rollbackIfNeeded,
  sanitizeUpdatePayload,
  withFallbackResponse,
  type TodosQueryKey,
} from "@/lib/hooks/todo-mutation-helpers";
import type { TodosResponse, UpdateTodoRequest } from "@/lib/types/todo";

type MutationContext = { previous: TodosResponse | undefined };
type CreateMutationContext = MutationContext & { optimisticId: number };

interface UpdateTodoInput {
  id: number;
  data: UpdateTodoRequest;
}

interface UseTodoMutationsOptions {
  userId: number;
  queryKey: TodosQueryKey;
}

export interface TodoMutations {
  createTodo: (todoText: string) => Promise<void>;
  updateTodo: (id: number, data: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  isTodoUpdating: (id: number | null | undefined) => boolean;
  isTodoDeleting: (id: number | null | undefined) => boolean;
  isCreating: boolean;
}

export const useTodoMutations = ({
  userId,
  queryKey,
}: UseTodoMutationsOptions): TodoMutations => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: [...queryKey, "create"],
    mutationFn: createTodoRequest,
    onMutate: async (newTodo): Promise<CreateMutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodosResponse>(queryKey);
      const optimisticTodo = createOptimisticTodo(newTodo);

      queryClient.setQueryData<TodosResponse>(queryKey, (oldValue) => {
        const current = withFallbackResponse(oldValue);
        return {
          ...current,
          todos: [optimisticTodo, ...current.todos],
          total: current.total + 1,
        };
      });

      return { previous, optimisticId: optimisticTodo.id };
    },
    onError: (_error, _variables, context) => {
      rollbackIfNeeded(queryClient, queryKey, context);
    },
    onSuccess: (createdTodo, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData<TodosResponse>(queryKey, (oldValue) => {
        if (!oldValue) {
          return oldValue;
        }

        const mergedId = resolveCreatedTodoId(
          oldValue.todos,
          context.optimisticId,
          createdTodo.id,
        );

        return {
          ...oldValue,
          todos: oldValue.todos.map((todo) =>
            todo.id === context.optimisticId ? { ...createdTodo, id: mergedId } : todo,
          ),
        };
      });
    },
  });

  const updateMutation = useMutation({
    mutationKey: [...queryKey, "update"],
    mutationFn: ({ id, data }: UpdateTodoInput) => updateTodoRequest(id, data),
    onMutate: async ({ id, data }): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodosResponse>(queryKey);
      applyLocalUpdate(queryClient, queryKey, id, data);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      rollbackIfNeeded(queryClient, queryKey, context);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: [...queryKey, "delete"],
    mutationFn: deleteTodoRequest,
    onMutate: async (id): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TodosResponse>(queryKey);
      applyLocalDelete(queryClient, queryKey, id);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      rollbackIfNeeded(queryClient, queryKey, context);
    },
  });

  const createTodo = useCallback(
    async (todoText: string) => {
      const value = todoText.trim();

      if (!value || userId <= 0) {
        return;
      }

      await createMutation.mutateAsync({ todo: value, completed: false, userId });
    },
    [createMutation, userId],
  );

  const updateTodo = useCallback(
    async (id: number, data: UpdateTodoRequest) => {
      const payload = sanitizeUpdatePayload(data);

      if (!payload || id === 0) {
        return;
      }

      if (id < 0) {
        applyLocalUpdate(queryClient, queryKey, id, payload);
        return;
      }

      await updateMutation.mutateAsync({ id, data: payload });
    },
    [queryClient, queryKey, updateMutation],
  );

  const deleteTodo = useCallback(
    async (id: number) => {
      if (id === 0) {
        return;
      }

      if (id < 0) {
        applyLocalDelete(queryClient, queryKey, id);
        return;
      }

      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation, queryClient, queryKey],
  );

  const pendingUpdateVariables = useMutationState<UpdateTodoInput | undefined>({
    filters: { mutationKey: [...queryKey, "update"], status: "pending" },
    select: (mutation) => mutation.state.variables as UpdateTodoInput | undefined,
  });

  const pendingDeleteVariables = useMutationState<number | undefined>({
    filters: { mutationKey: [...queryKey, "delete"], status: "pending" },
    select: (mutation) => mutation.state.variables as number | undefined,
  });

  const updatingIds = useMemo(() => {
    const ids = new Set<number>();
    pendingUpdateVariables.forEach((variables) => {
      if (variables?.id) {
        ids.add(variables.id);
      }
    });
    return ids;
  }, [pendingUpdateVariables]);

  const deletingIds = useMemo(() => {
    const ids = new Set<number>();
    pendingDeleteVariables.forEach((id) => {
      if (typeof id === "number" && id !== 0) {
        ids.add(id);
      }
    });
    return ids;
  }, [pendingDeleteVariables]);

  const isTodoUpdating = useCallback(
    (id: number | null | undefined) => {
      return typeof id === "number" ? updatingIds.has(id) : false;
    },
    [updatingIds],
  );

  const isTodoDeleting = useCallback(
    (id: number | null | undefined) => {
      return typeof id === "number" ? deletingIds.has(id) : false;
    },
    [deletingIds],
  );

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    isTodoUpdating,
    isTodoDeleting,
    isCreating: createMutation.isPending,
  };
};
