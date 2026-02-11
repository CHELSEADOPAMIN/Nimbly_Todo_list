"use client";

import { useEffect } from "react";

interface TodosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TodosError({ error, reset }: TodosErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center px-4 py-10"
    >
      <section className="organic-card organic-card-main max-w-md space-y-4 p-8 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Workspace Error</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while rendering your todo workspace.
        </p>
        <button
          type="button"
          onClick={reset}
          className="organic-button inline-flex h-11 items-center justify-center px-6 text-sm font-bold"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
