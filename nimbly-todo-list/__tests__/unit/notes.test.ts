import { getNote, removeNote, setNote } from "@/lib/notes";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Notes Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should store and retrieve note by todoId", () => {
    setNote(1, "Meeting notes");
    expect(getNote(1)).toBe("Meeting notes");
  });

  it("should return empty string when note does not exist", () => {
    expect(getNote(999)).toBe("");
  });

  it("should remove note by todoId", () => {
    setNote(1, "Need to remove");
    removeNote(1);
    expect(getNote(1)).toBe("");
  });

  it("should use a versioned key prefix", () => {
    setNote(42, "Versioned key");
    expect(localStorage.getItem("nimbly:notes:v1:42")).toBe("Versioned key");
  });

  it("notes for different todoIds should be isolated", () => {
    setNote(1, "First");
    setNote(2, "Second");

    expect(getNote(1)).toBe("First");
    expect(getNote(2)).toBe("Second");
  });

  it("should not throw when window is unavailable", () => {
    vi.stubGlobal("window", undefined);

    expect(() => setNote(1, "safe")).not.toThrow();
    expect(() => removeNote(1)).not.toThrow();
    expect(getNote(1)).toBe("");
  });
});
