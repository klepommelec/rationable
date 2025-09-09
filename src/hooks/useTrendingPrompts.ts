import { useState, useEffect } from 'react';
import { getTrendingPrompts, TrendingPromptsResult } from '@/services/trendingPromptsService';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useContextualContent } from '@/hooks/useContextualContent';
import { useRealTimeSearchSettings } from '@/hooks/useRealTimeSearchSettings';
import { SupportedLanguage } from '@/services/i18nService';

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
  const { realTimeSearchEnabled } = useRealTimeSearchSettings();
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

      // Only fetch fresh data if real-time search is enabled
      if (realTimeSearchEnabled) {
        console.log('🔍 Fetching fresh trending prompts for', currentLanguage, context);
        const trendingData = await getTrendingPrompts(currentLanguage, context);
        
        if (trendingData && trendingData.prompts.length >= 3) {
          // Cache the result with all prompts for daily rotation
          const cacheData = {
            ...trendingData,
            allPrompts: trendingData.prompts
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          
          // Always show exactly 3 prompts from daily rotation
          const dayOfWeek = new Date().getDay();
          const startIndex = dayOfWeek % Math.max(1, (trendingData.prompts.length - 2));
          const displayPrompts = trendingData.prompts.slice(startIndex, startIndex + 3);
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
            prompts: getFallbackPrompts(currentLanguage, context),
            isLoading: false,
            error: false,
            countryName: ''
          }));
        }
      } else {
        console.log('🚫 Real-time search disabled - using fallback prompts');
        // Load fallback prompts when real-time search is disabled
        const fallbackPrompts = getFallbackPrompts(currentLanguage, context);
        setResult(prev => ({
          ...prev,
          prompts: fallbackPrompts,
          isLoading: false,
          error: false,
          countryName: ''
        }));
      }
    } catch (error) {
      console.error('Error loading trending prompts:', error);
      setResult(prev => ({
        ...prev,
        prompts: getFallbackPrompts(currentLanguage, context),
        isLoading: false,
        error: false,
        countryName: ''
      }));
    }
  };

  useEffect(() => {
    loadTrendingPrompts();
  }, [currentLanguage, context, realTimeSearchEnabled]);

  return result;
};

// Fallback prompts function
const getFallbackPrompts = (currentLanguage: SupportedLanguage, context: 'personal' | 'professional'): string[] => {
  const fallbackPrompts = {
    professional: {
      fr: [
        "Dois-je changer de carrière professionnelle ?",
        "Faut-il investir dans de nouveaux outils pour mon équipe ?",
        "Dois-je accepter cette proposition de partenariat ?"
      ],
      en: [
        "Should I change my professional career?",
        "Should I invest in new tools for my team?",
        "Should I accept this partnership proposal?"
      ],
      es: [
        "¿Debería cambiar mi carrera profesional?",
        "¿Debería invertir en nuevas herramientas para mi equipo?",
        "¿Debería aceptar esta propuesta de asociación?"
      ],
      it: [
        "Dovrei cambiare la mia carriera professionale?",
        "Dovrei investire in nuovi strumenti per il mio team?",
        "Dovrei accettare questa proposta di partnership?"
      ],
      de: [
        "Sollte ich meine berufliche Laufbahn ändern?",
        "Sollte ich in neue Tools für mein Team investieren?",
        "Sollte ich diesen Partnerschaftsvorschlag annehmen?"
      ]
    },
    personal: {
      fr: [
        "Dois-je déménager dans une nouvelle ville ?",
        "Faut-il que j'adopte un animal de compagnie ?",
        "Dois-je reprendre mes études ?"
      ],
      en: [
        "Should I move to a new city?",
        "Should I adopt a pet?",
        "Should I go back to school?"
      ],
      es: [
        "¿Debería mudarme a una nueva ciudad?",
        "¿Debería adoptar una mascota?",
        "¿Debería volver a estudiar?"
      ],
      it: [
        "Dovrei trasferirmi in una nuova città?",
        "Dovrei adottare un animale domestico?",
        "Dovrei tornare a studiare?"
      ],
      de: [
        "Sollte ich in eine neue Stadt ziehen?",
        "Sollte ich ein Haustier adoptieren?",
        "Sollte ich wieder studieren?"
      ]
    }
  };

  return fallbackPrompts[context][currentLanguage] || fallbackPrompts[context]['fr'];
};