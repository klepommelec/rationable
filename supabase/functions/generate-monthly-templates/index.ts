import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  description: string;
  category: string;
  language: string;
  source: string;
}

interface GeneratedTemplate {
  context: 'personal' | 'professional';
  language: 'fr' | 'en';
  prompt: string;
  news_sources: Array<{ source: string; category: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting monthly template generation...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current month key
    const currentDate = new Date();
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    console.log(`📅 Generating templates for month: ${monthKey}`);

    // Collect news from multiple sources
    const newsItems = await collectCurrentNews();
    console.log(`📰 Collected ${newsItems.length} news items`);

    // Generate templates using AI
    const templates = await generateTemplatesFromNews(newsItems, monthKey);
    console.log(`🤖 Generated ${templates.length} templates`);

    // Store templates in database
    const { error: insertError } = await supabase
      .from('monthly_templates')
      .insert(
        templates.map(template => ({
          month_key: monthKey,
          context: template.context,
          language: template.language,
          prompt: template.prompt,
          news_sources: template.news_sources,
          is_active: false // Will be activated manually or by rotation function
        }))
      );

    if (insertError) {
      console.error('❌ Error inserting templates:', insertError);
      throw insertError;
    }

    console.log('✅ Templates successfully generated and stored');

    return new Response(
      JSON.stringify({
        success: true,
        monthKey,
        templatesCount: templates.length,
        message: `Generated ${templates.length} templates for ${monthKey}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-monthly-templates:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Template generation failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function collectCurrentNews(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  try {
    // Use Perplexity to get current trends and news
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      console.warn('⚠️ No Perplexity API key found, using fallback news');
      return getFallbackNews();
    }

    // Get French news
    const frenchNews = await fetchPerplexityNews(
      "Quelles sont les principales actualités et tendances en France ce mois-ci qui pourraient influencer les décisions personnelles et professionnelles ?",
      'fr'
    );
    
    // Get English news  
    const englishNews = await fetchPerplexityNews(
      "What are the main current events and trends that could influence personal and professional decisions this month?",
      'en'
    );

    newsItems.push(...frenchNews, ...englishNews);
    
  } catch (error) {
    console.error('⚠️ Error collecting news, using fallback:', error);
    return getFallbackNews();
  }

  return newsItems.length > 0 ? newsItems : getFallbackNews();
}

async function fetchPerplexityNews(query: string, language: string): Promise<NewsItem[]> {
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `You are a news analyst. Provide current news and trends that could influence decision-making. Return a JSON array of news items with: title, description, category (economy/technology/society/lifestyle), source.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      search_recency_filter: 'month'
    }),
  });

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '[]';
  
  try {
    const newsArray = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    return newsArray.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'general',
      language,
      source: item.source || 'Perplexity'
    }));
  } catch (parseError) {
    console.error('Error parsing Perplexity response:', parseError);
    return [];
  }
}

function getFallbackNews(): NewsItem[] {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = 2025;
  
  // September 2025 fallback news
  if (currentMonth === 9 && currentYear === 2025) {
    return [
      {
        title: "Rentrée scolaire et inflation",
        description: "Les coûts de la rentrée scolaire augmentent avec l'inflation",
        category: "economy",
        language: "fr",
        source: "Fallback"
      },
      {
        title: "Évolution du télétravail",
        description: "Nouvelles politiques d'entreprise sur le travail hybride",
        category: "technology",
        language: "fr",
        source: "Fallback"
      },
      {
        title: "Back-to-school inflation impact",
        description: "Rising costs affecting family budgets for school supplies",
        category: "economy",
        language: "en",
        source: "Fallback"
      },
      {
        title: "AI workplace transformation",
        description: "Artificial intelligence changing job requirements and skills",
        category: "technology",
        language: "en",
        source: "Fallback"
      }
    ];
  }
  
  // Generic fallback for other months
  return [
    {
      title: "Tendances économiques actuelles",
      description: "Évolutions économiques impactant les décisions personnelles",
      category: "economy",
      language: "fr",
      source: "Fallback"
    },
    {
      title: "Current economic trends",
      description: "Economic developments affecting personal decisions",
      category: "economy", 
      language: "en",
      source: "Fallback"
    }
  ];
}

async function generateTemplatesFromNews(newsItems: NewsItem[], monthKey: string): Promise<GeneratedTemplate[]> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) {
    console.warn('⚠️ No Anthropic API key, using fallback templates');
    return getFallbackTemplates(monthKey);
  }

  try {
    const templates: GeneratedTemplate[] = [];
    
    // Generate templates for each context and language
    const contexts: Array<'personal' | 'professional'> = ['personal', 'professional'];
    const languages: Array<'fr' | 'en'> = ['fr', 'en'];
    
    for (const context of contexts) {
      for (const language of languages) {
        const relevantNews = newsItems.filter(item => item.language === language);
        const contextTemplates = await generateContextTemplates(relevantNews, context, language, monthKey);
        templates.push(...contextTemplates);
      }
    }
    
    return templates;
    
  } catch (error) {
    console.error('⚠️ Error generating AI templates, using fallback:', error);
    return getFallbackTemplates(monthKey);
  }
}

