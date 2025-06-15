
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useDebounceCallback } from 'usehooks-ts';
import { RefreshCw } from 'lucide-react';
import { ICriterion, IResult, IDecision, AnalysisStep } from '@/types/decision';
import { useDecisionHistory } from './useDecisionHistory';
import { startAnalysis, generateOptions } from '@/services/decisionService';
import { useProgressiveAnalysis } from './useProgressiveAnalysis';

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
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);
    const [useProgressiveMode, setUseProgressiveMode] = useState(true);

    // Mode classique
    const [classicAnalysisStep, setClassicAnalysisStep] = useState<'idle' | 'analyzing' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [classicResult, setClassicResult] = useState<IResult | null>(null);
    const [classicEmoji, setClassicEmojiState] = useState('🤔');

    // Mode progressif
    const {
        analysisStep: progressiveAnalysisStep,
        generatedCriteria,
        validatedCriteria,
        result: progressiveResult,
        emoji: progressiveEmoji,
        startProgressiveAnalysis,
        handleCriteriaValidation,
        resetAnalysis,
        setEmoji: setProgressiveEmoji
    } = useProgressiveAnalysis();

    const { history, addDecision, updateDecision, deleteDecision, clearHistory } = useDecisionHistory();
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    // États unifiés basés sur le mode
    const analysisStep = useProgressiveMode ? progressiveAnalysisStep : classicAnalysisStep;
    const result = useProgressiveMode ? progressiveResult : classicResult;
    const emoji = useProgressiveMode ? progressiveEmoji : classicEmoji;
    const isLoading = analysisStep === 'analyzing' || analysisStep === 'generating-criteria' || analysisStep === 'final-analysis';

    const setEmoji = (newEmoji: string) => {
        if (useProgressiveMode) {
            setProgressiveEmoji(newEmoji);
        } else {
            setClassicEmojiState(newEmoji);
        }
        
        if (analysisStep === 'done' && currentDecisionId) {
            const decision = history.find(d => d.id === currentDecisionId);
            if (decision && decision.emoji !== newEmoji) {
                updateDecision({ ...decision, emoji: newEmoji });
            }
        }
    };

    // Mise à jour des critères selon le mode
    useEffect(() => {
        if (useProgressiveMode && validatedCriteria.length > 0) {
            setCriteria(validatedCriteria);
        }
    }, [validatedCriteria, useProgressiveMode]);

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

        try {
          const apiResult = await generateOptions(dilemma, currentCriteria);
          if (useProgressiveMode) {
            // Le mode progressif gère déjà le résultat
          } else {
            setClassicResult(apiResult);
          }
          
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
        } finally {
          setIsUpdating(false);
        }
    };

    const handleStartAnalysis = async () => {
        if (useProgressiveMode) {
            await startProgressiveAnalysis(dilemma);
        } else {
            // Mode classique existant
            setClassicAnalysisStep('analyzing');
            setProgress(0);
            setProgressMessage("Initialisation de l'analyse...");
            setClassicResult(null);
            setCriteria([]);
            setClassicEmojiState('🤔');
            setCurrentDecisionId(null);

            setTimeout(() => setProgress(10), 100);
            
            try {
              setProgress(25);
              setProgressMessage("Génération des critères et options...");
              const response = await startAnalysis(dilemma);
              setProgress(75);
              setProgressMessage("Finalisation de l'analyse...");

              const newCriteria = response.criteria.map((name: string) => ({
                id: crypto.randomUUID(),
                name,
              }));
              setCriteria(newCriteria);
              setClassicResult(response.result);
              setClassicEmojiState(response.emoji || '🤔');
              
              const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: response.emoji || '🤔',
                criteria: newCriteria,
                result: response.result
              };
              addDecision(newDecision);
              setCurrentDecisionId(newDecision.id);
              
              setProgress(100);
              setClassicAnalysisStep('done');
              toast.success("Analyse complète générée !");
            } catch (e) {
              if (e instanceof Error) {
                toast.error(`Erreur lors de l'analyse : ${e.message}`);
              }
              setClassicAnalysisStep('idle');
              setProgress(0);
              setProgressMessage('');
            }
        }
    };

    const handleProgressiveCriteriaValidation = async (validatedCriteria: ICriterion[]) => {
        await handleCriteriaValidation(dilemma, validatedCriteria);
        
        // Sauvegarder la décision
        if (progressiveResult) {
            const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: progressiveEmoji || '🤔',
                criteria: validatedCriteria,
                result: progressiveResult
            };
            addDecision(newDecision);
            setCurrentDecisionId(newDecision.id);
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
        if (analysisStep === 'done' && criteriaHaveChanged && !isUpdating && !useProgressiveMode) {
        toast.info("Les critères ont changé, mise à jour de l'analyse...", { icon: <RefreshCw className="animate-spin" />, duration: 2000 });
        debouncedGenerateOptions();
        }
    }, [criteria, analysisStep, debouncedGenerateOptions, isUpdating, useProgressiveMode]);
    
    const applyTemplate = (template: typeof templates[0]) => {
        setDilemma(template.dilemma);
        setCriteria([]);
        setCurrentDecisionId(null);
        
        if (useProgressiveMode) {
            resetAnalysis();
        } else {
            setClassicResult(null);
            setClassicEmojiState('🤔');
            setClassicAnalysisStep('idle');
            setProgress(0);
            setProgressMessage('');
        }
        
        toast.success(`Modèle "${template.name}" appliqué !`);
    }

    const clearSession = () => {
        setDilemma('');
        setCriteria([]);
        setCurrentDecisionId(null);
        
        if (useProgressiveMode) {
            resetAnalysis();
        } else {
            setClassicResult(null);
            setClassicEmojiState('🤔');
            setClassicAnalysisStep('idle');
            setProgress(0);
            setProgressMessage('');
        }
        
        toast.info("Session réinitialisée.");
    }
    
    const loadDecision = (decisionId: string) => {
        const decisionToLoad = history.find(d => d.id === decisionId);
        if (decisionToLoad) {
            setDilemma(decisionToLoad.dilemma);
            setCriteria(decisionToLoad.criteria);
            
            const resultWithDefaults: IResult = {
                description: '',
                infoLinks: [],
                shoppingLinks: [],
                ...decisionToLoad.result,
            };
            
            if (useProgressiveMode) {
                // Mode progressif - pas encore implémenté pour le chargement
                setUseProgressiveMode(false);
            }
            
            setClassicResult(resultWithDefaults);
            setClassicEmojiState(decisionToLoad.emoji || '🤔');
            setCurrentDecisionId(decisionToLoad.id);
            setClassicAnalysisStep('done');
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
        templates,
        
        // Mode progressif
        useProgressiveMode,
        setUseProgressiveMode,
        generatedCriteria,
        handleProgressiveCriteriaValidation
    };
};
