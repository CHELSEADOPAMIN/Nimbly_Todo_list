"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { getTodosByUser } from "@/lib/api/todos";
import {
  useTodoMutations,
  type TodoMutations,
} from "@/lib/hooks/use-todo-mutations";
import type { Todo, TodoView } from "@/lib/types/todo";

const PAGE_SIZE = 10;

const buildTodosQueryKey = (userId: number) => ["todos", userId] as const;

interface TodoBuckets {
  today: Todo[];
  history: Todo[];
}

export interface UseTodosResult extends TodoMutations {
  allTodos: Todo[];
  todos: Todo[];
  totalPages: number;
  totalCount: number;
  todayCount: number;
  historyCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  view: TodoView;
  setPage: (nextPage: number) => void;
  setView: (nextView: TodoView) => void;
}

export const useTodos = (userId: number): UseTodosResult => {
  const [view, setViewState] = useState<TodoView>("today");
  const [pageState, setPageState] = useState<number>(1);
  const queryKey = buildTodosQueryKey(userId);

  const todosQuery = useQuery({
    queryKey,
    queryFn: () => getTodosByUser(userId),
    enabled: userId > 0,
  });

  const allTodos = useMemo(() => todosQuery.data?.todos ?? [], [todosQuery.data]);

  const buckets = useMemo<TodoBuckets>(() => {
    return allTodos.reduce<TodoBuckets>(
      (accumulator, todo) => {
        const target = todo.completed ? "history" : "today";
        accumulator[target].push(todo);
        return accumulator;
      },
      { today: [], history: [] },
    );
  }, [allTodos]);

  const filteredTodos = view === "today" ? buckets.today : buckets.history;
  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));
  const page = Math.min(pageState, totalPages);

  const todos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTodos.slice(start, start + PAGE_SIZE);
  }, [filteredTodos, page]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(() => {
        const normalized = Number.isFinite(nextPage) ? Math.trunc(nextPage) : 1;
        return Math.min(Math.max(normalized, 1), totalPages);
      });
    },
    [totalPages],
  );

  const setView = useCallback((nextView: TodoView) => {
    setViewState(() => nextView);
    setPageState(() => 1);
  }, []);

  const mutations = useTodoMutations({
    userId,
    queryKey,
  });

  return {
    ...mutations,
    allTodos,
    todos,
    totalPages,
    totalCount: filteredTodos.length,
    todayCount: buckets.today.length,
    historyCount: buckets.history.length,
    isLoading: todosQuery.isLoading,
    isError: todosQuery.isError,
    error: todosQuery.error,
    page,
    view,
    setPage,
    setView,
  };
};
