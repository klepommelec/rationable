
import { useState, useEffect } from 'react';
import { IDecision } from '@/types/decision';

export const useDecisionHistory = () => {
    const [history, setHistory] = useState<IDecision[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('decisionHistory');
            if (storedHistory) {
                const parsedHistory: IDecision[] = JSON.parse(storedHistory);
                // Data migration for old history items
                const migratedHistory = parsedHistory.map(decision => {
                    let newDecision = { ...decision };
                    if (!newDecision.result.imageQuery && newDecision.result.recommendation) {
                        newDecision = {
                            ...newDecision,
                            result: {
                                ...newDecision.result,
                                imageQuery: newDecision.result.recommendation,
                            }
                        };
                    }
                    if (!newDecision.emoji) {
                        newDecision.emoji = '🤔';
                    }
                    // Migration pour les nouvelles propriétés
                    if (!newDecision.category) {
                        newDecision.category = undefined;
                    }
                    if (!newDecision.tags) {
                        newDecision.tags = [];
                    }
                    return newDecision;
                });
                setHistory(migratedHistory);
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    useEffect(() => {
        // Debounce saving to localStorage
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('decisionHistory', JSON.stringify(history));
            } catch (error) {
                console.error("Failed to save history to localStorage", error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [history]);

    const addDecision = (decision: IDecision) => {
        setHistory(prevHistory => [decision, ...prevHistory]);
    };

    const updateDecision = (updatedDecision: IDecision) => {
        setHistory(prevHistory => {
            const index = prevHistory.findIndex(d => d.id === updatedDecision.id);
            if (index > -1) {
                const newHistory = [...prevHistory];
                newHistory[index] = updatedDecision;
                return newHistory;
            }
            return [updatedDecision, ...prevHistory];
        });
    };
    
    const updateDecisionCategory = (decisionId: string, categoryId: string | undefined) => {
        setHistory(prevHistory => {
            const index = prevHistory.findIndex(d => d.id === decisionId);
            if (index > -1) {
                const newHistory = [...prevHistory];
                newHistory[index] = {
                    ...newHistory[index],
                    category: categoryId
                };
                return newHistory;
            }
            return prevHistory;
        });
    };
    
    const deleteDecision = (decisionId: string) => {
        setHistory(prevHistory => prevHistory.filter(d => d.id !== decisionId));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return { 
        history, 
        addDecision, 
        updateDecision, 
        updateDecisionCategory,
        deleteDecision, 
        clearHistory 
    };
};
