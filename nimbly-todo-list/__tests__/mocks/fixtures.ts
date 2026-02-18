import type { User } from "@/lib/types/auth";
import type { Todo, TodosResponse } from "@/lib/types/todo";

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Stone",
  image: "https://cdn.example.com/emily.png",
  ...overrides,
});

export const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  todo: "Test task",
  completed: false,
  userId: 1,
  ...overrides,
});

export const buildTodos = (
  count: number,
  completedCount: number,
  userId = 1,
): Todo[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const completed = id > count - completedCount;

    return buildTodo({
      id,
      todo: `Task ${id}`,
      completed,
      userId,
    });
  });
};

export const buildTodosResponse = (
  count: number,
  completedCount: number,
): TodosResponse => {
  const todos = buildTodos(count, completedCount);

  return {
    todos,
    total: todos.length,
    skip: 0,
    limit: 0,
  };
};

export const seedTodos = () => buildTodos(25, 10, 1);
