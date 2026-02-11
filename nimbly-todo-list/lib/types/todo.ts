export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface TodosResponse {
  todos: Todo[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateTodoRequest {
  todo: string;
  completed: boolean;
  userId: number;
}

export interface UpdateTodoRequest {
  todo?: string;
  completed?: boolean;
}

export type TodoView = "today" | "history";
