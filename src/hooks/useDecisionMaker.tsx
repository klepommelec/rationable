import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useDebounceCallback } from 'usehooks-ts';
import { RefreshCw } from 'lucide-react';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { useDecisionHistory } from './useDecisionHistory';
import { useProgressiveAnalysis } from './useProgressiveAnalysis';
import { startAnalysis, generateOptions } from '@/services/decisionService';

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
    const [emoji, setEmojiState] = useState('🤔');
    const [analysisStep, setAnalysisStep] = useState<'idle' | 'analyzing' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [result, setResult] = useState<IResult | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);
    const [useProgressiveMode, setUseProgressiveMode] = useState(false);

    const { history, addDecision, updateDecision, deleteDecision, clearHistory } = useDecisionHistory();
    const {
        progressiveState,
        generatedCriteria,
        finalResult,
        emoji: progressiveEmoji,
        startProgressiveAnalysis,
        resetProgressiveAnalysis,
        isAnalyzing: isProgressiveAnalyzing
    } = useProgressiveAnalysis();
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'analyzing' || isProgressiveAnalyzing;

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

        try {
          const apiResult = await generateOptions(dilemma, currentCriteria);
          setResult(apiResult);
          
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
            await handleStartProgressiveAnalysis();
        } else {
            await handleStartClassicAnalysis();
        }
    };

    const handleStartProgressiveAnalysis = async () => {
        setAnalysisStep('analyzing');
        resetProgressiveAnalysis();
        setResult(null);
        setCriteria([]);
        setCurrentDecisionId(null);

        try {
            const progressiveResult = await startProgressiveAnalysis(dilemma);
            
            setEmojiState(progressiveResult.emoji);
            setCriteria(progressiveResult.criteria);
            setResult(progressiveResult.result);
            
            const newDecision: IDecision = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                dilemma,
                emoji: progressiveResult.emoji,
                criteria: progressiveResult.criteria,
                result: progressiveResult.result
            };
            addDecision(newDecision);
            setCurrentDecisionId(newDecision.id);
            
            setAnalysisStep('done');
            toast.success("Analyse progressive complète !");
        } catch (e) {
            if (e instanceof Error) {
                toast.error(`Erreur lors de l'analyse progressive : ${e.message}`);
            }
            setAnalysisStep('idle');
        }
    };

    const handleStartClassicAnalysis = async () => {
        setAnalysisStep('analyzing');
        setProgress(0);
        setProgressMessage("Initialisation de l'analyse...");
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
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
          setResult(response.result);
          setEmojiState(response.emoji || '🤔');
          
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
          setAnalysisStep('done');
          toast.success("Analyse complète générée !");
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
        setEmojiState('🤔');
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        setCurrentDecisionId(null);
        setUseProgressiveMode(false);
        resetProgressiveAnalysis();
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
        setUseProgressiveMode(false);
        resetProgressiveAnalysis();
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
        emoji: useProgressiveMode && isProgressiveAnalyzing ? progressiveEmoji : emoji,
        setEmoji,
        analysisStep,
        progress: useProgressiveMode ? progressiveState.progress : progress,
        progressMessage: useProgressiveMode ? progressiveState.message : progressMessage,
        criteria: useProgressiveMode && isProgressiveAnalyzing ? generatedCriteria : criteria,
        setCriteria,
        result: useProgressiveMode && finalResult ? finalResult : result,
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
        useProgressiveMode,
        setUseProgressiveMode,
        progressiveState,
        isProgressiveAnalyzing
    };
};
