
import { useState, useRef, useEffect } from 'react';
import { ICriterion, IResult } from '@/types/decision';
import { useWorkspaces } from './useWorkspaces';

export type AnalysisStep = 'idle' | 'criteria-loaded' | 'loading-options' | 'done';

export const useDecisionState = () => {
    const { currentWorkspace } = useWorkspaces();
    const [dilemma, setDilemma] = useState('');
    const [emoji, setEmojiState] = useState('🤔');
    const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    const [result, setResult] = useState<IResult | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentDecisionId, setCurrentDecisionId] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    
    const initialCriteriaRef = useRef<ICriterion[]>([]);
    
    const isLoading = analysisStep === 'loading-options';

    const setEmoji = (newEmoji: string) => {
        setEmojiState(newEmoji);
        // Note: History update logic will be handled in useDecisionActions
    };

    const resetState = () => {
        setDilemma('');
        setResult(null);
        setCriteria([]);
        setEmojiState('🤔');
        setAnalysisStep('idle');
        setCurrentDecisionId(null);
        setHasChanges(false);
        setSelectedCategory(undefined);
    };

    // Clear session when workspace changes
    useEffect(() => {
        if (currentWorkspace) {
            resetState();
        }
    }, [currentWorkspace?.id]);

    return {
        // States
        dilemma,
        setDilemma,
        emoji,
        setEmoji,
        analysisStep,
        setAnalysisStep,
        criteria,
        setCriteria,
        result,
        setResult,
        isUpdating,
        setIsUpdating,
        currentDecisionId,
        setCurrentDecisionId,
        hasChanges,
        setHasChanges,
        selectedCategory,
        setSelectedCategory,
        initialCriteriaRef,
        isLoading,
        resetState
    };
};
