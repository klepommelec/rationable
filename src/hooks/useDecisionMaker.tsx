import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useDebounceCallback } from 'usehooks-ts';
import { RefreshCw } from 'lucide-react';
import { ICriterion, IResult, IDecision, ILink } from '@/types/decision';
import { callOpenAiApi } from '@/services/openai';

const templates = [
  {
    name: "💻 Choisir un ordinateur",
    dilemma: "Quel nouvel ordinateur portable devrais-je acheter ?",
  },
  {
    name: "✈️ Choisir des vacances",
    dilemma: "Où devrais-je partir pour mes prochaines vacances ?",
  },
  {
    name: "🤔 Apprendre un framework JS",
    dilemma: "Quel framework JavaScript devrais-je apprendre en 2025 ?",
  },
];

export const useDecisionMaker = () => {
    const [dilemma, setDilemma] = useState('');
    const [analysisStep, setAnalysisStep] = useState<'idle' | 'analyzing' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [result, setResult] = useState<IResult | null>(null);
    const [history, setHistory] = useState<IDecision[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'analyzing';

    const handleGenerateOptions = async () => {
        const currentCriteria = criteria;
        
        if (currentCriteria.length < 2) {
          toast.error("Veuillez définir au moins 2 critères.");
          return;
        }
        if (currentCriteria.some(c => c.name.trim() === '')) {
          toast.error("Veuillez nommer tous les critères avant de continuer.");
          return;
        }

        setIsUpdating(true);

        const criteriaNames = currentCriteria.map(c => c.name);
        
        const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères importants : ${criteriaNames.join(', ')}.
        Veuillez générer 3 options, les évaluer (pros/cons, score de 0 à 100) et fournir une recommandation enrichie.
        Le résultat doit être un objet JSON avec la structure suivante :
        {
          "recommendation": "Option Recommandée",
          "description": "Un texte descriptif (2-3 phrases) et engageant expliquant pourquoi c'est la meilleure option. Sois convaincant.",
          "imageQuery": "une requête de recherche d'image pertinente en anglais pour Unsplash (ex: 'modern laptop on desk')",
          "infoLinks": [ { "title": "Titre du lien info 1", "url": "https://example.com/info1" } ],
          "shoppingLinks": [ { "title": "Titre du lien achat 1", "url": "https://example.com/shop1" } ],
          "breakdown": [
            {
              "option": "Option 1",
              "pros": ["Avantage 1"],
              "cons": ["Inconvénient 1"],
              "score": 85
            }
          ]
        }`;

        try {
          const apiResult: IResult = await callOpenAiApi(prompt);

          const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number') && apiResult.description && apiResult.imageQuery && Array.isArray(apiResult.infoLinks) && Array.isArray(apiResult.shoppingLinks);

          if (isValidResult) {
              setResult(apiResult);
              
              const lastDecision = history[0];
              if (lastDecision && lastDecision.dilemma === dilemma) {
                const updatedDecision: IDecision = {
                  ...lastDecision,
                  criteria: currentCriteria,
                  result: apiResult
                };
                setHistory(prevHistory => [updatedDecision, ...prevHistory.slice(1)]);
              }
              toast.success("Analyse mise à jour !");

          } else {
            throw new Error("La structure de la réponse de l'IA pour les options est invalide.");
          }
        } catch (e) {
          if (e instanceof Error) {
            toast.error(`Erreur lors de la mise à jour de l'analyse : ${e.message}`);
          }
        } finally {
          setIsUpdating(false);
        }
    };

    const handleStartAnalysis = async () => {
        setAnalysisStep('analyzing');
        setProgress(0);
        setProgressMessage("Initialisation de l'analyse...");
        setResult(null);
        setCriteria([]);

        setTimeout(() => setProgress(10), 100);

        const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", veuillez fournir une analyse complète.
        JSON attendu :
        {
          "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"],
          "result": {
            "recommendation": "Option Recommandée",
            "description": "Un texte descriptif (2-3 phrases) et engageant expliquant pourquoi c'est la meilleure option. Sois convaincant.",
            "imageQuery": "une requête de recherche d'image pertinente en anglais pour Unsplash (ex: 'modern laptop on desk')",
            "infoLinks": [
              { "title": "Titre du lien d'information 1", "url": "https://example.com/info1" },
              { "title": "Titre du lien d'information 2", "url": "https://example.com/info2" }
            ],
            "shoppingLinks": [
              { "title": "Titre du lien d'achat 1", "url": "https://example.com/shop1" },
              { "title": "Titre du lien d'achat 2", "url": "https://example.com/shop2" }
            ],
            "breakdown": [
              {
                "option": "Option 1",
                "pros": ["Avantage 1"],
                "cons": ["Inconvénient 1"],
                "score": 85
              }
            ]
          }
        }`;
        
        try {
          setProgress(25);
          setProgressMessage("Génération des critères et options...");
          const response = await callOpenAiApi(prompt);
          setProgress(75);
          setProgressMessage("Finalisation de l'analyse...");

          const isValidCriteria = response && response.criteria && Array.isArray(response.criteria);
          const apiResult = response.result;
          const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number') && apiResult.description && apiResult.imageQuery && Array.isArray(apiResult.infoLinks) && Array.isArray(apiResult.shoppingLinks);

          if (isValidCriteria && isValidResult) {
              const newCriteria = response.criteria.map((name: string) => ({
                id: crypto.randomUUID(),
                name,
              }));
              setCriteria(newCriteria);
              setResult(apiResult);
              
              const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                criteria: newCriteria,
                result: apiResult
              };
              setHistory(prevHistory => [newDecision, ...prevHistory]);
              
              setProgress(100);
              setAnalysisStep('done');
              toast.success("Analyse complète générée !");
          } else {
            throw new Error("La structure de la réponse de l'IA est invalide.");
          }
        } catch (e) {
          if (e instanceof Error) {
            toast.error(`Erreur lors de l'analyse : ${e.message}`);
          }
          setAnalysisStep('idle');
          setProgress(0);
          setProgressMessage('');
        }
    };
    
    const debouncedGenerateOptions = useDebounceCallback(handleGenerateOptions, 2000);

    useEffect(() => {
        if (analysisStep === 'done') {
        initialCriteriaRef.current = criteria;
        }
    }, [analysisStep, criteria]);

    useEffect(() => {
        const criteriaHaveChanged = JSON.stringify(criteria) !== JSON.stringify(initialCriteriaRef.current);
        if (analysisStep === 'done' && criteriaHaveChanged && !isUpdating) {
        toast.info("Les critères ont changé, mise à jour de l'analyse...", { icon: <RefreshCw className="animate-spin" />, duration: 2000 });
        debouncedGenerateOptions();
        }
    }, [criteria, analysisStep, debouncedGenerateOptions, isUpdating]);
    
    const applyTemplate = (template: typeof templates[0]) => {
        setDilemma(template.dilemma);
        setResult(null);
        setCriteria([]);
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        toast.success(`Modèle "${template.name}" appliqué !`);
    }

    const clearSession = () => {
        setDilemma('');
        setResult(null);
        setCriteria([]);
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        toast.info("Session réinitialisée.");
    }
    
    const loadDecision = (decisionId: string) => {
        const decisionToLoad = history.find(d => d.id === decisionId);
        if (decisionToLoad) {
            setDilemma(decisionToLoad.dilemma);
            setCriteria(decisionToLoad.criteria);
            // Ensure backward compatibility for old history items
            const resultWithDefaults: IResult = {
                description: '',
                imageQuery: 'decision',
                infoLinks: [],
                shoppingLinks: [],
                ...decisionToLoad.result,
            };
            setResult(resultWithDefaults);
            setAnalysisStep('done');
            setProgress(0);
            setProgressMessage('');
            toast.info("Décision précédente chargée.");
        }
    };

    const deleteDecision = (decisionId: string) => {
        setHistory(prevHistory => prevHistory.filter(d => d.id !== decisionId));
        toast.success("Décision supprimée de l'historique.");
    };

    const clearHistory = () => {
        setHistory([]);
        toast.info("L'historique des décisions a été effacé.");
    };

    return {
        dilemma,
        setDilemma,
        analysisStep,
        progress,
        progressMessage,
        criteria,
        setCriteria,
        result,
        history,
        isUpdating,
        isLoading,
        handleStartAnalysis,
        applyTemplate,
        clearSession,
        loadDecision,
        deleteDecision,
        clearHistory,
        templates
    };
};
