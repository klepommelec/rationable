import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

const STEP_DURATION_MS = 2200;
const TRANSITION_MS = 350;
const TOTAL_STEPS = 6;

function ThinkingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-0.5 text-muted-foreground" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-dot-blink inline-block min-w-[0.25em]"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          .
        </span>
      ))}
    </span>
  );
}

export const OptionsLoadingSkeleton = () => {
  const { t } = useI18nUI();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrevious, setShowPrevious] = useState(false);
  const previousStepRef = useRef(0);

  useEffect(() => {
    if (currentStep >= TOTAL_STEPS - 1) return;
    const t1 = setTimeout(() => {
      previousStepRef.current = currentStep;
      setShowPrevious(true);
      setCurrentStep((s) => s + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(t1);
  }, [currentStep]);

  useEffect(() => {
    if (!showPrevious) return;
    const t2 = setTimeout(() => setShowPrevious(false), TRANSITION_MS);
    return () => clearTimeout(t2);
  }, [showPrevious]);

  const steps = [
    t('optionsLoading.thinkingStep1'),
    t('optionsLoading.thinkingStep2'),
    t('optionsLoading.thinkingStep3'),
    t('optionsLoading.thinkingStep4'),
    t('optionsLoading.thinkingStep5'),
    t('optionsLoading.thinkingStep6'),
  ];

  const previousStepIndex = previousStepRef.current;

  return (
    <div className="w-full max-w-full space-y-8 pt-8 pb-10 px-0 mx-0 min-h-[480px]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-500 shrink-0" />
          <span className="text-lg font-medium text-cyan-500">
            {t('optionsLoading.title')}
          </span>
        </div>
        <div className="overflow-hidden min-h-[2.75rem] flex flex-col justify-center">
          <div className="relative h-[2.75rem]">
            {showPrevious && (
              <div
                className="absolute inset-x-0 top-0 flex items-center text-sm text-muted-foreground animate-step-out"
                aria-hidden
              >
                <span>{steps[previousStepIndex]}</span>
                <ThinkingDots />
              </div>
            )}
            <div
              className={`flex items-center text-sm text-muted-foreground ${
                showPrevious ? 'absolute inset-x-0 top-0 animate-step-in' : ''
              }`}
            >
              <span>{steps[currentStep]}</span>
              <ThinkingDots />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton "Recommended" card - bordures et fond visibles */}
      <div className="rounded-xl border-2 border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full bg-muted" />
          <Skeleton className="h-7 w-56 bg-muted" />
        </div>
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-4/5 bg-muted" />
        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-5/6 bg-muted" />
            <Skeleton className="h-3 w-4/5 bg-muted" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-3/4 bg-muted" />
          </div>
        </div>
        <div className="pt-2">
          <Skeleton className="h-9 w-28 rounded-md bg-muted" />
        </div>
      </div>

      {/* Skeleton cartes de comparaison */}
      <div className="grid gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border-2 border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-32 bg-muted" />
              <Skeleton className="h-8 w-16 rounded-full bg-muted" />
            </div>
            <Skeleton className="h-4 w-full mb-2 bg-muted" />
            <Skeleton className="h-4 w-3/4 mb-4 bg-muted" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2 bg-muted" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full bg-muted" />
                  <Skeleton className="h-3 w-4/5 bg-muted" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2 bg-muted" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full bg-muted" />
                  <Skeleton className="h-3 w-3/4 bg-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Skeleton className="h-12 w-48 bg-muted" />
      </div>
    </div>
  );
};
