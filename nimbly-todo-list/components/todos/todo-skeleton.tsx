import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_WIDTHS = [
  "w-[42%]",
  "w-[58%]",
  "w-[36%]",
  "w-[64%]",
  "w-[48%]",
  "w-[54%]",
  "w-[38%]",
  "w-[68%]",
  "w-[44%]",
  "w-[61%]",
] as const;

export const TodoSkeleton = () => {
  return (
    <div className="space-y-1 py-2" aria-hidden="true">
      {SKELETON_WIDTHS.map((width, index) => (
        <div key={`${width}-${index}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className={`h-4 rounded-full ${width}`} />
        </div>
      ))}
    </div>
  );
};
