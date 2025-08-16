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

export interface BestLinksResponse {
  official?: { url: string; title: string; domain: string };
  merchants: Array<{ url: string; title: string; domain: string }>;
  provider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  fromCache: boolean;
}

export interface FirstResultOptions {
  optionName: string;
  dilemma: string;
  language?: SupportedLanguage;
  vertical?: 'dining' | 'accommodation' | 'travel' | 'automotive' | 'software' | null;
}

class FirstResultService {
  async getBestLinks({ optionName, dilemma, language, vertical }: FirstResultOptions): Promise<BestLinksResponse> {
    // 1. Detect language and vertical
    const detectedLanguage = language || I18nService.detectLanguage(dilemma + ' ' + optionName);
    const detectedVertical = vertical || I18nService.detectVertical(dilemma + ' ' + optionName);
    
    // 2. Detect brand from option name
    const brand = this.detectBrand(optionName);
    console.log(`🏷️ Brand detected: ${brand || 'none'} for "${optionName}"`);
    
    // 3. Build search query
    const query = this.buildOptimizedQuery(optionName, detectedVertical, detectedLanguage);
    
    // 4. Check cache for both official and merchants
    const officialCacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}_official`;
    const merchantsCacheKey = `${query}_${detectedLanguage}_${detectedVertical || 'general'}_merchants`;
    
    const cachedOfficial = searchCacheService.get(officialCacheKey);
    const cachedMerchants = searchCacheService.get(merchantsCacheKey);
    
    if (cachedOfficial && cachedMerchants) {
      console.log(`✅ Using cached results for: ${optionName}`);
      return {
        official: cachedOfficial.content.official,
        merchants: cachedMerchants.content.merchants || [],
        provider: cachedOfficial.provider as any,
        fromCache: true
      };
    }
    
    try {
      console.log(`🔍 Searching best links for: "${query}" (${detectedLanguage}, ${detectedVertical})`);
      
      // 5. Search for official site first if we have a brand
      let officialResult = null;
      if (brand) {
        const officialQuery = `${brand} ${optionName} site officiel`;
        const siteBias = this.getBrandDomains(brand);
        
        const { data: officialData, error: officialError } = await supabase.functions.invoke('first-web-result', {
          body: {
            query: officialQuery,
            language: detectedLanguage,
            vertical: detectedVertical,
            numResults: 3,
            siteBias
          }
        });
        
        if (!officialError && officialData?.results?.length) {
          const officialResults = officialData.results.filter((r: any) => 
            this.isOfficialDomain(r.url, brand)
          );
          
          if (officialResults.length > 0) {
            const verified = await LinkVerifierService.verifyLinks(
              officialResults.slice(0, 1).map((r: any) => ({ url: r.url, title: r.title }))
            );
            
            if (verified.validLinks.length > 0) {
              const validLink = verified.validLinks[0];
              officialResult = {
                url: validLink.url,
                title: validLink.title,
                domain: this.extractDomain(validLink.url)
              };
              console.log(`✅ Official found: ${validLink.url}`);
            }
          }
        }
      }
      
      // 6. Search for general results (merchants)
      const { data, error } = await supabase.functions.invoke('first-web-result', {
        body: {
          query,
          language: detectedLanguage,
          vertical: detectedVertical,
          numResults: 8 // More results to find good merchants
        }
      });

      if (error) {
        console.error(`❌ Edge function error:`, error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data?.results?.length) {
        console.log(`⚠️ No results returned from search provider: ${data?.provider}`);
        throw new Error('No results returned from search');
      }

      // 7. Separate official vs merchants and prioritize
      const { merchants } = this.separateOfficialAndMerchants(data.results, brand, officialResult);
      
      // 8. Verify merchant links
      const merchantsToVerify = merchants.slice(0, 5).map((r: any) => ({ 
        url: r.url, 
        title: r.title,
        description: r.snippet 
      }));
      
      console.log(`🔍 Verifying merchant links:`, merchantsToVerify.map(l => l.url));
      const verified = await LinkVerifierService.verifyLinks(merchantsToVerify);
      console.log(`✅ Merchant verification complete:`, verified.summary);

      // 9. Build final merchant list (max 3) - Use fallback if verification fails
      let finalMerchants;
      if (verified.validLinks.length > 0) {
        // Use verified links
        finalMerchants = verified.validLinks.slice(0, 3).map(link => ({
          url: link.url,
          title: link.title,
          domain: this.extractDomain(link.url)
        }));
      } else if (merchants.length > 0) {
        // Fallback: use unverified but prioritized merchants
        console.log(`⚠️ Link verification failed, using unverified merchants as fallback`);
        finalMerchants = merchants.slice(0, 3).map(merchant => ({
          url: merchant.url,
          title: merchant.title,
          domain: this.extractDomain(merchant.url)
        }));
      } else {
        finalMerchants = [];
      }

      // 10. Last resort fallback: if no official and no merchants, create a Google search button
      if (!officialResult && finalMerchants.length === 0) {
        const detectedLanguage = language || I18nService.detectLanguage(dilemma + ' ' + optionName);
        const detectedVertical = vertical || I18nService.detectVertical(dilemma + ' ' + optionName);
        const searchQuery = this.buildOptimizedQuery(optionName, detectedVertical, detectedLanguage);
        const googleSearchUrl = I18nService.buildGoogleWebUrl(searchQuery, detectedLanguage);
        
        finalMerchants.push({
          url: googleSearchUrl,
          title: `Rechercher "${optionName}"`,
          domain: 'google.com'
        });
        
        console.log(`🔄 Added Google search fallback for: ${optionName}`);
      }

      const result = {
        official: officialResult,
        merchants: finalMerchants,
        provider: data.provider,
        fromCache: false
      };

      // 10. Cache results
      if (officialResult) {
        searchCacheService.set(officialCacheKey, detectedVertical || 'general', { official: officialResult }, data.provider);
      }
      searchCacheService.set(merchantsCacheKey, detectedVertical || 'general', { merchants: finalMerchants }, data.provider);

      console.log(`🎉 Best links found: ${officialResult ? 'official + ' : ''}${finalMerchants.length} merchants`);
      return result;

    } catch (error) {
      console.error(`❌ getBestLinks error for "${optionName}":`, error);
      
      // Fallback to legacy method
      const fallback = await this.getFirstResultUrl({ optionName, dilemma, language, vertical });
      return {
        official: null,
        merchants: [{
          url: fallback.url,
          title: fallback.title,
          domain: this.extractDomain(fallback.url)
        }],
        provider: fallback.sourceProvider,
        fromCache: fallback.fromCache
      };
    }
  }

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
          console.log(`✅ Using cached result: ${cached.content.url}`);
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
          numResults: 5 // Increase to get more options for verification
        }
      });

      if (error) {
        console.error(`❌ Edge function error:`, error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      console.log(`📊 Search results:`, { 
        provider: data?.provider, 
        resultCount: data?.results?.length || 0,
        hasResults: !!data?.results?.length 
      });

      if (!data?.results?.length) {
        console.log(`⚠️ No results returned from search provider: ${data?.provider}`);
        throw new Error('No results returned from search');
      }

      // 6. Pre-filter results to prioritize e-commerce URLs
      const prioritizedResults = this.prioritizeEcommerceResults(data.results);
      console.log(`🎯 Prioritized ${prioritizedResults.length} results from ${data.results.length} total`);

      // 7. Verify results and find first valid one
      const linksToVerify = prioritizedResults.slice(0, 3).map((r: any) => ({ 
        url: r.url, 
        title: r.title,
        description: r.snippet 
      }));
      
      console.log(`🔍 Verifying links:`, linksToVerify.map(l => l.url));
      const verified = await LinkVerifierService.verifyLinks(linksToVerify);
      
      console.log(`✅ Link verification complete:`, verified.summary);

      let validResult = null;
      if (verified.validLinks.length > 0) {
        const firstValidLink = verified.validLinks[0];
        const originalResult = prioritizedResults.find((r: any) => 
          r.url === firstValidLink.url || 
          r.title === firstValidLink.title ||
          this.normalizeUrl(r.url) === this.normalizeUrl(firstValidLink.url)
        );
        validResult = {
          ...originalResult,
          url: firstValidLink.url,
          title: firstValidLink.title || originalResult?.title
        };
        
        console.log(`🎉 Found valid result: ${validResult.url}`);
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
        console.log(`⚠️ No valid URLs found after verification`);
        throw new Error('No valid URLs found in search results');
      }
    } catch (error) {
      console.error(`❌ FirstResultService error for "${optionName}":`, error);
      
      // Enhanced fallback: try to construct a merchant-specific search URL
      const merchantFallback = this.buildMerchantFallbackUrl(optionName, detectedLanguage);
      if (merchantFallback) {
        console.log(`🔄 Using merchant fallback: ${merchantFallback}`);
        return {
          url: merchantFallback,
          title: `Rechercher "${optionName}"`,
          sourceProvider: 'perplexity', // arbitrary fallback
          fromCache: false
        };
      }
      
      // Final fallback to Google search page
      const fallbackUrl = I18nService.buildGoogleWebUrl(query, detectedLanguage);
      console.log(`🔄 Using Google fallback: ${fallbackUrl}`);
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

  private prioritizeEcommerceResults(results: any[]): any[] {
    if (!results || results.length === 0) return [];

    // Define e-commerce domains and keywords
    const ecommerceDomains = [
      'amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'samsung', 'apple', 
      'leboncoin', 'rueducommerce', 'materiel', 'ldlc', 'grosbill', 'topachat',
      'store', 'shop', 'boutique', 'magasin'
    ];

    const ecommerceKeywords = [
      'buy', 'acheter', 'comprar', 'comprare', 'kaufen',
      'price', 'prix', 'precio', 'prezzo', 'preis',
      'shop', 'store', 'boutique', 'magasin', 'tienda'
    ];

    // Score and sort results
    const scoredResults = results.map(result => {
      let score = 0;
      const url = result.url?.toLowerCase() || '';
      const title = result.title?.toLowerCase() || '';

      // Higher score for known e-commerce domains
      for (const domain of ecommerceDomains) {
        if (url.includes(domain)) {
          score += url.includes('amazon') || url.includes('fnac') || url.includes('samsung') ? 10 : 5;
          break;
        }
      }

      // Score for e-commerce keywords in title or URL
      for (const keyword of ecommerceKeywords) {
        if (title.includes(keyword) || url.includes(keyword)) {
          score += 2;
        }
      }

      // Bonus for HTTPS
      if (url.startsWith('https')) score += 1;

      // Penalty for generic sites
      const genericDomains = ['wikipedia', 'youtube', 'facebook', 'twitter', 'reddit', 'blog'];
      for (const generic of genericDomains) {
        if (url.includes(generic)) {
          score -= 5;
          break;
        }
      }

      return { ...result, _score: score };
    });

    // Sort by score (highest first) and return original format
    return scoredResults
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...result }) => result);
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove www, trailing slash, and common tracking parameters
      let normalized = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\/$/, '');
      
      // Remove common tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
      const searchParams = new URLSearchParams(urlObj.search);
      for (const param of trackingParams) {
        searchParams.delete(param);
      }
      
      const cleanParams = searchParams.toString();
      if (cleanParams) {
        normalized += '?' + cleanParams;
      }
      
      return normalized;
    } catch {
      return url;
    }
  }

  private buildMerchantFallbackUrl(optionName: string, language: SupportedLanguage): string | null {
    const config = I18nService.getShoppingConfig(language);
    const cleanOptionName = I18nService.sanitizeProductQuery(optionName);
    
    // Try to detect product category and use appropriate merchant
    const lowerOption = optionName.toLowerCase();
    
    // Electronics/Tech products -> go to major tech retailers
    if (lowerOption.includes('samsung') || lowerOption.includes('apple') || lowerOption.includes('iphone') || 
        lowerOption.includes('galaxy') || lowerOption.includes('macbook') || lowerOption.includes('laptop')) {
      
      // For Samsung products, try official Samsung store first
      if (lowerOption.includes('samsung')) {
        const samsungDomains = {
          'fr': 'samsung.com/fr',
          'en': 'samsung.com/us',
          'es': 'samsung.com/es',
          'it': 'samsung.com/it',
          'de': 'samsung.com/de'
        };
        const domain = samsungDomains[language] || samsungDomains.en;
        return `https://www.${domain}/search/?searchvalue=${encodeURIComponent(cleanOptionName)}`;
      }
      
      // For Apple products, try Apple store
      if (lowerOption.includes('apple') || lowerOption.includes('iphone') || lowerOption.includes('macbook')) {
        const appleDomains = {
          'fr': 'apple.com/fr',
          'en': 'apple.com/us',
          'es': 'apple.com/es',
          'it': 'apple.com/it',
          'de': 'apple.com/de'
        };
        const domain = appleDomains[language] || appleDomains.en;
        return `https://www.${domain}/search/${encodeURIComponent(cleanOptionName)}`;
      }
      
      // For other electronics, try major retailers
      if (language === 'fr') {
        return `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(cleanOptionName)}`;
      }
    }
    
    // Fallback to Amazon search
    const amazonDomains = {
      'fr': 'amazon.fr',
      'en': 'amazon.com',
      'es': 'amazon.es',
      'it': 'amazon.it',
      'de': 'amazon.de'
    };
    
    const amazonDomain = amazonDomains[language] || amazonDomains.en;
    return `https://www.${amazonDomain}/s?k=${encodeURIComponent(cleanOptionName)}`;
  }

  private detectBrand(optionName: string): string | null {
    const lowerOption = optionName.toLowerCase();
    
    // Extract potential restaurant/business names using common patterns
    const restaurantName = this.extractRestaurantName(lowerOption);
    if (restaurantName) {
      return restaurantName;
    }
    
    // Known brands mapping
    const brandMap = {
      // Automotive
      'toyota': 'toyota',
      'honda': 'honda',
      'ford': 'ford',
      'bmw': 'bmw',
      'mercedes': 'mercedes',
      'audi': 'audi',
      'volkswagen': 'volkswagen',
      'peugeot': 'peugeot',
      'renault': 'renault',
      'citroën': 'citroen',
      'dacia': 'dacia',
      
      // Technology
      'samsung': 'samsung',
      'apple': 'apple',
      'iphone': 'apple',
      'ipad': 'apple',
      'macbook': 'apple',
      'galaxy': 'samsung',
      'pixel': 'google',
      'oneplus': 'oneplus',
      'xiaomi': 'xiaomi',
      'huawei': 'huawei',
      'sony': 'sony',
      'dell': 'dell',
      'hp': 'hp',
      'lenovo': 'lenovo',
      'microsoft': 'microsoft',
      'surface': 'microsoft',
      
      // Dining & Leisure brands
      'mcdonalds': 'mcdonalds',
      'kfc': 'kfc',
      'burger king': 'burgerking',
      'starbucks': 'starbucks',
      'subway': 'subway',
      'fenocchio': 'fenocchio',
      'paul': 'paul',
      'plongeoir': 'plongeoir',
      
      // Hotels & Travel
      'hilton': 'hilton',
      'marriott': 'marriott',
      'accor': 'accor',
      'ibis': 'ibis',
      'novotel': 'novotel',
      
      // Other
      'nike': 'nike',
      'adidas': 'adidas',
      'ikea': 'ikea',
      'lego': 'lego'
    };
    
    for (const [keyword, brand] of Object.entries(brandMap)) {
      if (lowerOption.includes(keyword)) {
        return brand;
      }
    }
    
    return null;
  }

  private extractRestaurantName(lowerOption: string): string | null {
    // Look for restaurant names in common patterns
    const patterns = [
      /restaurant\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /chez\s+([a-zA-ZÀ-ÿ]+)/i,
      /café\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /bar\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /brasserie\s+([a-zA-ZÀ-ÿ\s]+)/i,
      /bistrot?\s+([a-zA-ZÀ-ÿ\s]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = lowerOption.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 2 && name.length < 30) {
          return name.toLowerCase().replace(/\s+/g, '');
        }
      }
    }
    
    // Look for specific known restaurant names
    const knownRestaurants = [
      'fenocchio', 'plongeoir', 'lapérouse', 'procope', 'flore', 'closerie', 
      'brasserie lipp', 'fouquet', 'maxim', 'train bleu'
    ];
    
    for (const restaurant of knownRestaurants) {
      if (lowerOption.includes(restaurant.toLowerCase())) {
        return restaurant.toLowerCase().replace(/\s+/g, '');
      }
    }
    
    return null;
  }

  private getBrandDomains(brand: string): string[] {
    const domainMap: Record<string, string[]> = {
      'samsung': ['samsung.com', 'samsung.fr', 'samsung.es', 'samsung.it', 'samsung.de'],
      'apple': ['apple.com', 'apple.fr', 'apple.es', 'apple.it', 'apple.de'],
      'google': ['store.google.com', 'google.com'],
      'toyota': ['toyota.fr', 'toyota.com', 'toyota.es', 'toyota.it', 'toyota.de'],
      'honda': ['honda.fr', 'honda.com', 'honda.es', 'honda.it', 'honda.de'],
      'ford': ['ford.fr', 'ford.com', 'ford.es', 'ford.it', 'ford.de'],
      'bmw': ['bmw.fr', 'bmw.com', 'bmw.es', 'bmw.it', 'bmw.de'],
      'mercedes': ['mercedes-benz.fr', 'mercedes-benz.com'],
      'audi': ['audi.fr', 'audi.com', 'audi.es', 'audi.it', 'audi.de'],
      'peugeot': ['peugeot.fr', 'peugeot.com'],
      'renault': ['renault.fr', 'renault.com'],
      'dacia': ['dacia.fr', 'dacia.com'],
      'nike': ['nike.com', 'nike.fr'],
      'adidas': ['adidas.com', 'adidas.fr'],
      
      // Dining brands
      'mcdonalds': ['mcdonalds.com', 'mcdonalds.fr'],
      'kfc': ['kfc.com', 'kfc.fr'],
      'burgerking': ['burgerking.fr', 'burgerking.com'],
      'starbucks': ['starbucks.com', 'starbucks.fr'],
      'subway': ['subway.com', 'subway.fr'],
      
      // Hotels
      'hilton': ['hilton.com', 'hilton.fr'],
      'marriott': ['marriott.com', 'marriott.fr'],
      'accor': ['accor.com', 'all.accor.com'],
      'ibis': ['ibis.com', 'all.accor.com'],
      'novotel': ['novotel.com', 'all.accor.com']
    };
    
    return domainMap[brand] || [`${brand}.com`, `${brand}.fr`, `www.${brand}.com`, `www.${brand}.fr`];
  }

  private isOfficialDomain(url: string, brand: string): boolean {
    const domain = this.extractDomain(url).toLowerCase();
    const brandDomains = this.getBrandDomains(brand);
    
    // Check exact brand domain matches first
    const exactMatch = brandDomains.some(brandDomain => 
      domain.includes(brandDomain.toLowerCase())
    );
    
    if (exactMatch) {
      // Exclude marketplaces even for exact matches
      const isMarketplace = ['amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin', 'ebay', 'rakuten'].some(
        marketplace => domain.includes(marketplace)
      );
      return !isMarketplace;
    }
    
    // More lenient check: domain contains brand name and looks official
    const containsBrand = domain.includes(brand.toLowerCase());
    if (containsBrand) {
      // Check if it's likely to be official (not a marketplace/review site)
      const isMarketplace = ['amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin', 'ebay', 'rakuten',
        'tripadvisor', 'booking', 'expedia', 'yelp', 'google', 'facebook', 'instagram'].some(
        marketplace => domain.includes(marketplace)
      );
      
      // Likely official if contains brand and not a marketplace
      return !isMarketplace && (
        domain.includes('.com') || domain.includes('.fr') || domain.includes('.org') || 
        domain.includes('restaurant') || domain.includes('hotel') || domain.includes('official')
      );
    }
    
    return false;
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  private separateOfficialAndMerchants(results: any[], brand: string | null, existingOfficial: any) {
    const merchants: any[] = [];
    let official = existingOfficial;
    
    for (const result of results) {
      const domain = this.extractDomain(result.url);
      
      // Skip if we already have this domain
      if (merchants.some(m => m.domain === domain) || (official && official.domain === domain)) {
        continue;
      }
      
      // If no official yet and this looks official
      if (!official && brand && this.isOfficialDomain(result.url, brand)) {
        official = {
          url: result.url,
          title: result.title,
          domain
        };
        continue;
      }
      
      // Add to merchants if it's a known e-commerce site
      if (this.isMerchantDomain(domain)) {
        merchants.push({
          ...result,
          domain,
          _score: this.scoreMerchant(domain, result.title)
        });
      }
    }
    
    // Sort merchants by score and return top ones
    merchants.sort((a, b) => b._score - a._score);
    
    return {
      official,
      merchants: merchants.slice(0, 5) // Get top 5 for verification
    };
  }

  private isMerchantDomain(domain: string): boolean {
    const merchantDomains = [
      // E-commerce platforms
      'amazon', 'fnac', 'cdiscount', 'darty', 'boulanger', 'leboncoin',
      'rueducommerce', 'ldlc', 'materiel', 'grosbill', 'topachat',
      'conforama', 'but', 'castorama', 'leroy-merlin',
      
      // Booking/Reservation platforms
      'booking.com', 'expedia', 'hotels.com', 'agoda', 'trivago', 'kayak',
      'airbnb', 'vrbo', 'homeaway',
      
      // Restaurant booking platforms
      'opentable', 'thefork', 'lafourchette', 'resy', 'yelp',
      'tripadvisor', 'zomato', 'deliveroo', 'ubereats', 'justeat',
      
      // Activity/Experience platforms
      'viator', 'getyourguide', 'klook', 'tiqets', 'ticketmaster',
      'eventbrite', 'stubhub', 'seetickets',
      
      // Travel platforms
      'sncf-connect', 'trainline', 'omio', 'flixbus', 'ouibus',
      'blablacar', 'europcar', 'hertz', 'avis', 'sixt'
    ];
    
    return merchantDomains.some(merchant => domain.includes(merchant));
  }

  private scoreMerchant(domain: string, title: string): number {
    let score = 0;
    
    // Premium booking platforms
    if (domain.includes('booking.com')) score += 12;
    if (domain.includes('opentable')) score += 11;
    if (domain.includes('thefork') || domain.includes('lafourchette')) score += 11;
    
    // Premium e-commerce
    if (domain.includes('amazon')) score += 10;
    if (domain.includes('fnac')) score += 9;
    if (domain.includes('darty')) score += 8;
    if (domain.includes('boulanger')) score += 7;
    
    // Travel & activity platforms
    if (domain.includes('viator')) score += 9;
    if (domain.includes('getyourguide')) score += 9;
    if (domain.includes('expedia')) score += 8;
    if (domain.includes('airbnb')) score += 8;
    if (domain.includes('tripadvisor')) score += 7;
    
    // Standard merchants
    if (domain.includes('cdiscount')) score += 6;
    if (domain.includes('rueducommerce')) score += 5;
    if (domain.includes('ldlc')) score += 5;
    
    // Restaurant delivery
    if (domain.includes('deliveroo') || domain.includes('ubereats')) score += 6;
    
    // Bonus for title containing relevant keywords
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('réserver') || lowerTitle.includes('book')) score += 3;
    if (lowerTitle.includes('prix') || lowerTitle.includes('price')) score += 2;
    if (lowerTitle.includes('acheter') || lowerTitle.includes('buy')) score += 2;
    if (lowerTitle.includes('restaurant') || lowerTitle.includes('hotel')) score += 2;
    
    return score;
  }

  getDomainLabel(domain: string): string {
    const labelMap: Record<string, string> = {
      'amazon.fr': 'Amazon',
      'amazon.com': 'Amazon',
      'fnac.com': 'Fnac',
      'cdiscount.com': 'Cdiscount',
      'darty.com': 'Darty',
      'boulanger.com': 'Boulanger',
      'ldlc.com': 'LDLC',
      'materiel.net': 'Materiel.net',
      'rueducommerce.fr': 'Rue du Commerce',
      'topachat.com': 'TopAchat',
      'grosbill.com': 'Grosbill',
      'samsung.com': 'Samsung',
      'samsung.fr': 'Samsung',
      'apple.com': 'Apple',
      'apple.fr': 'Apple',
      'toyota.fr': 'Toyota',
      'honda.fr': 'Honda',
      'peugeot.fr': 'Peugeot'
    };
    
    // Try exact match first
    const cleanDomain = domain.replace(/^www\./, '');
    if (labelMap[cleanDomain]) {
      return labelMap[cleanDomain];
    }
    
    // Try partial matches
    for (const [key, label] of Object.entries(labelMap)) {
      if (cleanDomain.includes(key.split('.')[0])) {
        return label;
      }
    }
    
    // Fallback: capitalize first letter of domain name
    const domainName = cleanDomain.split('.')[0];
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  }
}

export const firstResultService = new FirstResultService();