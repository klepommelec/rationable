import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IResult } from '@/types/decision';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface DataAccuracyIndicatorProps {
  /** Optionnel en chargement : on n'affiche que "Created on ... by ..." */
  result?: IResult | null;
  currentDecision?: any;
  className?: string;
}

export const DataAccuracyIndicator: React.FC<DataAccuracyIndicatorProps> = ({
  result,
  currentDecision,
  className = ''
}) => {
  const { t, getLocaleTag } = useI18nUI();

  const formatDateOnly = (timestamp: number | string | undefined) => {
    if (!timestamp) return '—';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString(getLocaleTag(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number | string | undefined) => {
    if (!timestamp) return '—';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString(getLocaleTag(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const creationTimestamp = currentDecision?.timestamp;
  const author = currentDecision?.createdByName || currentDecision?.author || '—';
  const updateTimestamp = currentDecision?.updatedAt || result?.realTimeData?.timestamp;
  const updatedBy = currentDecision?.updatedByName || currentDecision?.updatedBy || '—';
  const hasUpdates = !!currentDecision?.updatedAt || !!result?.realTimeData?.timestamp;

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Layout mobile */}
        <div className="block sm:hidden px-1">
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-1">
              <span>{t('dataAccuracy.createdOn')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="underline decoration-dotted cursor-help">
                    {formatDateOnly(creationTimestamp)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDateTime(creationTimestamp)}</p>
                </TooltipContent>
              </Tooltip>
              <span>{t('dataAccuracy.by')} {author}</span>
            </div>
            {hasUpdates && (
              <div className="flex flex-wrap items-center gap-x-1">
                <span>{t('dataAccuracy.updatedOn')}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">
                      {formatDateOnly(updateTimestamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatDateTime(updateTimestamp)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        {/* Layout desktop */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-4 pt-2 pb-2">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <span className="flex-shrink-0">{t('dataAccuracy.createdOn')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="underline decoration-dotted cursor-help flex-shrink-0">
                    {formatDateOnly(creationTimestamp)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDateTime(creationTimestamp)}</p>
                </TooltipContent>
              </Tooltip>
              <span className="flex-shrink-0">{t('dataAccuracy.by')}</span>
              <span className="truncate min-w-0" title={author}>{author}</span>
              {hasUpdates && (
                <>
                  <span className="flex-shrink-0">, {t('dataAccuracy.updatedOn')}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline decoration-dotted cursor-help flex-shrink-0">
                        {formatDateOnly(updateTimestamp)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatDateTime(updateTimestamp)}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
