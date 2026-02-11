const NOTES_KEY_PREFIX = "nimbly:notes:v1:";

const getNoteKey = (todoId: number) => `${NOTES_KEY_PREFIX}${todoId}`;

const canUseStorage = () => typeof window !== "undefined";

export const getNote = (todoId: number) => {
  if (!canUseStorage()) {
    return "";
  }

  return window.localStorage.getItem(getNoteKey(todoId)) ?? "";
};

export const setNote = (todoId: number, content: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(getNoteKey(todoId), content);
};

export const removeNote = (todoId: number) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(getNoteKey(todoId));
};
