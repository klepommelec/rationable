
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

export const OptionsLoadingSkeleton = () => {
  const { t } = useI18nUI();
  return (
    <div className="space-y-6 animate-fade-in pt-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-500 shrink-0" />
          <span className="text-lg font-medium text-cyan-500">
            {t('optionsLoading.title')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('optionsLoading.subtitle')}
        </p>
      </div>

      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
};
