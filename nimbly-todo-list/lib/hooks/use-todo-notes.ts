"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNote, setNote as persistNote } from "@/lib/notes";

const NOTE_SAVE_DELAY = 300;

export const useTodoNotes = (todoId: number | null) => {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const persistedSnapshotRef = useRef<Record<number, string>>({});

  const note = useMemo(() => {
    if (!todoId) {
      return "";
    }

    return drafts[todoId] ?? getNote(todoId);
  }, [drafts, todoId]);

  const setNote = useCallback(
    (value: string) => {
      if (!todoId) {
        return;
      }

      setDrafts((previous) => ({
        ...previous,
        [todoId]: value,
      }));
    },
    [todoId],
  );

  useEffect(() => {
    if (!todoId) {
      return;
    }

    if (persistedSnapshotRef.current[todoId] === undefined) {
      persistedSnapshotRef.current[todoId] = getNote(todoId);
    }
  }, [todoId]);

  useEffect(() => {
    if (!todoId) {
      return;
    }

    const timer = window.setTimeout(() => {
      const previousNote =
        persistedSnapshotRef.current[todoId] ?? getNote(todoId);

      if (previousNote === note) {
        return;
      }

      persistNote(todoId, note);
      persistedSnapshotRef.current[todoId] = note;
    }, NOTE_SAVE_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [note, todoId]);

  return {
    note,
    setNote,
  };
};
