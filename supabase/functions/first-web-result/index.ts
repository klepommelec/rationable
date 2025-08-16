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

    let results: SearchResult[] = [];
    let provider: SearchResponse['provider'] = 'perplexity'; // fallback

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
          if (data.items?.length > 0) {
            results = data.items.slice(0, numResults).map((item: any, index: number) => ({
              title: item.title,
              url: item.link,
              snippet: item.snippet,
              position: index + 1
            }));
            provider = 'google_cse';
            console.log(`✅ Google CSE returned ${results.length} results`);
          }
        } else {
          console.log(`⚠️ Google CSE failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️ Google CSE error: ${error.message}`);
      }
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

        const { data, error } = await supabase.functions.invoke('perplexity-search', {
          body: { 
            message: query, 
            language,
            returnCitations: true 
          }
        });

        if (!error && data?.citations?.length > 0) {
          results = data.citations.slice(0, numResults).map((citation: any, index: number) => ({
            title: citation.title || citation.url,
            url: citation.url,
            snippet: citation.snippet || '',
            position: index + 1
          }));
          provider = 'perplexity';
          console.log(`✅ Perplexity fallback returned ${results.length} results`);
        } else if (!error && data?.content) {
          // Extract URLs from Perplexity content as last resort
          const urlRegex = /https?:\/\/[^\s\)]+/g;
          const urls = data.content.match(urlRegex) || [];
          const uniqueUrls = [...new Set(urls)].slice(0, numResults);
          
          results = uniqueUrls.map((url: string, index: number) => ({
            title: url.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
            url: url,
            snippet: 'From Perplexity search',
            position: index + 1
          }));
          provider = 'perplexity';
          console.log(`✅ Perplexity URL extraction returned ${results.length} results`);
        }
      } catch (error) {
        console.log(`⚠️ Perplexity error: ${error.message}`);
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