
import { useState } from 'react';
import { useDecisionHistory } from './useDecisionHistory';
import { useDecisionState } from './useDecisionState';
import { useDecisionProgress } from './useDecisionProgress';
import { useDecisionAPI } from './useDecisionAPI';
import { useDecisionActions } from './useDecisionActions';
import { UploadedFile } from '@/components/FileUpload';

export const useDecisionMaker = () => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    
    const { history, addDecision, updateDecision, updateDecisionCategory, deleteDecision, clearHistory } = useDecisionHistory();
    
    const {
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
    } = useDecisionState();

    const {
        progress,
        progressMessage,
        retryCount,
        setProgressMessage,
        incrementRetry,
        resetRetry
    } = useDecisionProgress();

    const { handleGenerateOptions, handleStartAnalysis } = useDecisionAPI({
        dilemma,
        criteria,
        setResult,
        setAnalysisStep,
        setCriteria,
        setEmoji,
        setSelectedCategory,
        setIsUpdating,
        setProgressMessage,
        retryCount,
        incrementRetry,
        resetRetry,
        initialCriteriaRef,
        setHasChanges,
        currentDecisionId,
        setCurrentDecisionId,
        history,
        updateDecision,
        addDecision,
        uploadedFiles
    });

    const {
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
    } = useDecisionActions({
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
    });

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
        selectedCategory,
        handleCategoryChange,
        handleUpdateCategory,
        handleStartAnalysis,
        handleManualUpdate,
        applyTemplate,
        clearSession,
        loadDecision,
        deleteDecision: handleDeleteDecision,
        clearHistory: handleClearHistory,
        getCurrentDecision,
        templates,
        uploadedFiles,
        setUploadedFiles
    };
};
