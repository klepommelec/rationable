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

// Helper to get country code from language
const getCountryCode = (language: string): string => {
  // Extract country code from language (e.g., 'fr-FR' -> 'FR', 'en-US' -> 'US')
  const parts = language.split('-');
  return parts.length > 1 ? parts[1] : parts[0].toUpperCase();
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
  const [result, setResult] = useState({
    prompts: [] as string[],
    isLoading: true,
    error: false,
    countryName: ''
  });


  const loadTrendingPrompts = async () => {
    setResult(prev => ({ ...prev, isLoading: true, error: false }));

    try {
      const weekKey = getCurrentWeekKey();
      const countryCode = getCountryCode(currentLanguage);
      const cacheKey = `trending_${context}_${countryCode}_${currentLanguage}_${weekKey}`;
      
      // Check cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData: TrendingPromptsResult & { allPrompts?: string[] } = JSON.parse(cached);
          
          // If we have cached data with multiple prompts, rotate daily
          if (cachedData.allPrompts && cachedData.allPrompts.length >= 3) {
            const dayOfWeek = new Date().getDay();
            const startIndex = dayOfWeek % (cachedData.allPrompts.length - 2);
            const dailyPrompts = cachedData.allPrompts.slice(startIndex, startIndex + 3);
            
            setResult(prev => ({
              ...prev,
              prompts: dailyPrompts,
              isLoading: false,
              error: false,
              countryName: cachedData.countryName
            }));
            return;
          }
          
          // Fallback to cached prompts if no rotation available
          setResult(prev => ({
            ...prev,
            prompts: cachedData.prompts,
            isLoading: false,
            error: false,
            countryName: cachedData.countryName
          }));
          return;
        } catch (parseError) {
          // Invalid cache, continue to fetch
          localStorage.removeItem(cacheKey);
        }
      }

      // Fetch new data
      const trendingData = await getTrendingPrompts(currentLanguage, context);
      
      if (trendingData && trendingData.prompts.length >= 3) {
        // Cache the result with all prompts for daily rotation
        const cacheData = {
          ...trendingData,
          allPrompts: trendingData.prompts
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        // Always show exactly 3 prompts
        const displayPrompts = trendingData.prompts.slice(0, 3);
        setResult(prev => ({
          ...prev,
          prompts: displayPrompts,
          isLoading: false,
          error: false,
          countryName: trendingData.countryName
        }));
      } else {
        // This shouldn't happen anymore with fallbacks, but keep as safety
        setResult(prev => ({
          ...prev,
          prompts: [],
          isLoading: false,
          error: true,
          countryName: ''
        }));
      }
    } catch (error) {
      console.error('Error loading trending prompts:', error);
      setResult(prev => ({
        ...prev,
        prompts: [],
        isLoading: false,
        error: true,
        countryName: ''
      }));
    }
  };

  useEffect(() => {
    loadTrendingPrompts();
  }, [currentLanguage, context]);

  return result;
};