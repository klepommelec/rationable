import { useState, useEffect } from 'react';
import { IDecision } from '@/types/decision';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useDecisionHistory = () => {
    const { user } = useAuth();
    const { currentWorkspace } = useWorkspaces();
    
    // Always declare all state hooks (both cloud and local)
    const [localHistory, setLocalHistory] = useState<Record<string, IDecision[]>>({});
    const [cloudHistory, setCloudHistory] = useState<IDecision[]>([]);
    const [history, setHistory] = useState<IDecision[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const isAuthenticated = !!user?.id;

    // Cloud history loading
    const loadCloudHistory = async () => {
        if (!user?.id) return;
        
        setIsSyncing(true);
        try {
            const workspaceId = currentWorkspace?.id;
            
            let query = supabase
                .from('decisions')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });
            
            if (workspaceId) {
                query = query.eq('workspace_id', workspaceId);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Failed to load cloud history:', error);
                return;
            }
            
            const decisions: IDecision[] = data?.map(row => {
                const decisionData = row.decision_data as any;
                return {
                    ...decisionData,
                    id: row.id
                };
            }) || [];
            
            setCloudHistory(decisions);
            setHistory(decisions);
            console.log(`📦 Loaded ${decisions.length} decisions from cloud`);
            
        } catch (error) {
            console.error('Cloud history load error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Local history loading effect
    useEffect(() => {
        if (isAuthenticated) return; // Skip for authenticated users
        
        try {
            const storedAllHistory = localStorage.getItem('workspaceDecisionHistory');
            const storedOldHistory = localStorage.getItem('decisionHistory');
            
            let loadedAllHistory: Record<string, IDecision[]> = {};
            
            if (storedAllHistory) {
                loadedAllHistory = JSON.parse(storedAllHistory);
            }
            
            if (storedOldHistory && !storedAllHistory) {
                const parsedHistory: IDecision[] = JSON.parse(storedOldHistory);
                const migratedHistory = parsedHistory.map(decision => {
                    let newDecision = { ...decision };
                    if (!newDecision.result?.imageQuery && newDecision.result?.recommendation) {
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
                
                loadedAllHistory['default'] = migratedHistory;
                localStorage.removeItem('decisionHistory');
            }
            
            setLocalHistory(loadedAllHistory);
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, [isAuthenticated]);

    // Cloud history loading effect
    useEffect(() => {
        if (isAuthenticated) {
            loadCloudHistory();
        }
    }, [isAuthenticated, user?.id, currentWorkspace?.id]);

    // Update local history when workspace changes
    useEffect(() => {
        if (isAuthenticated) return; // Skip for authenticated users
        
        if (currentWorkspace) {
            const workspaceHistory = localHistory[currentWorkspace.id] || [];
            setHistory(workspaceHistory);
        } else {
            const defaultHistory = localHistory['default'] || [];
            setHistory(defaultHistory);
        }
    }, [isAuthenticated, currentWorkspace, localHistory]);

    // Save local history
    useEffect(() => {
        if (isAuthenticated) return; // Skip for authenticated users
        
        const timer = setTimeout(() => {
            try {
                localStorage.setItem('workspaceDecisionHistory', JSON.stringify(localHistory));
            } catch (error) {
                console.error("Failed to save history to localStorage", error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [isAuthenticated, localHistory]);

    // Functions for cloud operations
    const addDecisionCloud = async (decision: IDecision) => {
        // Immediate local update
        setHistory(prev => [decision, ...prev]);
        
        try {
            const { error } = await supabase
                .from('decisions')
                .insert({
                    id: decision.id,
                    user_id: user!.id,
                    workspace_id: currentWorkspace?.id || null,
                    dilemma: decision.dilemma,
                    emoji: decision.emoji,
                    category: decision.category,
                    tags: decision.tags || [],
                    thread_id: decision.threadId,
                    decision_data: decision as any,
                    timestamp: decision.timestamp ? new Date(decision.timestamp).toISOString() : null
                });
            
            if (error) throw error;
        } catch (error) {
            console.error('Failed to add decision to cloud:', error);
        }
    };

    const updateDecisionCloud = async (updatedDecision: IDecision) => {
        setHistory(prev => prev.map(d => 
            d.id === updatedDecision.id ? updatedDecision : d
        ));
        
        try {
            const { error } = await supabase
                .from('decisions')
                .update({
                    dilemma: updatedDecision.dilemma,
                    emoji: updatedDecision.emoji,
                    category: updatedDecision.category,
                    tags: updatedDecision.tags || [],
                    thread_id: updatedDecision.threadId,
                    decision_data: updatedDecision as any,
                    timestamp: updatedDecision.timestamp ? new Date(updatedDecision.timestamp).toISOString() : null
                })
                .eq('id', updatedDecision.id)
                .eq('user_id', user!.id);
            
            if (error) throw error;
        } catch (error) {
            console.error('Failed to update decision in cloud:', error);
        }
    };

    const deleteDecisionCloud = async (decisionId: string) => {
        setHistory(prev => prev.filter(d => d.id !== decisionId));
        
        try {
            const { error } = await supabase
                .from('decisions')
                .delete()
                .eq('id', decisionId)
                .eq('user_id', user!.id);
            
            if (error) throw error;
        } catch (error) {
            console.error('Failed to delete decision from cloud:', error);
        }
    };

    const clearHistoryCloud = async () => {
        setHistory([]);
        
        try {
            const workspaceId = currentWorkspace?.id;
            
            let query = supabase
                .from('decisions')
                .delete()
                .eq('user_id', user!.id);
            
            if (workspaceId) {
                query = query.eq('workspace_id', workspaceId);
            }
            
            const { error } = await query;
            if (error) throw error;
        } catch (error) {
            console.error('Failed to clear history in cloud:', error);
        }
    };

    // Functions for local operations
    const addDecisionLocal = async (decision: IDecision) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setLocalHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: [decision, ...workspaceHistory]
            };
        });
    };

    const updateDecisionLocal = async (updatedDecision: IDecision) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setLocalHistory(prevAllHistory => {
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
        setLocalHistory(prevAllHistory => {
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

    const updateDecisionCategoryCloud = async (decisionId: string, categoryId: string | undefined) => {
        setHistory(prev => prev.map(d => 
            d.id === decisionId ? { ...d, category: categoryId } : d
        ));
        
        try {
            const { error } = await supabase
                .from('decisions')
                .update({ category: categoryId })
                .eq('id', decisionId)
                .eq('user_id', user!.id);
            
            if (error) throw error;
        } catch (error) {
            console.error('Failed to update category in cloud:', error);
        }
    };

    const deleteDecisionLocal = async (decisionId: string) => {
        const workspaceId = currentWorkspace?.id || 'default';
        setLocalHistory(prevAllHistory => {
            const workspaceHistory = prevAllHistory[workspaceId] || [];
            return {
                ...prevAllHistory,
                [workspaceId]: workspaceHistory.filter(d => d.id !== decisionId)
            };
        });
    };

    const clearHistoryLocal = async () => {
        const workspaceId = currentWorkspace?.id || 'default';
        setLocalHistory(prevAllHistory => ({
            ...prevAllHistory,
            [workspaceId]: []
        }));
    };

    // Return appropriate interface based on authentication
    return {
        history,
        addDecision: isAuthenticated ? addDecisionCloud : addDecisionLocal,
        updateDecision: isAuthenticated ? updateDecisionCloud : updateDecisionLocal,
        updateDecisionCategory: isAuthenticated ? updateDecisionCategoryCloud : updateDecisionCategoryLocal,
        deleteDecision: isAuthenticated ? deleteDecisionCloud : deleteDecisionLocal,
        clearHistory: isAuthenticated ? clearHistoryCloud : clearHistoryLocal
    };
};