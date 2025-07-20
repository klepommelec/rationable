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

// Fonction améliorée pour nettoyer et parser le JSON
const cleanAndParseJSON = (content: string): any => {
  console.log('🧹 Raw content to clean (first 500 chars):', content.substring(0, 500));
  
  // Étapes de nettoyage progressives
  let cleanContent = content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();

  console.log('🧹 After basic cleaning:', cleanContent.substring(0, 200));

  // Essayer de trouver et extraire le JSON principal
  const jsonPatterns = [
    /\{[\s\S]*"breakdown"[\s\S]*\}/,  // JSON avec breakdown
    /\{[\s\S]*"recommendation"[\s\S]*\}/,  // JSON avec recommendation
    /\{[\s\S]*\}/  // Tout JSON
  ];

  for (const pattern of jsonPatterns) {
    const match = cleanContent.match(pattern);
    if (match) {
      let jsonString = match[0];
      console.log('🎯 Found JSON pattern:', jsonString.substring(0, 200));
      
      // Nettoyages spécifiques pour les erreurs courantes
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1')  // Virgules en trop
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Clés sans guillemets
        .replace(/:\s*([^",{\[\s][^",}\]]*[^",}\]\s])/g, ':"$1"')  // Valeurs sans guillemets
        .replace(/\\"/g, '"')  // Échappements inutiles
        .replace(/\n/g, ' ')  // Retours à la ligne
        .replace(/\s+/g, ' ');  // Espaces multiples

      console.log('🧹 After specific cleaning:', jsonString.substring(0, 200));

      try {
        const parsed = JSON.parse(jsonString);
        console.log('✅ Successfully parsed JSON with keys:', Object.keys(parsed));
        return parsed;
      } catch (e) {
        console.log('❌ Failed to parse cleaned JSON:', e.message);
        continue;
      }
    }
  }

  console.log('❌ No valid JSON pattern found');
  return null;
};

// Fonction améliorée pour extraire des produits multiples depuis le texte
const extractMultipleProductsFromText = (content: string, questionType: QuestionType) => {
  console.log('🔍 Extracting multiple products from text...');
  
  // Patterns de produits étendus pour différentes catégories
  const productPatterns = [
    // Ordinateurs portables
    /\b(MacBook [A-Za-z0-9 ]+(?:M[0-9]+)?[^.]*)/gi,
    /\b(Dell [A-Za-z0-9 ]+(?:XPS|Inspiron|Latitude)[^.]*)/gi,
    /\b(HP [A-Za-z0-9 ]+(?:Pavilion|Envy|Spectre)[^.]*)/gi,
    /\b(Lenovo [A-Za-z0-9 ]+(?:ThinkPad|IdeaPad|Yoga)[^.]*)/gi,
    /\b(Asus [A-Za-z0-9 ]+(?:ZenBook|VivoBook|ROG)[^.]*)/gi,
    /\b(Acer [A-Za-z0-9 ]+(?:Swift|Aspire)[^.]*)/gi,
    /\b(Microsoft Surface [A-Za-z0-9 ]+)/gi,
    
    // Smartphones
    /\b(iPhone [0-9]+ [A-Za-z ]*)/gi,
    /\b(Samsung Galaxy [A-Za-z0-9 ]+)/gi,
    /\b(Google Pixel [0-9]+ [A-Za-z]*)/gi,
    /\b(OnePlus [0-9]+ [A-Za-z]*)/gi,
    
    // Voitures
    /\b(Tesla Model [A-Za-z0-9]+)/gi,
    /\b(BMW [A-Za-z0-9 ]+)/gi,
    /\b(Mercedes [A-Za-z0-9 ]+)/gi,
    /\b(Audi [A-Za-z0-9 ]+)/gi,
    /\b(Volkswagen [A-Za-z0-9 ]+)/gi,
    /\b(Renault [A-Za-z0-9 ]+)/gi,
    /\b(Peugeot [A-Za-z0-9 ]+)/gi,
    
    // Destinations
    /\b([A-Z][a-zA-ZÀ-ÿ\s\-]{3,30}(?:, [A-Z][a-zA-ZÀ-ÿ]+)?)\b/g
  ];

  const foundProducts = new Set<string>();
  
  productPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim().replace(/[^\w\s\-À-ÿ]/g, '');
        if (cleaned.length > 5 && cleaned.length < 60) {
          foundProducts.add(cleaned);
        }
      });
    }
  });

  console.log(`✅ Found ${foundProducts.size} products:`, Array.from(foundProducts));
  return Array.from(foundProducts);
};

