import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  language?: 'fr' | 'en' | 'es' | 'it' | 'de';
  vertical?: 'dining' | 'accommodation' | 'travel' | 'automotive' | 'software' | null;
  siteBias?: string[];
  numResults?: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  position: number;
}

interface SearchResponse {
  provider: 'google_cse' | 'serpapi' | 'tavily' | 'perplexity';
  results: SearchResult[];
  first: SearchResult | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'fr', vertical, siteBias, numResults = 3 }: SearchRequest = await req.json();

    console.log(`🔍 First result search for: "${query}" (${language}, vertical: ${vertical})`);
    console.log(`🔧 Available APIs: Google CSE: ${!!Deno.env.get('GOOGLE_API_KEY')}, SerpAPI: ${!!Deno.env.get('SERPAPI_API_KEY')}, Tavily: ${!!Deno.env.get('TAVILY_API_KEY')}, Perplexity: ${!!Deno.env.get('PERPLEXITY_API_KEY')}`);

    let results: SearchResult[] = [];
    let provider: SearchResponse['provider'] = 'perplexity'; // fallback
    let lastError = '';

    // Priority 1: Google Custom Search Engine
    if (Deno.env.get('GOOGLE_API_KEY') && Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')) {
      console.log('🚀 Using Google CSE');
      try {
        const googleParams = new URLSearchParams({
          key: Deno.env.get('GOOGLE_API_KEY')!,
          cx: Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')!,
          q: query,
          num: numResults.toString(),
          hl: language,
          gl: language === 'fr' ? 'FR' : language === 'en' ? 'US' : language.toUpperCase()
        });

        if (siteBias?.length) {
          googleParams.set('siteSearch', siteBias.join(' OR '));
        }

        const response = await fetch(`https://www.googleapis.com/customsearch/v1?${googleParams}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Google CSE response:`, { hasItems: !!data.items, itemCount: data.items?.length || 0, error: data.error });
          
          if (data.error) {
            console.log(`❌ Google CSE API error: ${data.error.message}`);
            lastError = `Google CSE: ${data.error.message}`;
          } else if (data.items?.length > 0) {
            results = data.items.slice(0, numResults).map((item: any, index: number) => ({
              title: item.title,
              url: item.link,
              snippet: item.snippet,
              position: index + 1
            }));
            provider = 'google_cse';
            console.log(`✅ Google CSE returned ${results.length} results`);
          } else {
            console.log(`⚠️ Google CSE returned no results`);
            lastError = 'Google CSE: No results found';
          }
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Google CSE failed: ${response.status} - ${errorText}`);
          lastError = `Google CSE: HTTP ${response.status} - ${errorText}`;
        }
      } catch (error) {
        console.log(`⚠️ Google CSE error: ${error.message}`);
        lastError = `Google CSE: ${error.message}`;
      }
    } else {
      console.log('⚠️ Google CSE not configured (missing API key or Search Engine ID)');
      lastError = 'Google CSE: Not configured';
    }

    // Priority 2: SerpAPI (if Google CSE failed)
    if (results.length === 0 && Deno.env.get('SERPAPI_API_KEY')) {
      console.log('🚀 Using SerpAPI');
      try {
        const serpParams = new URLSearchParams({
          api_key: Deno.env.get('SERPAPI_API_KEY')!,
          engine: 'google',
          q: query,
          num: numResults.toString(),
          hl: language,
          gl: language === 'fr' ? 'fr' : language === 'en' ? 'us' : language
        });

        const response = await fetch(`https://serpapi.com/search?${serpParams}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.organic_results?.length > 0) {
            results = data.organic_results.slice(0, numResults).map((item: any, index: number) => ({
              title: item.title,
              url: item.link,
              snippet: item.snippet,
              position: index + 1
            }));
            provider = 'serpapi';
            console.log(`✅ SerpAPI returned ${results.length} results`);
          }
        } else {
          console.log(`⚠️ SerpAPI failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ SerpAPI error: ${error.message}`);
      }
    }

    // Priority 3: Tavily (if both Google CSE and SerpAPI failed)
    if (results.length === 0 && Deno.env.get('TAVILY_API_KEY')) {
      console.log('🚀 Using Tavily');
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('TAVILY_API_KEY')}`
          },
          body: JSON.stringify({
            query,
            search_depth: 'basic',
            include_answer: false,
            include_raw_content: false,
            max_results: numResults
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.results?.length > 0) {
            results = data.results.slice(0, numResults).map((item: any, index: number) => ({
              title: item.title,
              url: item.url,
              snippet: item.content,
              position: index + 1
            }));
            provider = 'tavily';
            console.log(`✅ Tavily returned ${results.length} results`);
          }
        } else {
          console.log(`⚠️ Tavily failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ Tavily error: ${error.message}`);
      }
    }

    // Priority 4: Perplexity fallback (extract URLs from existing perplexity-search function)
    if (results.length === 0) {
      console.log('🚀 Using Perplexity fallback');
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try with a more specific shopping query
        const shoppingQuery = `buy ${query} online store`;
        console.log(`🛒 Enhanced Perplexity query: "${shoppingQuery}"`);

        const { data, error } = await supabase.functions.invoke('perplexity-search', {
          body: { 
            query: shoppingQuery,
            message: shoppingQuery, 
            language,
            returnCitations: true 
          }
        });

        console.log(`📊 Perplexity response:`, { 
          hasData: !!data, 
          hasError: !!error, 
          hasCitations: !!data?.citations, 
          citationsCount: data?.citations?.length || 0,
          hasContent: !!data?.content,
          contentLength: data?.content?.length || 0
        });

        if (!error && data?.citations?.length > 0) {
          console.log(`📝 Raw citations:`, data.citations.slice(0, 3));
          
          // Filter and prioritize shopping-related URLs
          const shoppingCitations = data.citations.filter((citation: any) => {
            const url = citation.url?.toLowerCase() || '';
            const title = citation.title?.toLowerCase() || '';
            
            // Prioritize known e-commerce domains
            const isEcommerce = url.includes('amazon.') || url.includes('fnac.') || 
                              url.includes('cdiscount.') || url.includes('darty.') ||
                              url.includes('boulanger.') || url.includes('samsung.') ||
                              url.includes('apple.') || url.includes('shop') ||
                              url.includes('store') || url.includes('buy') ||
                              title.includes('buy') || title.includes('price') ||
                              title.includes('shop') || title.includes('store');
            
            // Avoid generic social/news sites
            const isGeneric = url.includes('facebook.') || url.includes('twitter.') ||
                            url.includes('youtube.') || url.includes('news.') ||
                            url.includes('wikipedia.') || url.includes('reddit.') ||
                            url.includes('blog.');
            
            return citation.url && isEcommerce && !isGeneric;
          });

          const finalCitations = shoppingCitations.length > 0 ? shoppingCitations : data.citations;
          
          results = finalCitations.slice(0, numResults).map((citation: any, index: number) => ({
            title: citation.title || citation.url?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'Product page',
            url: citation.url,
            snippet: citation.snippet || citation.description || 'Product information',
            position: index + 1
          }));
          provider = 'perplexity';
          console.log(`✅ Perplexity fallback returned ${results.length} results (${shoppingCitations.length} e-commerce filtered)`);
        } else if (!error && data?.content) {
          // Improved URL extraction from Perplexity content
          console.log(`🔍 Extracting URLs from content (length: ${data.content.length})`);
          
          // More comprehensive URL extraction
          const urlPatterns = [
            /https?:\/\/(?:www\.)?(?:amazon|fnac|cdiscount|darty|boulanger|samsung|apple)\.[\w\-._~:/?#[\]@!$&'()*+,;=]+/g,
            /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+\.(?:com|fr|co\.uk|de)[\w\-._~:/?#[\]@!$&'()*+,;=]*/g
          ];
          
          let extractedUrls: string[] = [];
          for (const pattern of urlPatterns) {
            const matches = data.content.match(pattern) || [];
            extractedUrls.push(...matches);
          }
          
          // Clean and deduplicate URLs
          const cleanUrls = [...new Set(extractedUrls)]
            .map(url => url.replace(/[)\],;.!?]+$/, '')) // Remove trailing punctuation
            .filter(url => {
              try {
                new URL(url);
                return !url.includes('example.') && !url.includes('placeholder') && url.length > 10;
              } catch {
                return false;
              }
            })
            .slice(0, numResults);
          
          console.log(`🔗 Extracted URLs:`, cleanUrls);
          
          if (cleanUrls.length > 0) {
            results = cleanUrls.map((url: string, index: number) => ({
              title: url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace('www.', '') + ' - Product page',
              url: url,
              snippet: 'Product information from web search',
              position: index + 1
            }));
            provider = 'perplexity';
            console.log(`✅ Perplexity URL extraction returned ${results.length} results`);
          }
        } else {
          console.log(`⚠️ Perplexity fallback failed:`, { error: error?.message, hasData: !!data });
          lastError = error?.message || 'Perplexity: No data returned';
        }
      } catch (error) {
        console.log(`⚠️ Perplexity error: ${error.message}`);
        lastError = `Perplexity: ${error.message}`;
      }
    }

    const response: SearchResponse = {
      provider,
      results,
      first: results.length > 0 ? results[0] : null
    };

    console.log(`🎯 Final result: ${results.length} results from ${provider}, first: ${response.first?.url || 'none'}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in first-web-result function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      provider: 'error',
      results: [],
      first: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});