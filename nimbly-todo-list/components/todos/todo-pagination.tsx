"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type PageToken = number | "...";

interface TodoPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export const buildPageTokens = (page: number, totalPages: number): PageToken[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PageToken[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    tokens.push("...");
  }

  for (let cursor = start; cursor <= end; cursor += 1) {
    tokens.push(cursor);
  }

  if (end < totalPages - 1) {
    tokens.push("...");
  }

  tokens.push(totalPages);
  return tokens;
};

export const TodoPagination = ({ page, totalPages, onPageChange }: TodoPaginationProps) => {
  const isPreviousDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;
  const tokens = buildPageTokens(page, totalPages);

  return (
    <nav aria-label="Todo pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={isPreviousDisabled}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-primary transition-all duration-200",
          isPreviousDisabled
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-muted active:scale-95",
        )}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </button>

      {tokens.map((token, index) => {
        if (typeof token === "number") {
          return (
            <button
              key={`${token}-${index}`}
              type="button"
              aria-current={token === page ? "page" : undefined}
              onClick={() => onPageChange(token)}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                token === page
                  ? "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_rgba(93,112,82,0.3)]"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {token}
            </button>
          );
        }

        return (
          <span key={`${token}-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={isNextDisabled}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-primary transition-all duration-200",
          isNextDisabled ? "cursor-not-allowed opacity-40" : "hover:bg-muted active:scale-95",
        )}
      >
        <ChevronRight size={16} aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  );
};