// Fonction améliorée pour générer des pros/cons réalistes
const generateRealisticProsAndCons = (product: string, content: string, index: number) => {
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Chercher des caractéristiques spécifiques dans le contenu
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (lower.includes(product.toLowerCase()) || (index === 0 && sentences.indexOf(sentence) < 5)) {
      
      // Avantages potentiels
      if (lower.match(/\b(excellent|performant|rapide|efficace|puissant|léger|autonomie|qualité|innovant|récent|abordable|compact)/)) {
        const cleanSentence = sentence.trim().replace(/^[^A-Za-z]*/, '');
        if (cleanSentence.length > 10 && cleanSentence.length < 100 && pros.length < 3) {
          pros.push(cleanSentence);
        }
      }
      
      // Inconvénients potentiels
      if (lower.match(/\b(cher|coûteux|limité|problème|défaut|lourd|complexe|manque)/)) {
        const cleanSentence = sentence.trim().replace(/^[^A-Za-z]*/, '');
        if (cleanSentence.length > 10 && cleanSentence.length < 100 && cons.length < 2) {
          cons.push(cleanSentence);
        }
      }
    }
  }
  
  // Fallbacks génériques mais pertinents
  if (pros.length === 0) {
    const genericPros = [
      `${product} offre de bonnes performances`,
      `Design et qualité de construction appréciés`,
      `Rapport qualité-prix intéressant`
    ];
    pros.push(genericPros[index % genericPros.length]);
  }
  
  if (cons.length === 0 && index > 0) {
    const genericCons = [
      `Prix plus élevé que certaines alternatives`,
      `Disponibilité parfois limitée`
    ];
    cons.push(genericCons[index % genericCons.length]);
  }
  
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 2) };
};

