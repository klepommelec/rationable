
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, context, temporalIntent, language = 'fr' } = await req.json()
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    // Adaptateur dynamique pour le filtre de récence
    const getRecencyFilter = (intent: string) => {
      switch (intent) {
        case 'current': return 'week'
        case 'recent_past': return 'month'
        case 'future': return 'year' // Pour trouver les annonces et prévisions
        case 'historical': return 'all'
        default: return 'month'
      }
    }
    
    const recencyFilter = getRecencyFilter(temporalIntent || 'neutral')
    
    // Get current date in correct format - force UTC to avoid timezone issues
    const now = new Date()
    const currentDateUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    console.log('🕐 Current date (UTC):', currentDateUTC.toISOString())
    console.log('🌍 Current year:', currentDateUTC.getFullYear())
    console.log('📅 Current month:', currentDateUTC.getMonth() + 1)
    
    // Format date according to language
    const dateFormatOptions = { month: 'long', year: 'numeric' } as const
    let currentDate: string
    
    switch (language) {
      case 'en':
        currentDate = currentDateUTC.toLocaleDateString('en-US', dateFormatOptions)
        break
      case 'es':
        currentDate = currentDateUTC.toLocaleDateString('es-ES', dateFormatOptions)
        break
      case 'it':
        currentDate = currentDateUTC.toLocaleDateString('it-IT', dateFormatOptions)
        break
      case 'de':
        currentDate = currentDateUTC.toLocaleDateString('de-DE', dateFormatOptions)
        break
      default:
        currentDate = currentDateUTC.toLocaleDateString('fr-FR', dateFormatOptions)
    }
    
    console.log('📅 Formatted current date:', currentDate)
    console.log('🌐 Language detected:', language)
    
    // Multilingual system prompts
    const systemPrompts = {
      fr: {
        future: 'Recherchez des événements futurs, annonces officielles, calendriers prévus et informations à venir. Cherchez les dernières prévisions disponibles, qualifications et calendriers officiels. Si un événement n\'a PAS encore eu lieu, dites-le clairement. Ne jamais inventer de résultats.',
        current: 'Recherchez UNIQUEMENT les événements en cours actuellement, expositions ouvertes actuellement et informations disponibles maintenant.',
        recent_past: 'Recherchez des événements récemment terminés, derniers résultats et informations des derniers mois.',
        historical: 'Recherchez dans les archives historiques et informations passées selon la période mentionnée.',
        default: 'Recherchez sur les sites officiels, actualités récentes et sources fiables pour trouver des informations actuelles.',
        responseRules: 'RÈGLES DE RÉPONSE : 1) Pour les listes, fournissez TOUS les éléments disponibles avec détails complets. 2) Pour les questions simples, soyez concis mais précis. 3) Utilisez des noms réels et spécifiques - jamais de termes génériques. 4) Supprimez les numéros de citation. 5) Répondez dans la même langue que la question.'
      },
      en: {
        future: 'Search for future events, official announcements, planned schedules, and upcoming information. Look for the latest available forecasts, qualifications, and official calendars. If an event has NOT yet occurred, clearly state this. Never invent results.',
        current: 'Search ONLY for events currently happening, exhibitions currently open, and information available right now.',
        recent_past: 'Search for recently concluded events, latest results, and information from recent months.',
        historical: 'Search historical archives and past information according to the mentioned timeframe.',
        default: 'Search official websites, recent news, and reliable sources to find current information.',
        responseRules: 'RESPONSE RULES: 1) For lists, provide ALL available items with complete details. 2) For single questions, be concise but precise. 3) Use real, specific names - never generic terms. 4) Remove citation numbers. 5) Answer in the same language as the question.'
      },
      es: {
        future: 'Busca eventos futuros, anuncios oficiales, calendarios planificados e información próxima. Busca las últimas previsiones disponibles, clasificaciones y calendarios oficiales. Si un evento NO ha ocurrido aún, indícalo claramente. Nunca inventar resultados.',
        current: 'Busca SOLO eventos que estén sucediendo actualmente, exposiciones abiertas actualmente e información disponible ahora mismo.',
        recent_past: 'Busca eventos recientemente concluidos, últimos resultados e información de los últimos meses.',
        historical: 'Busca archivos históricos e información pasada según el marco temporal mencionado.',
        default: 'Busca sitios web oficiales, noticias recientes y fuentes confiables para encontrar información actual.',
        responseRules: 'REGLAS DE RESPUESTA: 1) Para listas, proporciona TODOS los elementos disponibles con detalles completos. 2) Para preguntas simples, sé conciso pero preciso. 3) Usa nombres reales y específicos - nunca términos genéricos. 4) Elimina números de cita. 5) Responde en el mismo idioma que la pregunta.'
      },
      it: {
        future: 'Cerca eventi futuri, annunci ufficiali, calendari pianificati e informazioni in arrivo. Cerca le ultime previsioni disponibili, qualificazioni e calendari ufficiali. Se un evento NON è ancora avvenuto, indicalo chiaramente. Non inventare mai risultati.',
        current: 'Cerca SOLO eventi che stanno succedendo attualmente, mostre attualmente aperte e informazioni disponibili proprio ora.',
        recent_past: 'Cerca eventi recentemente conclusi, ultimi risultati e informazioni degli ultimi mesi.',
        historical: 'Cerca archivi storici e informazioni passate secondo il periodo di tempo menzionato.',
        default: 'Cerca siti web ufficiali, notizie recenti e fonti affidabili per trovare informazioni attuali.',
        responseRules: 'REGOLE DI RISPOSTA: 1) Per le liste, fornisci TUTTI gli elementi disponibili con dettagli completi. 2) Per domande singole, sii conciso ma preciso. 3) Usa nomi reali e specifici - mai termini generici. 4) Rimuovi i numeri di citazione. 5) Rispondi nella stessa lingua della domanda.'
      },
      de: {
        future: 'Suche nach zukünftigen Ereignissen, offiziellen Ankündigungen, geplanten Terminen und bevorstehenden Informationen. Suche nach den neuesten verfügbaren Prognosen, Qualifikationen und offiziellen Kalendern. Wenn ein Ereignis NOCH NICHT stattgefunden hat, sage es klar. Erfinde niemals Ergebnisse.',
        current: 'Suche NUR nach Ereignissen, die derzeit stattfinden, Ausstellungen, die derzeit geöffnet sind, und Informationen, die gerade jetzt verfügbar sind.',
        recent_past: 'Suche nach kürzlich abgeschlossenen Ereignissen, neuesten Ergebnissen und Informationen aus den letzten Monaten.',
        historical: 'Suche historische Archive und vergangene Informationen entsprechend dem erwähnten Zeitraum.',
        default: 'Suche offizielle Websites, aktuelle Nachrichten und zuverlässige Quellen, um aktuelle Informationen zu finden.',
        responseRules: 'ANTWORTREGELN: 1) Für Listen, gib ALLE verfügbaren Elemente mit vollständigen Details an. 2) Für einzelne Fragen, sei prägnant aber präzise. 3) Verwende echte, spezifische Namen - niemals generische Begriffe. 4) Entferne Zitationsnummern. 5) Antworte in derselben Sprache wie die Frage.'
      }
    }
    
    // Get prompts for the detected language
    const prompts = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.fr
    
    // Build system prompt adaptively according to temporal intent
    let systemPrompt = `You are a knowledgeable information specialist. Current date: ${currentDate}. Current year: ${currentDateUTC.getFullYear()}. `
    
    switch (temporalIntent) {
      case 'future':
        systemPrompt += prompts.future
        break
      case 'current':
        systemPrompt += prompts.current
        break
      case 'recent_past':
        systemPrompt += prompts.recent_past
        break
      case 'historical':
        systemPrompt += prompts.historical
        break
      default:
        systemPrompt += prompts.default
    }
    
    systemPrompt += ' ' + prompts.responseRules

    if (!perplexityApiKey) {
      console.error('❌ PERPLEXITY_API_KEY not found in environment')
      throw new Error('Perplexity API key not configured')
    }

    console.log('🔍 Perplexity optimized search query:', query)
    console.log('📝 Context for search:', context)

    // Utiliser sonar-pro en priorité pour les meilleures données récentes
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: recencyFilter,
        frequency_penalty: 1.0,
        presence_penalty: 0
      }),
    })

    console.log(`📡 Perplexity API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Perplexity API error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      throw new Error(`Perplexity API failed: HTTP ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📊 Perplexity response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    })

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content received from Perplexity API')
    }

    console.log('✅ Perplexity search completed successfully - Content preview:', content.substring(0, 200))

    return new Response(JSON.stringify({
      content,
      sources: data.citations || [],
      timestamp: new Date().toISOString(),
      searchQuery: query,
      requiresRealTimeData: true,
      model: 'sonar-pro'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Perplexity search error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      requiresRealTimeData: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
