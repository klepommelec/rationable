
import { useEffect } from 'react';
import { toast } from "sonner";
import { IDecision, IResult, ICriterion } from '@/types/decision';
import { AnalysisStep } from './useDecisionState';
import { getCommunityTemplates, copyTemplate } from '@/services/communityTemplateService';
import { useContextualContent } from './useContextualContent';

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
    const { getContextualTemplates } = useContextualContent();
    const templates = getContextualTemplates();

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

    const applyCommunityTemplate = async (templateId: string, templateData: IDecision) => {
        try {
            // Copy the template data
            resetState();
            setDilemma(templateData.dilemma);
            setCriteria(templateData.criteria);
            setEmoji(templateData.emoji);
            setSelectedCategory(templateData.category);
            
            // Increment copy count
            await copyTemplate(templateId);
            
            toast.success("Template communautaire appliqué !");
        } catch (error) {
            console.error('Error applying community template:', error);
            toast.error("Erreur lors de l'application du template");
        }
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
            setAnalysisStep('done');
            
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
        if (!currentDecisionId) return null;
        return history.find(d => d.id === currentDecisionId) || null;
    };

    return {
        templates,
        handleCategoryChange,
        handleUpdateCategory,
        handleManualUpdate,
        applyTemplate,
        applyCommunityTemplate,
        clearSession,
        loadDecision,
        handleDeleteDecision,
        handleClearHistory,
        getCurrentDecision
    };
};
