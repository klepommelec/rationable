
import { useEffect } from 'react';
import { toast } from "sonner";
import { IDecision, IResult, ICriterion } from '@/types/decision';
import { AnalysisStep } from './useDecisionState';

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
  {
    name: "🚗 Acheter une voiture",
    dilemma: "Quelle voiture devrais-je acheter selon mon budget et mes besoins ?",
  },
  {
    name: "🏠 Choisir un logement",
    dilemma: "Dans quel quartier devrais-je déménager ?",
  },
  {
    name: "💼 Opportunité de carrière",
    dilemma: "Devrais-je accepter cette nouvelle offre d'emploi ?",
  },
  {
    name: "🎓 Formation professionnelle",
    dilemma: "Quelle formation devrais-je suivre pour évoluer dans ma carrière ?",
  },
  {
    name: "📱 Smartphone",
    dilemma: "Quel smartphone choisir pour remplacer mon ancien téléphone ?",
  },
  {
    name: "🍽️ Restaurant pour dîner",
    dilemma: "Dans quel restaurant devrions-nous aller ce soir ?",
  },
  {
    name: "💰 Investissement financier",
    dilemma: "Comment devrais-je investir mes économies cette année ?",
  },
  {
    name: "🎮 Console de jeux",
    dilemma: "Quelle console de jeux vidéo devrais-je acheter ?",
  },
  {
    name: "🏋️ Salle de sport",
    dilemma: "Dans quelle salle de sport devrais-je m'inscrire ?",
  },
];

interface UseDecisionActionsProps {
    criteria: ICriterion[];
    analysisStep: AnalysisStep;
    initialCriteriaRef: React.MutableRefObject<ICriterion[]>;
    setHasChanges: (hasChanges: boolean) => void;
    setDilemma: (dilemma: string) => void;
    resetState: () => void;
    setEmoji: (emoji: string) => void;
    setCriteria: (criteria: ICriterion[]) => void;
    setResult: (result: IResult | null) => void;
    setCurrentDecisionId: (id: string | null) => void;
    setSelectedCategory: (category: string | undefined) => void;
    history: IDecision[];
    updateDecision: (decision: IDecision) => void;
    deleteDecision: (id: string) => void;
    clearHistory: () => void;
    currentDecisionId: string | null;
    handleGenerateOptions: () => void;
    setAnalysisStep: (step: AnalysisStep) => void;
}

export const useDecisionActions = ({
    criteria,
    analysisStep,
    initialCriteriaRef,
    setHasChanges,
    setDilemma,
    resetState,
    setEmoji,
    setCriteria,
    setResult,
    setCurrentDecisionId,
    setSelectedCategory,
    history,
    updateDecision,
    deleteDecision,
    clearHistory,
    currentDecisionId,
    handleGenerateOptions,
    setAnalysisStep
}: UseDecisionActionsProps) => {

    // Vérifier si les critères ont changé
    useEffect(() => {
        if (analysisStep === 'done') {
            const criteriaHaveChanged = JSON.stringify(criteria) !== JSON.stringify(initialCriteriaRef.current);
            setHasChanges(criteriaHaveChanged);
        } else {
            setHasChanges(false);
        }
    }, [criteria, analysisStep, setHasChanges]);

    const handleCategoryChange = (categoryId: string | undefined) => {
        // Ne fait rien car la catégorie est maintenant automatique
        console.log('Category change ignored - now automatic:', categoryId);
    };

    const handleUpdateCategory = (decisionId: string, categoryId: string | undefined) => {
        updateDecision({ 
            ...history.find(d => d.id === decisionId)!, 
            category: categoryId 
        });
    };

    const handleManualUpdate = () => {
        console.log("🔄 [DEBUG] Manual update triggered");
        handleGenerateOptions();
    };

    const applyTemplate = (template: typeof templates[0]) => {
        // D'abord reset l'état
        resetState();
        // Puis appliquer le dilemme du template
        setDilemma(template.dilemma);
        toast.success(`Modèle "${template.name}" appliqué !`);
    };

    const clearSession = () => {
        resetState();
        toast.info("Session réinitialisée.");
    };
    
    const loadDecision = (decisionId: string) => {
        console.log('loadDecision called with id:', decisionId);
        const decisionToLoad = history.find(d => d.id === decisionId);
        if (decisionToLoad) {
            console.log('Decision found, loading:', decisionToLoad);
            setDilemma(decisionToLoad.dilemma);
            setCriteria(decisionToLoad.criteria);
            setEmoji(decisionToLoad.emoji || '🤔');
            setSelectedCategory(decisionToLoad.category);
            const resultWithDefaults: IResult = {
                description: '',
                infoLinks: [],
                shoppingLinks: [],
                ...decisionToLoad.result,
            };
            setResult(resultWithDefaults);
            setCurrentDecisionId(decisionToLoad.id);
            setAnalysisStep('done'); // Important: mettre à jour l'étape d'analyse
            
            // Définir les critères de référence pour éviter les changements fantômes
            initialCriteriaRef.current = decisionToLoad.criteria;
            setHasChanges(false);
            
            toast.info("Décision précédente chargée.");
        } else {
            console.error('Decision not found with id:', decisionId);
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

    const getCurrentDecision = () => {
        if (!currentDecisionId) {
            console.log('🔍 [DEBUG] getCurrentDecision: no currentDecisionId');
            return null;
        }
        const decision = history.find(d => d.id === currentDecisionId) || null;
        console.log('🔍 [DEBUG] getCurrentDecision:', {
            currentDecisionId,
            foundDecision: !!decision,
            historyLength: history.length
        });
        return decision;
    };

    return {
        templates,
        handleCategoryChange,
        handleUpdateCategory,
        handleManualUpdate,
        applyTemplate,
        clearSession,
        loadDecision,
        handleDeleteDecision,
        handleClearHistory,
        getCurrentDecision
    };
};
