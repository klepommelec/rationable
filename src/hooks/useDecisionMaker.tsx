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

type AnalysisStep = 'idle' | 'criteria-loaded' | 'loading-options' | 'done';

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
    const [hasChanges, setHasChanges] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const { history, addDecision, updateDecision, deleteDecision, clearHistory } = useDecisionHistory();
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'loading-options';

    const setEmoji = (newEmoji: string) => {
        setEmojiState(newEmoji);
        if (analysisStep === 'done' && currentDecisionId) {
            const decision = history.find(d => d.id === currentDecisionId);
            if (decision && decision.emoji !== newEmoji) {
                updateDecision({ ...decision, emoji: newEmoji });
            }
        }
    };

    // Vérifier si les critères ont changé
    useEffect(() => {
        if (analysisStep === 'done') {
            const criteriaHaveChanged = JSON.stringify(criteria) !== JSON.stringify(initialCriteriaRef.current);
            setHasChanges(criteriaHaveChanged);
        } else {
            setHasChanges(false);
        }
    }, [criteria, analysisStep]);

    const handleGenerateOptions = async (isRetry = false) => {
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
        
        if (isRetry) {
            setRetryCount(prev => prev + 1);
            console.log(`Tentative de génération d'options n°${retryCount + 1}`);
        }

        try {
          console.log("Generating options with criteria:", currentCriteria);
          const apiResult = await generateOptions(dilemma, currentCriteria);
          console.log("Options generated successfully:", apiResult);
          
          setResult(apiResult);
          setAnalysisStep('done');
          setRetryCount(0);
          
          // Mettre à jour les critères de référence
          initialCriteriaRef.current = currentCriteria;
          setHasChanges(false);
          
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
          
          toast.success(isRetry ? "Options générées avec succès !" : "Analyse mise à jour !");
        } catch (e) {
          console.error("Error generating options:", e);
          const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
          
          if (retryCount < 2) {
            toast.error(`${errorMessage} - Nouvelle tentative...`);
            setTimeout(() => handleGenerateOptions(true), 1500);
          } else {
            toast.error(`Impossible de générer les options après ${retryCount + 1} tentatives. ${errorMessage}`);
            setAnalysisStep('criteria-loaded');
            setRetryCount(0);
          }
        } finally {
          setIsUpdating(false);
          setProgressMessage('');
        }
    };

    const handleManualUpdate = () => {
        if (hasChanges) {
            handleGenerateOptions();
        }
    };

    const handleStartAnalysis = async () => {
        console.log("Starting analysis for dilemma:", dilemma);
        setProgress(0);
        setProgressMessage("Génération des critères...");
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
        setCurrentDecisionId(null);
        setHasChanges(false);
        setRetryCount(0);

        try {
          // Phase 1: Générer les critères
          console.log("Phase 1: Generating criteria");
          const response = await generateCriteriaOnly(dilemma);
          console.log("Criteria generated:", response);
          
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          
          setCriteria(newCriteria);
          setEmojiState(response.emoji || '🤔');
          setAnalysisStep('criteria-loaded');
          
          // Phase 2: Générer automatiquement les options
          setTimeout(async () => {
            console.log("Phase 2: Generating options automatically");
            setAnalysisStep('loading-options');
            setProgressMessage("Génération des options...");
            
            try {
              const optionsResult = await generateOptions(dilemma, newCriteria);
              console.log("Options generated automatically:", optionsResult);
              setResult(optionsResult);
              
              // Définir les critères de référence
              initialCriteriaRef.current = newCriteria;
              
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
              console.error("Error in automatic options generation:", e);
              const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
              toast.error(`Erreur lors de la génération automatique : ${errorMessage}`);
              setAnalysisStep('criteria-loaded');
            } finally {
              setProgressMessage('');
            }
          }, 800);
          
        } catch (e) {
          console.error("Error in analysis start:", e);
          const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
          toast.error(`Erreur lors de l'analyse : ${errorMessage}`);
          setAnalysisStep('idle');
          setProgress(0);
          setProgressMessage('');
        }
    };
    
    const applyTemplate = (template: typeof templates[0]) => {
        setDilemma(template.dilemma);
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
        setAnalysisStep('idle');
        setProgress(0);
        setProgressMessage('');
        setCurrentDecisionId(null);
        setHasChanges(false);
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
        setHasChanges(false);
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
            
            // Définir les critères de référence pour éviter les changements fantômes
            initialCriteriaRef.current = decisionToLoad.criteria;
            setHasChanges(false);
            
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
        hasChanges,
        handleStartAnalysis,
        handleManualUpdate,
        applyTemplate,
        clearSession,
        loadDecision,
        deleteDecision: handleDeleteDecision,
        clearHistory: handleClearHistory,
        templates
    };
};
