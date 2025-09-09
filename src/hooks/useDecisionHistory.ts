import { useState, useEffect } from 'react';
import { IDecision } from '@/types/decision';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import { useCloudDecisionHistory } from './useCloudDecisionHistory';

export const useDecisionHistory = () => {
    const { user } = useAuth();
    const { currentWorkspace } = useWorkspaces();
    
    // Always call all hooks first (hook rules compliance)
    const cloudHistory = useCloudDecisionHistory();
    const [allHistory, setAllHistory] = useState<Record<string, IDecision[]>>({});
    const [history, setHistory] = useState<IDecision[]>([]);

    // Effects for local storage (only runs for non-authenticated users)
    useEffect(() => {
        if (user?.id) return; // Skip if authenticated
        
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
    }, [user?.id]);

    // Update history when workspace changes (local storage only)
    useEffect(() => {
        if (user?.id) return; // Skip if authenticated
        
        if (currentWorkspace) {
            const workspaceHistory = allHistory[currentWorkspace.id] || [];
            setHistory(workspaceHistory);
        } else {
            // Fallback to default workspace or empty array
            const defaultHistory = allHistory['default'] || [];
            setHistory(defaultHistory);
        }
    }, [user?.id, currentWorkspace, allHistory]);

    // Migration one-shot (local storage only)
    useEffect(() => {
        if (user?.id) return; // Skip if authenticated
        
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
    }, [user?.id, currentWorkspace, allHistory]);

    // Save to localStorage (local storage only)
    useEffect(() => {
        if (user?.id) return; // Skip if authenticated
        
        // Debounce saving to localStorage
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('workspaceDecisionHistory', JSON.stringify(allHistory));
            } catch (error) {
                console.error("Failed to save history to localStorage", error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [user?.id, allHistory]);

    // Local storage functions
    const addDecisionLocal = async (decision: IDecision) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: [decision, ...workspaceHistory]
            };
        });
    };

    const updateDecisionLocal = async (updatedDecision: IDecision) => {
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
    
    const updateDecisionCategoryLocal = async (decisionId: string, categoryId: string | undefined) => {
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
    
    const deleteDecisionLocal = async (decisionId: string) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: workspaceHistory.filter(d => d.id !== decisionId)
            };
        });
    };

    const clearHistoryLocal = async () => {
        const workspaceId = currentWorkspace?.id || 'default';
        setAllHistory(prevAllHistory => ({
            ...prevAllHistory,
            [workspaceId]: []
        }));
    };

    // Return appropriate interface based on authentication
    if (user?.id) {
        // Return cloud history interface
        return {
            history: cloudHistory.history,
            addDecision: cloudHistory.addDecision,
            updateDecision: cloudHistory.updateDecision,
            updateDecisionCategory: cloudHistory.updateDecisionCategory,
            deleteDecision: cloudHistory.deleteDecision,
            clearHistory: cloudHistory.clearHistory
        };
    } else {
        // Return local storage interface
        return { 
            history, 
            addDecision: addDecisionLocal, 
            updateDecision: updateDecisionLocal, 
            updateDecisionCategory: updateDecisionCategoryLocal,
            deleteDecision: deleteDecisionLocal, 
            clearHistory: clearHistoryLocal 
        };
    }
};