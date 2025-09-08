import { useState, useEffect } from 'react';
import { getTrendingPrompts, TrendingPromptsResult } from '@/services/trendingPromptsService';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useContextualContent } from '@/hooks/useContextualContent';

// Get current week identifier for cache key
const getCurrentWeekKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  // ISO week calculation
  const startOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const isoWeek = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `${year}W${isoWeek.toString().padStart(2, '0')}`;
};

interface UseTrendingPromptsResult {
  prompts: string[];
  isLoading: boolean;
  error: boolean;
  countryName: string;
}

export const useTrendingPrompts = (): UseTrendingPromptsResult => {
  const { currentLanguage } = useI18nUI();
  const { context } = useContextualContent();
  const [result, setResult] = useState<UseTrendingPromptsResult>({
    prompts: [],
    isLoading: true,
    error: false,
    countryName: ''
  });

  useEffect(() => {
    const loadTrendingPrompts = async () => {
      setResult(prev => ({ ...prev, isLoading: true, error: false }));

      try {
        const weekKey = getCurrentWeekKey();
        const cacheKey = `trending_${context}_${currentLanguage}_${weekKey}`;
        
        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedData: TrendingPromptsResult = JSON.parse(cached);
            setResult({
              prompts: cachedData.prompts,
              isLoading: false,
              error: false,
              countryName: cachedData.countryName
            });
            return;
          } catch (parseError) {
            // Invalid cache, continue to fetch
            localStorage.removeItem(cacheKey);
          }
        }

        // Fetch new data
        const trendingData = await getTrendingPrompts(currentLanguage, context);
        
        if (trendingData && trendingData.prompts.length > 0) {
          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify(trendingData));
          
          setResult({
            prompts: trendingData.prompts,
            isLoading: false,
            error: false,
            countryName: trendingData.countryName
          });
        } else {
          setResult({
            prompts: [],
            isLoading: false,
            error: true,
            countryName: ''
          });
        }
      } catch (error) {
        console.error('Error loading trending prompts:', error);
        setResult({
          prompts: [],
          isLoading: false,
          error: true,
          countryName: ''
        });
      }
    };

    loadTrendingPrompts();
  }, [currentLanguage, context]);

  return result;
};