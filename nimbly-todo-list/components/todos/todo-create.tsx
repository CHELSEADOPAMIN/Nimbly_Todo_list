"use client";

import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

interface TodoCreateProps {
  onCreate: (todoText: string) => Promise<void>;
  isCreating: boolean;
}

export const TodoCreate = ({ onCreate, isCreating }: TodoCreateProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) {
      return;
    }

    const nextValue = value.trim();

    if (!nextValue) {
      return;
    }

    await onCreate(nextValue);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="todo-create" className="sr-only">
        Add a new task
      </label>
      <input
        id="todo-create"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isCreating}
        placeholder="Add a new task..."
        className="organic-pill-input h-10 w-full text-sm text-foreground placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label="Create task"
        disabled={isCreating}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-300 hover:bg-muted active:scale-95 disabled:opacity-50"
      >
        <Plus size={18} aria-hidden="true" />
      </button>
    </form>
  );
};
