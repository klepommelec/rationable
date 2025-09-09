import { useState, useEffect } from 'react';
import { IDecision } from '@/types/decision';
import { useWorkspaces } from '@/hooks/useWorkspaces';

export const useLocalDecisionHistory = () => {
    const { currentWorkspace } = useWorkspaces();
    const [allHistory, setAllHistory] = useState<Record<string, IDecision[]>>({});
    const [history, setHistory] = useState<IDecision[]>([]);

    useEffect(() => {
        try {
            // Load all workspace histories
            const storedAllHistory = localStorage.getItem('workspaceDecisionHistory');
            const storedOldHistory = localStorage.getItem('decisionHistory');
            
            let loadedAllHistory: Record<string, IDecision[]> = {};
            
            if (storedAllHistory) {
                loadedAllHistory = JSON.parse(storedAllHistory);
            }
            
            // Migrate old history to default workspace if it exists
            if (storedOldHistory && !storedAllHistory) {
                const parsedHistory: IDecision[] = JSON.parse(storedOldHistory);
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
                    if (!newDecision.category) {
                        newDecision.category = undefined;
                    }
                    if (!newDecision.tags) {
                        newDecision.tags = [];
                    }
                    return newDecision;
                });
                
                // Put migrated history in 'default' workspace
                loadedAllHistory['default'] = migratedHistory;
                
                // Remove old storage
                localStorage.removeItem('decisionHistory');
            }
            
            setAllHistory(loadedAllHistory);
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    // Update history when workspace changes
    useEffect(() => {
        if (currentWorkspace) {
            const workspaceHistory = allHistory[currentWorkspace.id] || [];
            setHistory(workspaceHistory);
        } else {
            // Fallback to default workspace or empty array
            const defaultHistory = allHistory['default'] || [];
            setHistory(defaultHistory);
        }
    }, [currentWorkspace, allHistory]);

    // Migration one-shot: si l'espace courant est vide mais 'default' a de l'historique
    useEffect(() => {
        try {
            const workspaceId = currentWorkspace?.id || 'default';
            const migrationFlag = localStorage.getItem('historyMigratedToWorkspace');
            if (!migrationFlag && workspaceId !== 'default') {
                const defaultHistory = allHistory['default'] || [];
                const workspaceHistory = allHistory[workspaceId] || [];
                if (workspaceHistory.length === 0 && defaultHistory.length > 0) {
                    setAllHistory(prev => ({
                        ...prev,
                        [workspaceId]: [...defaultHistory]
                    }));
                    localStorage.setItem('historyMigratedToWorkspace', '1');
                    console.log('🗂️ Historique migré depuis "default" vers workspace', workspaceId);
                }
            }
        } catch (e) {
            console.error('Migration history error', e);
        }
    }, [currentWorkspace, allHistory]);

    useEffect(() => {
        // Debounce saving to localStorage
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('workspaceDecisionHistory', JSON.stringify(allHistory));
            } catch (error) {
                console.error("Failed to save history to localStorage", error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [allHistory]);

    const addDecision = async (decision: IDecision) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: [decision, ...workspaceHistory]
            };
        });
    };

    const updateDecision = async (updatedDecision: IDecision) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            const index = workspaceHistory.findIndex(d => d.id === updatedDecision.id);
            
            let newWorkspaceHistory;
            if (index > -1) {
                newWorkspaceHistory = [...workspaceHistory];
                newWorkspaceHistory[index] = updatedDecision;
            } else {
                newWorkspaceHistory = [updatedDecision, ...workspaceHistory];
            }
            
            return {
                ...prevAllHistory,
                [workspaceId]: newWorkspaceHistory
            };
        });
    };
    
    const updateDecisionCategory = async (decisionId: string, categoryId: string | undefined) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            const index = workspaceHistory.findIndex(d => d.id === decisionId);
            
            if (index > -1) {
                const newWorkspaceHistory = [...workspaceHistory];
                newWorkspaceHistory[index] = {
                    ...newWorkspaceHistory[index],
                    category: categoryId
                };
                
                return {
                    ...prevAllHistory,
                    [workspaceId]: newWorkspaceHistory
                };
            }
            return prevAllHistory;
        });
    };
    
    const deleteDecision = async (decisionId: string) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: workspaceHistory.filter(d => d.id !== decisionId)
            };
        });
    };

    const clearHistory = async () => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => ({
            ...prevAllHistory,
            [workspaceId]: []
        }));
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