async function generateContextTemplates(
  newsItems: NewsItem[], 
  context: 'personal' | 'professional', 
  language: 'fr' | 'en',
  monthKey: string
): Promise<GeneratedTemplate[]> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  const newsContext = newsItems
    .map(item => `- ${item.title}: ${item.description} (${item.category})`)
    .join('\n');
    
  const contextLabel = context === 'personal' ? 
    (language === 'fr' ? 'personnelles' : 'personal') :
    (language === 'fr' ? 'professionnelles' : 'professional');
    
  const prompt = language === 'fr' ? 
    `Basé sur ces actualités récentes, génère 3 questions de décision ${contextLabel} pertinentes qui inciteraient quelqu'un à utiliser un outil d'aide à la décision. Les questions doivent être ouvertes, pratiques et directement liées à l'actualité.

Actualités:
${newsContext}

Réponds uniquement avec un tableau JSON de 3 questions sous ce format:
[
  "Question 1 ?",
  "Question 2 ?", 
  "Question 3 ?"
]` :
    `Based on these recent news items, generate 3 relevant ${contextLabel} decision questions that would prompt someone to use a decision-making tool. Questions should be open-ended, practical, and directly related to current events.

News:
${newsContext}

Respond only with a JSON array of 3 questions in this format:
[
  "Question 1?",
  "Question 2?",
  "Question 3?" 
]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022', // Fast and cost-effective
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  const content = data.content[0]?.text || '[]';
  
  try {
    const questions = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    
    return questions.slice(0, 3).map((question: string) => ({
      context,
      language,
      prompt: question,
      news_sources: newsItems.map(item => ({ 
        source: item.source, 
        category: item.category 
      }))
    }));
    
  } catch (parseError) {
    console.error('Error parsing Claude response:', parseError);
    return getFallbackTemplatesForContext(context, language, monthKey);
  }
}

function getFallbackTemplates(monthKey: string): GeneratedTemplate[] {
  const templates: GeneratedTemplate[] = [];
  const contexts: Array<'personal' | 'professional'> = ['personal', 'professional'];
  const languages: Array<'fr' | 'en'> = ['fr', 'en'];
  
  for (const context of contexts) {
    for (const language of languages) {
      templates.push(...getFallbackTemplatesForContext(context, language, monthKey));
    }
  }
  
  return templates;
}

function getFallbackTemplatesForContext(
  context: 'personal' | 'professional', 
  language: 'fr' | 'en',
  monthKey: string
): GeneratedTemplate[] {
  const currentMonth = parseInt(monthKey.split('-')[1]);
  const monthNames = {
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
  };
  
  const monthName = monthNames[language][currentMonth - 1];
  
  if (context === 'personal') {
    return language === 'fr' ? [
      {
        context,
        language,
        prompt: `Comment optimiser mon budget familial pour le mois de ${monthName} ?`,
        news_sources: [{ source: 'Fallback', category: 'economy' }]
      },
      {
        context,
        language,
        prompt: `Quels nouveaux objectifs personnels devrais-je me fixer ce mois-ci ?`,
        news_sources: [{ source: 'Fallback', category: 'lifestyle' }]
      },
      {
        context,
        language,
        prompt: `Comment mieux équilibrer ma vie personnelle et professionnelle ?`,
        news_sources: [{ source: 'Fallback', category: 'wellness' }]
      }
    ] : [
      {
        context,
        language,
        prompt: `How should I adjust my family budget for ${monthName}?`,
        news_sources: [{ source: 'Fallback', category: 'economy' }]
      },
      {
        context,
        language,
        prompt: `What new personal goals should I set this month?`,
        news_sources: [{ source: 'Fallback', category: 'lifestyle' }]
      },
      {
        context,
        language,
        prompt: `How can I better balance my work and personal life?`,
        news_sources: [{ source: 'Fallback', category: 'wellness' }]
      }
    ];
  } else {
    return language === 'fr' ? [
      {
        context,
        language,
        prompt: `Quelle stratégie professionnelle adopter pour ${monthName} ?`,
        news_sources: [{ source: 'Fallback', category: 'business' }]
      },
      {
        context,
        language,
        prompt: `Dois-je investir dans de nouvelles compétences ce mois-ci ?`,
        news_sources: [{ source: 'Fallback', category: 'technology' }]
      },
      {
        context,
        language,
        prompt: `Comment améliorer ma productivité au travail ?`,
        news_sources: [{ source: 'Fallback', category: 'career' }]
      }
    ] : [
      {
        context,
        language,
        prompt: `What professional strategy should I adopt for ${monthName}?`,
        news_sources: [{ source: 'Fallback', category: 'business' }]
      },
      {
        context,
        language,
        prompt: `Should I invest in new skills this month?`,
        news_sources: [{ source: 'Fallback', category: 'technology' }]
      },
      {
        context,
        language,
        prompt: `How can I improve my work productivity?`,
        news_sources: [{ source: 'Fallback', category: 'career' }]
      }
    ];
  }
}