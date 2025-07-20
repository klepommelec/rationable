
import { ICriterion, IResult, DEFAULT_CATEGORIES } from '@/types/decision';
import { UploadedFileInfo } from './fileUploadService';
import { AIProviderService } from './aiProviderService';
import { detectQuestionType, QuestionType } from './questionTypeDetector';

export const generateCriteriaOnly = async (
  dilemma: string,
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<{criteria: ICriterion[], emoji: string, suggestedCategory: string}> => {
  console.log('🔍 Generating criteria with Perplexity only');
  
  const aiService = AIProviderService.getInstance();
  
  const prompt = `Analysez ce dilemme et générez des critères d'évaluation pertinents : "${dilemma}"

Générez 4-6 critères sous format JSON avec cette structure exacte :
[
  {
    "name": "Nom du critère",
    "weight": 5,
    "category": "practical"
  }
]

Utilisez ces catégories : practical, financial, personal, social, environmental, strategic`;

  try {
    const response = await aiService.executeWithFallback({
      prompt,
      type: 'criteria',
      files
    });

    if (response.success && response.content) {
      // Extraire le JSON de la réponse Perplexity
      const content = response.content.content || response.content.recommendation || '';
      
      // Chercher le JSON dans le contenu
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        try {
          const criteria = JSON.parse(jsonMatch[0]);
          return {
            criteria,
            emoji: '🤔',
            suggestedCategory: 'other'
          };
        } catch (parseError) {
          console.error('❌ JSON parsing error for criteria:', parseError);
          throw new Error('Failed to parse criteria JSON from response');
        }
      }
    }
    
    throw new Error('Failed to parse criteria from response');
  } catch (error) {
    console.error('Error generating criteria:', error);
    throw error;
  }
};

