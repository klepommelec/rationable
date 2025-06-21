
import { useState } from 'react';

export const useDecisionProgress = () => {
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    const resetProgress = () => {
        setProgress(0);
        setProgressMessage('');
        setRetryCount(0);
    };

    const updateProgress = (newProgress: number, message: string) => {
        setProgress(newProgress);
        setProgressMessage(message);
    };

    const incrementRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    const resetRetry = () => {
        setRetryCount(0);
    };

    return {
        progress,
        progressMessage,
        retryCount,
        setProgress,
        setProgressMessage,
        setRetryCount,
        resetProgress,
        updateProgress,
        incrementRetry,
        resetRetry
    };
};
