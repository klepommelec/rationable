
import { Skeleton } from "@/components/ui/skeleton";

export const CriteriaSkeleton = () => {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-accent border animate-fade-in">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2 pt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-10" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-40" />
    </div>
  );
};
