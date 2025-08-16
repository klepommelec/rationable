import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkVerificationRequest {
  links: {
    url: string;
    title: string;
    description?: string;
  }[];
  maxConcurrent?: number;
}

interface LinkVerificationResult {
  url: string;
  title: string;
  description?: string;
  status: 'valid' | 'invalid' | 'redirect' | 'timeout';
  finalUrl?: string;
  statusCode?: number;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { links, maxConcurrent = 5 }: LinkVerificationRequest = await req.json();

    if (!links || !Array.isArray(links)) {
      return new Response(JSON.stringify({ error: 'Invalid request: links array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Verifying ${links.length} links with max concurrency: ${maxConcurrent}`);

    const verifyLink = async (link: { url: string; title: string; description?: string }): Promise<LinkVerificationResult> => {
      const { url, title, description } = link;
      
      // Basic URL validation
      if (!url || typeof url !== 'string') {
        return {
          url,
          title,
          description,
          status: 'invalid',
          error: 'Invalid URL format'
        };
      }

      // Skip obvious placeholder URLs
      if (url.includes('example.com') || url.includes('placeholder') || url === '#') {
        return {
          url,
          title,
          description,
          status: 'invalid',
          error: 'Placeholder URL'
        };
      }

      try {
        // Ensure URL has protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        
        // Verify URL format
        new URL(fullUrl);

        // Perform HEAD request to check if URL exists
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(fullUrl, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkVerifier/1.0)'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return {
            url,
            title,
            description,
            status: 'valid',
            finalUrl: response.url !== fullUrl ? response.url : undefined,
            statusCode: response.status
          };
        } else if (response.status >= 300 && response.status < 400) {
          return {
            url,
            title,
            description,
            status: 'redirect',
            finalUrl: response.url,
            statusCode: response.status
          };
        } else {
          return {
            url,
            title,
            description,
            status: 'invalid',
            statusCode: response.status,
            error: `HTTP ${response.status}`
          };
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return {
            url,
            title,
            description,
            status: 'timeout',
            error: 'Request timeout'
          };
        }

        return {
          url,
          title,
          description,
          status: 'invalid',
          error: error.message || 'Network error'
        };
      }
    };

    // Process links in batches to avoid overwhelming servers
    const results: LinkVerificationResult[] = [];
    for (let i = 0; i < links.length; i += maxConcurrent) {
      const batch = links.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(batch.map(verifyLink));
      results.push(...batchResults);
      
      // Small delay between batches to be respectful
      if (i + maxConcurrent < links.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const validLinks = results.filter(result => result.status === 'valid');
    const invalidLinks = results.filter(result => result.status === 'invalid');
    const redirectLinks = results.filter(result => result.status === 'redirect');

    console.log(`Verification complete: ${validLinks.length} valid, ${invalidLinks.length} invalid, ${redirectLinks.length} redirects`);

    return new Response(JSON.stringify({
      results,
      summary: {
        total: links.length,
        valid: validLinks.length,
        invalid: invalidLinks.length,
        redirects: redirectLinks.length,
        timeouts: results.filter(r => r.status === 'timeout').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in link-verifier function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});