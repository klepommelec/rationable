import { supabase } from '@/integrations/supabase/client';
import { I18nService, SupportedLanguage } from './i18nService';
import { searchCacheService } from './searchCacheService';
import { LinkVerifierService } from './linkVerifierService';

export interface FirstResultResponse {
  url: string;
  title: string;
  sourceProvider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  fromCache: boolean;
}

export interface FirstResultOptions {
  optionName: string;
  dilemma: string;
  language?: SupportedLanguage;
  vertical?: 'dining' | 'accommodation' | 'travel' | 'automotive' | 'software' | null;
}

class FirstResultService {
  async getFirstResultUrl({ optionName, dilemma, language, vertical }: FirstResultOptions): Promise<FirstResultResponse> {
    // 1. Detect language if not provided
    const detectedLanguage = language || I18nService.detectLanguage(dilemma + ' ' + optionName);
    
    // 2. Detect vertical if not provided
    const detectedVertical = vertical || I18nService.detectVertical(dilemma + ' ' + optionName);
    
    // 3. Build optimized search query
    const query = this.buildOptimizedQuery(optionName, detectedVertical, detectedLanguage);
    
    // 4. Check cache first
    const cacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}`;
    const cached = searchCacheService.get(cacheKey);
    if (cached) {
      try {
        // Verify cached URL is still valid
        const verified = await LinkVerifierService.verifyLinks([{ url: cached.content.url, title: cached.content.title }]);
        if (verified.validLinks.length > 0) {
          return {
            url: verified.validLinks[0].url,
            title: cached.content.title,
            sourceProvider: cached.provider as any,
            fromCache: true
          };
        } else {
          console.log(`🗑️ Cached URL no longer valid: ${cached.content.url}`);
          searchCacheService.clear(); // Clear invalid cached entry
        }
      } catch (error) {
        console.log(`⚠️ Error verifying cached URL: ${error.message}`);
      }
    }

    // 5. Call edge function for fresh results
    try {
      console.log(`🔍 Searching for: "${query}" (${detectedLanguage}, ${detectedVertical})`);
      
      const { data, error } = await supabase.functions.invoke('first-web-result', {
        body: {
          query,
          language: detectedLanguage,
          vertical: detectedVertical,
          numResults: 3
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data?.results?.length) {
        throw new Error('No results returned from search');
      }

      // 6. Verify results and find first valid one
      const linksToVerify = data.results.map((r: any) => ({ url: r.url, title: r.title }));
      const verified = await LinkVerifierService.verifyLinks(linksToVerify);
      
      let validResult = null;
      if (verified.validLinks.length > 0) {
        const firstValidLink = verified.validLinks[0];
        const originalResult = data.results.find((r: any) => r.url === firstValidLink.url || r.title === firstValidLink.title);
        validResult = {
          ...originalResult,
          url: firstValidLink.url,
          title: firstValidLink.title
        };
      }

      if (validResult) {
        // Cache the valid result
        searchCacheService.set(
          cacheKey, 
          detectedVertical || 'general', 
          { url: validResult.url, title: validResult.title }, 
          data.provider
        );

        return {
          url: validResult.url,
          title: validResult.title,
          sourceProvider: data.provider,
          fromCache: false
        };
      } else {
        throw new Error('No valid URLs found in search results');
      }
    } catch (error) {
      console.error(`❌ FirstResultService error for "${optionName}":`, error);
      
      // Fallback to Google search page
      const fallbackUrl = I18nService.buildGoogleWebUrl(query, detectedLanguage);
      return {
        url: fallbackUrl,
        title: `Rechercher "${optionName}"`,
        sourceProvider: 'perplexity', // arbitrary fallback
        fromCache: false
      };
    }
  }

  private buildOptimizedQuery(optionName: string, vertical: string | null, language: SupportedLanguage): string {
    const config = I18nService.getShoppingConfig(language);
    
    // Build contextual query based on vertical
    switch (vertical) {
      case 'dining':
        return language === 'fr' ? `Réserver ${optionName}` : 
               language === 'es' ? `Reservar ${optionName}` :
               language === 'it' ? `Prenotare ${optionName}` :
               language === 'de' ? `Reservieren ${optionName}` :
               `Book ${optionName}`;
      
      case 'accommodation':
        return language === 'fr' ? `Réserver ${optionName} hôtel` : 
               language === 'es' ? `Reservar ${optionName} hotel` :
               language === 'it' ? `Prenotare ${optionName} hotel` :
               language === 'de' ? `${optionName} Hotel buchen` :
               `Book ${optionName} hotel`;
      
      case 'travel':
        return language === 'fr' ? `Réserver ${optionName}` : 
               language === 'es' ? `Reservar ${optionName}` :
               language === 'it' ? `Prenotare ${optionName}` :
               language === 'de' ? `${optionName} buchen` :
               `Book ${optionName}`;
      
      default:
        // For shopping/general items, use buy verb
        return `${config.buyVerb} ${optionName}`;
    }
  }

  getActionVerb(vertical: string | null, language: SupportedLanguage): string {
    switch (vertical) {
      case 'dining':
      case 'accommodation':
      case 'travel':
        return language === 'fr' ? 'Réserver' : 
               language === 'es' ? 'Reservar' :
               language === 'it' ? 'Prenotare' :
               language === 'de' ? 'Buchen' :
               'Book';
      
      default:
        const config = I18nService.getShoppingConfig(language);
        return config.buyVerb.charAt(0).toUpperCase() + config.buyVerb.slice(1);
    }
  }

  getDiscoverVerb(language: SupportedLanguage): string {
    return language === 'fr' ? 'Découvrir' : 
           language === 'es' ? 'Descubrir' :
           language === 'it' ? 'Scoprire' :
           language === 'de' ? 'Entdecken' :
           'Discover';
  }
}

export const firstResultService = new FirstResultService();