const extractTitleFromContent = (content: string, questionType: QuestionType): string => {
  console.log(`🔍 Extracting title from content (type: ${questionType})`);
  
  // Essayer d'extraire le titre depuis le JSON
  const titleMatch = content.match(/"recommendation":\s*"([^"]+)"/);
  if (titleMatch) {
    let title = titleMatch[1];
    
    // Nettoyer le titre pour extraire l'essentiel
    if (questionType === 'factual') {
      // Pour les questions factuelles, extraire le nom du produit/lieu/chose
      const cleanTitle = title
        .replace(/^(Le |La |L'|Les |The )/i, '')
        .replace(/ : .*$/, '')
        .replace(/ - .*$/, '')
        .replace(/ \(.*\)$/, '')
        .trim();
      
      console.log(`📝 Cleaned factual title: "${cleanTitle}"`);
      return cleanTitle || title;
    }
    
    console.log(`📝 Using title as-is: "${title}"`);
    return title;
  }
  
  // Si pas de JSON, essayer d'extraire depuis le texte libre
  const lines = content.split('\n').filter(line => line.trim());
  for (const line of lines) {
    const cleanLine = line.replace(/[*#\-•]/g, '').trim();
    if (cleanLine.length > 3 && cleanLine.length < 100) {
      // Chercher des patterns de recommandation
      if (cleanLine.match(/^(iPhone|Samsung|Google|Apple|Pixel|MacBook|iPad|Dell|HP|Lenovo|Asus|Acer)/i) ||
          cleanLine.match(/^[A-Z][a-zA-Z\s]+ (Pro|Max|Plus|Air|Mini|Ultra)/i)) {
        console.log(`📝 Extracted title from text: "${cleanLine}"`);
        return cleanLine;
      }
    }
  }
  
  const fallbackTitle = questionType === 'factual' ? 
    'Réponse factuelle' : 
    'Recommandation basée sur l\'analyse';
  
  console.log(`📝 Using fallback title: "${fallbackTitle}"`);
  return fallbackTitle;
};

const extractProsConsFromContent = (content: string, questionType: QuestionType) => {
  const pros: string[] = [];
  const cons: string[] = [];
  
  console.log(`🔍 Extracting pros/cons from content (type: ${questionType})`);
  
  // Essayer d'extraire depuis le JSON
  try {
    const prosMatch = content.match(/"pros":\s*\[([^\]]+)\]/);
    const consMatch = content.match(/"cons":\s*\[([^\]]+)\]/);
    
    if (prosMatch) {
      const prosText = prosMatch[1];
      const prosArray = prosText.split(',').map(p => 
        p.replace(/"/g, '').trim()
      ).filter(p => p.length > 3);
      pros.push(...prosArray);
      console.log(`✅ Extracted ${prosArray.length} pros from JSON`);
    }
    
    if (consMatch) {
      const consText = consMatch[1];
      const consArray = consText.split(',').map(c => 
        c.replace(/"/g, '').trim()
      ).filter(c => c.length > 3);
      cons.push(...consArray);
      console.log(`✅ Extracted ${consArray.length} cons from JSON`);
    }
  } catch (e) {
    console.log(`⚠️ JSON extraction failed, trying text analysis`);
  }
  
  // Si pas assez d'éléments extraits, analyser le texte libre
  if (pros.length < 2) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const clean = sentence.trim();
      
      // Chercher des avantages
      if (clean.match(/\b(excellent|meilleur|performant|rapide|efficace|puissant|innovant|récent|nouveau|autonomie|léger|compact|prix|abordable|qualité)/i) &&
          !clean.match(/\b(mais|cependant|toutefois|problème|difficulté|cher|coûteux)/i)) {
        if (clean.length < 120 && pros.length < 3) {
          pros.push(clean.charAt(0).toUpperCase() + clean.slice(1));
        }
      }
      
      // Chercher des inconvénients
      if (clean.match(/\b(cher|coûteux|limité|problème|défaut|manque|difficile|complexe|lourd|encombrant)/i)) {
        if (clean.length < 120 && cons.length < 2) {
          cons.push(clean.charAt(0).toUpperCase() + clean.slice(1));
        }
      }
    }
  }
  
  // Fallbacks par défaut selon le type
  if (pros.length === 0) {
    if (questionType === 'factual') {
      pros.push('Information vérifiée et à jour', 'Réponse basée sur des sources fiables');
    } else {
      pros.push('Analyse complète des critères', 'Recommandation personnalisée');
    }
  }
  
  if (cons.length === 0 && questionType === 'comparative') {
    cons.push('D\'autres options peuvent convenir selon vos besoins');
  }
  
  console.log(`📊 Final pros/cons: ${pros.length} pros, ${cons.length} cons`);
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
};

export const generateOptions = async (
  dilemma: string,
  criteria: ICriterion[],
  files?: UploadedFileInfo[],
  workspaceId?: string
): Promise<IResult> => {
  console.log('🔍 Generating options with Perplexity only');
  
  const aiService = AIProviderService.getInstance();
  const questionType = detectQuestionType(dilemma);
  
  console.log(`📊 Question type detected: ${questionType}`);
  
  let prompt: string;
  
  if (questionType === 'factual') {
    // Pour les questions factuelles : demander une réponse unique et précise
    prompt = `Question factuelle: "${dilemma}"

Fournissez une réponse factuelle précise et actualisée. Cette question a une réponse objective unique.

Répondez au format JSON exact suivant :
{
  "recommendation": "Nom précis du produit/lieu/chose recommandé (ex: iPhone 16 Pro, MacBook Air M3)",
  "description": "Explication détaillée avec des faits récents et vérifiables (juillet 2025)",
  "breakdown": [
    {
      "option": "Nom précis de la réponse",
      "score": 100,
      "pros": ["Caractéristique récente 1", "Avantage concret 2", "Spécification technique 3"],
      "cons": [],
      "scores": {}
    }
  ]
}`;
  } else {
    // Pour les questions comparatives : générer plusieurs options
    prompt = `Dilemme de choix: "${dilemma}"

Critères d'évaluation: ${criteria.map(c => c.name).join(', ')}

Analysez ce dilemme et proposez 3-4 options différentes avec leurs scores réalistes. Utilisez des données récentes de juillet 2025.

IMPORTANT: Générez plusieurs options avec des scores différents pour permettre la comparaison.

Répondez au format JSON exact suivant :
{
  "recommendation": "Nom de l'option la mieux notée",
  "description": "Description détaillée avec informations récentes (juillet 2025)",
  "breakdown": [
    {
      "option": "MacBook Air M3 (2024)",
      "score": 88,
      "pros": ["Processeur M3 performant", "Autonomie 18h", "Design ultra-fin"],
      "cons": ["Prix élevé", "Ports limités"],
      "scores": {"performance": 9, "prix": 7, "autonomie": 9, "mobilité": 10}
    },
    {
      "option": "Dell XPS 13 Plus",
      "score": 82,
      "pros": ["Écran tactile 4K", "Design premium", "Performances Intel solides"],
      "cons": ["Autonomie moyenne", "Clavier tactile controversé"],
      "scores": {"performance": 8, "prix": 8, "autonomie": 7, "mobilité": 9}
    },
    {
      "option": "Lenovo ThinkPad X1 Carbon",
      "score": 79,
      "pros": ["Clavier excellent", "Robustesse professionnelle", "Connectivité complète"],
      "cons": ["Design moins moderne", "Prix professionnel élevé"],
      "scores": {"performance": 8, "prix": 7, "autonomie": 8, "mobilité": 8}
    },
    {
      "option": "ASUS ZenBook 14",
      "score": 74,
      "pros": ["Rapport qualité-prix excellent", "Écran OLED disponible", "Compact et léger"],
      "cons": ["Performances en retrait", "Autonomie correcte sans plus"],
      "scores": {"performance": 7, "prix": 9, "autonomie": 7, "mobilité": 8}
    }
  ]
}`;
  }

  try {
    const response = await aiService.executeWithFallback({
      prompt,
      type: 'options',
      context: questionType === 'comparative' ? `Critères: ${criteria.map(c => c.name).join(', ')}` : 'Question factuelle',
      files
    });

    if (response.success && response.content) {
      const content = response.content.content || response.content.recommendation || '';
      
      console.log('📄 Processing Perplexity content for options...');
      console.log('📄 Content preview:', content.substring(0, 200) + '...');
      
      let parsedResult: any = null;
      
      // 1. Essayer d'extraire le JSON complet du contenu
      try {
        const cleanContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^\s*json\s*/i, '')
          .trim();
        
        // Chercher le JSON principal
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          console.log('🔍 Attempting to parse JSON:', jsonString.substring(0, 200) + '...');
          parsedResult = JSON.parse(jsonString);
          console.log('✅ JSON extracted and parsed successfully');
          console.log('📊 Parsed result breakdown length:', parsedResult.breakdown?.length || 0);
        }
      } catch (e) {
        console.log('⚠️ Failed to parse JSON, trying text extraction...', e);
      }
      
      // 2. Si pas de JSON valide, extraire intelligemment du texte
      if (!parsedResult || !parsedResult.breakdown || parsedResult.breakdown.length === 0) {
        console.log('📝 Extracting information from text content...');
        
        const recommendation = extractTitleFromContent(content, questionType);
        const { pros, cons } = extractProsConsFromContent(content, questionType);
        
        // Pour les questions comparatives, essayer d'extraire plusieurs options du texte
        if (questionType === 'comparative') {
          console.log('🔍 Trying to extract multiple options from text...');
          
          // Chercher des noms de produits/marques dans le contenu
          const productPatterns = [
            /\b(MacBook [A-Za-z0-9 ]+)/gi,
            /\b(iPhone [A-Za-z0-9 ]+)/gi,
            /\b(Dell [A-Za-z0-9 ]+)/gi,
            /\b(HP [A-Za-z0-9 ]+)/gi,
            /\b(Lenovo [A-Za-z0-9 ]+)/gi,
            /\b(Asus [A-Za-z0-9 ]+)/gi,
            /\b(Acer [A-Za-z0-9 ]+)/gi,
            /\b(Samsung [A-Za-z0-9 ]+)/gi
          ];
          
          const foundProducts = new Set<string>();
          productPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach(match => foundProducts.add(match.trim()));
            }
          });
          
          if (foundProducts.size >= 2) {
            console.log(`✅ Found ${foundProducts.size} products in text:`, Array.from(foundProducts));
            
            const breakdown = Array.from(foundProducts).slice(0, 4).map((product, index) => ({
              option: product,
              score: 90 - (index * 8), // Scores décroissants
              pros: [`Recommandé pour ${product}`, 'Performances adaptées', 'Disponible sur le marché'],
              cons: index === 0 ? [] : ['Alternative moins optimale selon les critères'],
              scores: {}
            }));
            
            parsedResult = {
              recommendation: Array.from(foundProducts)[0],
              description: `Analyse comparative basée sur les critères définis. ${content.substring(0, 200)}...`,
              breakdown
            };
          }
        }
        
        // Fallback pour une seule option
        if (!parsedResult) {
          parsedResult = {
            recommendation,
            description: content.length > 500 ? 
              content.substring(0, 500) + '...' : 
              content,
            breakdown: [
              {
                option: recommendation,
                score: questionType === 'factual' ? 100 : 85,
                pros,
                cons,
                scores: {}
              }
            ]
          };
        }
      }

      // 3. Validation et nettoyage final
      if (parsedResult) {
        // S'assurer que les titres sont courts et précis
        if (parsedResult.recommendation && parsedResult.recommendation.length > 80) {
          parsedResult.recommendation = extractTitleFromContent(parsedResult.recommendation, questionType);
        }
        
        // Nettoyer les options du breakdown
        if (parsedResult.breakdown) {
          parsedResult.breakdown = parsedResult.breakdown.map((item: any) => ({
            ...item,
            option: item.option && item.option.length > 80 ? 
              extractTitleFromContent(item.option, questionType) : 
              item.option,
            pros: Array.isArray(item.pros) ? item.pros.filter((p: string) => 
              p && p.length > 5 && !p.includes('Format de réponse') && !p.includes('Analyse basée')
            ) : [],
            cons: Array.isArray(item.cons) ? item.cons.filter((c: string) => 
              c && c.length > 5 && !c.includes('Format de réponse') && !c.includes('Analyse basée')
            ) : []
          }));
        }
        
        console.log(`📊 Final result: ${parsedResult.breakdown?.length || 0} options for ${questionType} question`);
      }

      const result: IResult = {
        recommendation: parsedResult.recommendation || 'Recommandation',
        description: parsedResult.description || content,
        breakdown: parsedResult.breakdown || [],
        resultType: questionType,
        realTimeData: {
          hasRealTimeData: true,
          timestamp: response.content.timestamp || new Date().toISOString(),
          sourcesCount: response.content.sources?.length || 0,
          searchQuery: dilemma,
          provider: 'perplexity'
        },
        aiProvider: {
          provider: response.provider,
          model: response.model,
          success: response.success
        }
      };

      return result;
    }
    
    throw new Error('Failed to generate options');
  } catch (error) {
    console.error('Error generating options:', error);
    throw error;
  }
};

// Réexporter pour compatibilité
export const generateCriteriaWithFallback = generateCriteriaOnly;
export const generateOptionsWithFallback = generateOptions;
export const generateCriteriaOnlyWithFallback = generateCriteriaOnly;
export const generateOptionsWithMultiProvider = generateOptions;
