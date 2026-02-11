import { apiClient } from "@/lib/api/client";
import type {
  CreateTodoRequest,
  Todo,
  TodosResponse,
  UpdateTodoRequest,
} from "@/lib/types/todo";

export const getTodosByUser = (userId: number) =>
  apiClient
    .get<TodosResponse>(`/todos/user/${userId}`, {
      params: {
        limit: 0,
      },
    })
    .then((response) => response.data);

export const createTodo = (data: CreateTodoRequest) =>
  apiClient.post<Todo>("/todos/add", data).then((response) => response.data);

export const updateTodo = (id: number, data: UpdateTodoRequest) =>
  apiClient.put<Todo>(`/todos/${id}`, data).then((response) => response.data);

export const deleteTodo = (id: number) =>
  apiClient.delete<Todo>(`/todos/${id}`).then((response) => response.data);