const extractTitleFromContent = (content: string, questionType: QuestionType): string => {
  console.log(`🔍 Extracting title from content (type: ${questionType})`);
  
  // Essayer d'extraire le titre depuis le JSON
  const titleMatch = content.match(/"recommendation":\s*"([^"]+)"/);
  if (titleMatch) {
    let title = titleMatch[1];
    
    if (questionType === 'factual') {
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
  
  const lines = content.split('\n').filter(line => line.trim());
  for (const line of lines) {
    const cleanLine = line.replace(/[*#\-•]/g, '').trim();
    if (cleanLine.length > 3 && cleanLine.length < 100) {
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
  
  if (pros.length < 2) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const clean = sentence.trim();
      
      if (clean.match(/\b(excellent|meilleur|performant|rapide|efficace|puissant|innovant|récent|nouveau|autonomie|léger|compact|prix|abordable|qualité)/i) &&
          !clean.match(/\b(mais|cependant|toutefois|problème|difficulté|cher|coûteux)/i)) {
        if (clean.length < 120 && pros.length < 3) {
          pros.push(clean.charAt(0).toUpperCase() + clean.slice(1));
        }
      }
      
      if (clean.match(/\b(cher|coûteux|limité|problème|défaut|manque|difficile|complexe|lourd|encombrant)/i)) {
        if (clean.length < 120 && cons.length < 2) {
          cons.push(clean.charAt(0).toUpperCase() + clean.slice(1));
        }
      }
    }
  }
  
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
    // Prompt simplifié et plus clair pour les questions comparatives
    prompt = `Question de choix: "${dilemma}"

Critères d'évaluation: ${criteria.map(c => c.name).join(', ')}

Proposez exactement 4 options différentes avec des scores variés (entre 65 et 90).

IMPORTANT: Générez TOUJOURS 4 options avec des scores DIFFÉRENTS pour la comparaison.

Format JSON EXACT (sans texte avant ou après):
{
  "recommendation": "Nom de la meilleure option",
  "description": "Description avec informations juillet 2025",
  "breakdown": [
    {
      "option": "Option 1 - La meilleure",
      "score": 87,
      "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
      "cons": ["Inconvénient mineur"],
      "scores": {}
    },
    {
      "option": "Option 2 - Deuxième choix",
      "score": 82,
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "scores": {}
    },
    {
      "option": "Option 3 - Troisième choix",
      "score": 76,
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "scores": {}
    },
    {
      "option": "Option 4 - Quatrième choix",
      "score": 71,
      "pros": ["Avantage 1", "Avantage 2"],
      "cons": ["Inconvénient 1", "Inconvénient 2"],
      "scores": {}
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
      console.log('📄 Raw content received:', content.substring(0, 300) + '...');
      
      let parsedResult: any = null;
      
      // 1. Essayer d'abord le parsing JSON amélioré
      parsedResult = cleanAndParseJSON(content);
      
      // 2. Si le JSON parsing échoue, utiliser l'extraction intelligente
      if (!parsedResult || !parsedResult.breakdown || parsedResult.breakdown.length === 0) {
        console.log('📝 JSON parsing failed, using intelligent text extraction...');
        
        if (questionType === 'comparative') {
          console.log('🔍 Extracting multiple options for comparative question...');
          
          const foundProducts = extractMultipleProductsFromText(content, questionType);
          
          if (foundProducts.length >= 2) {
            console.log(`✅ Found ${foundProducts.length} products, generating comparative breakdown`);
            
            const breakdown = foundProducts.slice(0, 4).map((product, index) => {
              const { pros, cons } = generateRealisticProsAndCons(product, content, index);
              return {
                option: product,
                score: 90 - (index * 5), // Scores décroissants réalistes
                pros,
                cons: index === 0 ? [] : cons, // Première option sans inconvénients
                scores: {}
              };
            });
            
            parsedResult = {
              recommendation: foundProducts[0],
              description: `Analyse comparative des meilleures options disponibles en juillet 2025. ${content.substring(0, 200)}...`,
              breakdown
            };
          }
        }
        
        // Fallback si rien d'autre ne fonctionne
        if (!parsedResult) {
          console.log('⚠️ Using fallback single option extraction');
          const recommendation = extractTitleFromContent(content, questionType);
          const { pros, cons } = extractProsConsFromContent(content, questionType);
          
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
        console.log(`📊 Final validation: ${parsedResult.breakdown?.length || 0} options for ${questionType} question`);
        
        // Pour les questions comparatives, s'assurer d'avoir au moins 2 options
        if (questionType === 'comparative' && parsedResult.breakdown && parsedResult.breakdown.length === 1) {
          console.log('⚠️ Only 1 option for comparative question, adding synthetic options');
          
          const baseOption = parsedResult.breakdown[0];
          const syntheticOptions = [
            {
              option: `Alternative à ${baseOption.option}`,
              score: Math.max(65, baseOption.score - 10),
              pros: ['Option alternative viable', 'Différentes caractéristiques'],
              cons: ['Moins optimal selon les critères principaux'],
              scores: {}
            },
            {
              option: `Option économique`,
              score: Math.max(60, baseOption.score - 15),
              pros: ['Prix plus abordable', 'Bon rapport qualité-prix'],
              cons: ['Performances moindres', 'Moins de fonctionnalités'],
              scores: {}
            }
          ];
          
          parsedResult.breakdown.push(...syntheticOptions.slice(0, 3));
        }
        
        // Nettoyer les titres trop longs
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

      console.log(`✅ Final result: ${result.breakdown?.length || 0} options generated`);
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
