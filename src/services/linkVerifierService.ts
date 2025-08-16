import { supabase } from '@/integrations/supabase/client';

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

export class LinkVerifierService {
  private static isValidUrlFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // Skip obvious placeholder URLs
    if (url.includes('example.com') || url.includes('placeholder') || url === '#') {
      return false;
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(fullUrl);
      return true;
    } catch {
      return false;
    }
  }

  private static async verifyLinksWithEdgeFunction(links: LinkVerificationRequest['links']): Promise<LinkVerificationResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('link-verifier', {
        body: { links, maxConcurrent: 5 }
      });

      if (error) {
        console.error('Link verification function error:', error);
        // Fallback to client-side validation
        return links.map(link => ({
          url: link.url,
          title: link.title,
          description: link.description,
          status: this.isValidUrlFormat(link.url) ? 'valid' : 'invalid' as const,
          error: error.message
        }));
      }

      return data.results || [];
    } catch (error) {
      console.error('Link verification service error:', error);
      // Fallback to basic format validation
      return links.map(link => ({
        url: link.url,
        title: link.title,
        description: link.description,
        status: this.isValidUrlFormat(link.url) ? 'valid' : 'invalid' as const,
        error: 'Service unavailable'
      }));
    }
  }

  static async verifyLinks(links: { url: string; title: string; description?: string }[]): Promise<{
    validLinks: Array<{ url: string; title: string; description?: string }>;
    invalidLinks: LinkVerificationResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      redirects: number;
    };
  }> {
    if (!links || links.length === 0) {
      return {
        validLinks: [],
        invalidLinks: [],
        summary: { total: 0, valid: 0, invalid: 0, redirects: 0 }
      };
    }

    // First, filter out obviously invalid links client-side
    const initialValidation = links.map(link => ({
      ...link,
      isValidFormat: this.isValidUrlFormat(link.url)
    }));

    const potentiallyValidLinks = initialValidation.filter(link => link.isValidFormat);
    const formatInvalidLinks: LinkVerificationResult[] = initialValidation
      .filter(link => !link.isValidFormat)
      .map(link => ({
        url: link.url,
        title: link.title,
        description: link.description,
        status: 'invalid' as const,
        error: 'Invalid URL format'
      }));

    if (potentiallyValidLinks.length === 0) {
      return {
        validLinks: [],
        invalidLinks: formatInvalidLinks,
        summary: {
          total: links.length,
          valid: 0,
          invalid: formatInvalidLinks.length,
          redirects: 0
        }
      };
    }

    // Verify remaining links with edge function
    const verificationResults = await this.verifyLinksWithEdgeFunction(potentiallyValidLinks);

    const validLinks = verificationResults
      .filter(result => result.status === 'valid' || result.status === 'redirect')
      .map(result => ({
        url: result.finalUrl || result.url,
        title: result.title,
        description: result.description
      }));

    const invalidLinks = [
      ...formatInvalidLinks,
      ...verificationResults.filter(result => result.status === 'invalid' || result.status === 'timeout')
    ];

    const summary = {
      total: links.length,
      valid: validLinks.length,
      invalid: invalidLinks.length,
      redirects: verificationResults.filter(r => r.status === 'redirect').length
    };

    console.log(`🔗 Link verification complete:`, summary);

    return {
      validLinks,
      invalidLinks,
      summary
    };
  }

  // Quick client-side validation for immediate feedback
  static validateLinkFormat(url: string): { isValid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'Empty or invalid URL' };
    }

    if (url.includes('example.com') || url.includes('placeholder') || url === '#') {
      return { isValid: false, error: 'Placeholder URL detected' };
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Invalid protocol' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
}