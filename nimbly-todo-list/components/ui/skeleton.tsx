import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
    />
  );
};
