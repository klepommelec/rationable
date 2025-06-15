import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useDebounceCallback } from 'usehooks-ts';
import { RefreshCw } from 'lucide-react';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { useDecisionHistory } from './useDecisionHistory';
import { startAnalysis, generateOptions, generateConversationQuestions, analyzeWithConversationContext } from '@/services/decisionService';

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
    const [analysisStep, setAnalysisStep] = useState<'idle' | 'conversation' | 'analyzing' | 'done'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [result, setResult] = useState<IResult | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);
    
    // États pour la conversation
    const [conversationQuestions, setConversationQuestions] = useState<IConversationQuestion[]>([]);
    const [conversationAnswers, setConversationAnswers] = useState<Record<string, string>>({});
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    const { history, addDecision, updateDecision, deleteDecision, clearHistory } = useDecisionHistory();
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'analyzing';

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

    const handleStartConversation = async () => {
        setAnalysisStep('conversation');
        setIsLoadingQuestions(true);
        setConversationQuestions([]);
        setConversationAnswers({});

        try {
            const response = await generateConversationQuestions(dilemma);
            setConversationQuestions(response.questions);
            toast.success(`Questions prêtes ! Temps estimé : ${response.estimatedTime}`);
        } catch (e) {
            if (e instanceof Error) {
                toast.error(`Erreur lors de la génération des questions : ${e.message}`);
            }
            setAnalysisStep('idle');
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleConversationComplete = async (answers: Record<string, string>) => {
        setConversationAnswers(answers);
        setAnalysisStep('analyzing');
        setProgress(0);
        setProgressMessage("Analyse personnalisée en cours...");
        setResult(null);
        setCriteria([]);
        setCurrentDecisionId(null);

        setTimeout(() => setProgress(10), 100);
        
        try {
            setProgress(25);
            setProgressMessage("Intégration du contexte conversationnel...");
            const response = await analyzeWithConversationContext(dilemma, answers);
            setProgress(75);
            setProgressMessage("Finalisation de l'analyse personnalisée...");

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
            toast.success("Analyse personnalisée terminée !");
        } catch (e) {
            if (e instanceof Error) {
                toast.error(`Erreur lors de l'analyse : ${e.message}`);
            }
            setAnalysisStep('idle');
            setProgress(0);
            setProgressMessage('');
        }
    };

    const handleStartAnalysis = async () => {
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

    const handleBackToSetup = () => {
        setAnalysisStep('idle');
        setConversationQuestions([]);
        setConversationAnswers({});
        setProgress(0);
        setProgressMessage('');
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
        setConversationQuestions([]);
        setConversationAnswers({});
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
        setConversationQuestions([]);
        setConversationAnswers({});
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
        conversationQuestions,
        isLoadingQuestions,
        handleStartAnalysis,
        handleStartConversation,
        handleConversationComplete,
        handleBackToSetup,
        applyTemplate,
        clearSession,
        loadDecision,
        deleteDecision: handleDeleteDecision,
        clearHistory: handleClearHistory,
        templates
    };
};
