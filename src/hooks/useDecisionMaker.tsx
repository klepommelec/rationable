import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useDebounceCallback } from 'usehooks-ts';
import { RefreshCw } from 'lucide-react';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { useDecisionHistory } from './useDecisionHistory';
import { generateCriteriaOnly, generateOptions } from '@/services/decisionService';

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

type AnalysisStep = 'idle' | 'loading-criteria' | 'criteria-loaded' | 'loading-options' | 'done';

export const useDecisionMaker = () => {
    const [dilemma, setDilemma] = useState('');
    const [emoji, setEmojiState] = useState('🤔');
    const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [result, setResult] = useState<IResult | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);

    const { history, addDecision, updateDecision, deleteDecision, clearHistory } = useDecisionHistory();
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'loading-criteria' || analysisStep === 'loading-options';

    const setEmoji = (newEmoji: string) => {
        setEmojiState(newEmoji);
        if (analysisStep === 'done' && currentDecisionId) {
            const decision = history.find(d => d.id === currentDecisionId);
            if (decision && decision.emoji !== newEmoji) {
                updateDecision({ ...decision, emoji: newEmoji });
            }
        }
    };

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
        setAnalysisStep('loading-options');
        setProgressMessage("Analyse des options en cours...");

        try {
          const apiResult = await generateOptions(dilemma, currentCriteria);
          setResult(apiResult);
          setAnalysisStep('done');
          
          if (currentDecisionId) {
            const decisionToUpdate = history.find(d => d.id === currentDecisionId);
            if (decisionToUpdate) {
                const updated: IDecision = {
                  ...decisionToUpdate,
                  criteria: currentCriteria,
                  result: apiResult
                };
                updateDecision(updated);
            }
          }
          toast.success("Analyse mise à jour !");
        } catch (e) {
          if (e instanceof Error) {
            toast.error(`Erreur lors de la mise à jour de l'analyse : ${e.message}`);
          }
          setAnalysisStep('criteria-loaded');
        } finally {
          setIsUpdating(false);
          setProgressMessage('');
        }
    };

    const handleStartAnalysis = async () => {
        setAnalysisStep('loading-criteria');
        setProgress(0);
        setProgressMessage("Génération des critères...");
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
        setCurrentDecisionId(null);

        try {
          // Phase 1: Générer les critères
          const response = await generateCriteriaOnly(dilemma);
          
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          
          setCriteria(newCriteria);
          setEmojiState(response.emoji || '🤔');
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options (délai réduit de 20%)
          setTimeout(async () => {
            setAnalysisStep('loading-options');
            setProgressMessage("Génération des options...");
            
            try {
              const optionsResult = await generateOptions(dilemma, newCriteria);
              setResult(optionsResult);
              
              const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: response.emoji || '🤔',
                criteria: newCriteria,
                result: optionsResult
              };
              addDecision(newDecision);
              setCurrentDecisionId(newDecision.id);
              
              setAnalysisStep('done');
              toast.success("Analyse complète générée !");
            } catch (e) {
              if (e instanceof Error) {
                toast.error(`Erreur lors de la génération des options : ${e.message}`);
              }
              setAnalysisStep('criteria-loaded');
            } finally {
              setProgressMessage('');
            }
          }, 800); // Réduit de 1000ms à 800ms (20% plus rapide)
          
        } catch (e) {
          if (e instanceof Error) {
            toast.error(`Erreur lors de l'analyse : ${e.message}`);
          }
          setAnalysisStep('idle');
          setProgress(0);
          setProgressMessage('');
        }
    };
    
    const debouncedGenerateOptions = useDebounceCallback(handleGenerateOptions, 1600); // Réduit de 2000ms à 1600ms (20% plus rapide)

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
        setEmojiState('🤔');
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        setCurrentDecisionId(null);
        toast.success(`Modèle "${template.name}" appliqué !`);
    }

    const clearSession = () => {
        setDilemma('');
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        setCurrentDecisionId(null);
        toast.info("Session réinitialisée.");
    }
    
    const loadDecision = (decisionId: string) => {
        const decisionToLoad = history.find(d => d.id === decisionId);
        if (decisionToLoad) {
            setDilemma(decisionToLoad.dilemma);
            setCriteria(decisionToLoad.criteria);
            setEmojiState(decisionToLoad.emoji || '🤔');
            const resultWithDefaults: IResult = {
                description: '',
                infoLinks: [],
                shoppingLinks: [],
                ...decisionToLoad.result,
            };
            setResult(resultWithDefaults);
            setCurrentDecisionId(decisionToLoad.id);
            setAnalysisStep('done');
            setProgress(0);
            setProgressMessage('');
            toast.info("Décision précédente chargée.");
        }
    };

    const handleDeleteDecision = (decisionId: string) => {
        if (decisionId === currentDecisionId) {
            clearSession();
        }
        deleteDecision(decisionId);
        toast.success("Décision supprimée de l'historique.");
    };

    const handleClearHistory = () => {
        clearSession();
        clearHistory();
        toast.info("L'historique des décisions a été effacé.");
    };

    return {
        dilemma,
        setDilemma,
        emoji,
        setEmoji,
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
        deleteDecision: handleDeleteDecision,
        clearHistory: handleClearHistory,
        templates
    };
};
