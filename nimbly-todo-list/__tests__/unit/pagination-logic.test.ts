import { buildPageTokens } from "@/components/todos/todo-pagination";
import { describe, expect, it } from "vitest";

describe("buildPageTokens pagination token generation", () => {
  it("should return all page numbers [1,2,3,4,5,6,7] when totalPages <= 7", () => {
    expect(buildPageTokens(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("should return [1] when totalPages is 1", () => {
    expect(buildPageTokens(1, 1)).toEqual([1]);
  });

  it("should return [1,2,'...',10] for totalPages=10 and page=1", () => {
    expect(buildPageTokens(1, 10)).toEqual([1, 2, "...", 10]);
  });

  it("should return [1,'...',4,5,6,'...',10] for totalPages=10 and page=5", () => {
    expect(buildPageTokens(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });

  it("should return [1,'...',9,10] for totalPages=10 and page=10", () => {
    expect(buildPageTokens(10, 10)).toEqual([1, "...", 9, 10]);
  });

  it("should return [1,2,3,'...',10] for totalPages=10 and page=2", () => {
    expect(buildPageTokens(2, 10)).toEqual([1, 2, 3, "...", 10]);
  });

  it("should return [1,'...',8,9,10] for totalPages=10 and page=9", () => {
    expect(buildPageTokens(9, 10)).toEqual([1, "...", 8, 9, 10]);
  });
});
