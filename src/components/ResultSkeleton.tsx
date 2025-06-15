
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ResultSkeleton = () => {
  return (
    <Card className="mt-8 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-7 w-1/3 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-accent border">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-1/3" />
        {[...Array(2)].map((_, index) => (
          <div key={index} className="p-4 rounded-lg bg-accent border space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div>
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
