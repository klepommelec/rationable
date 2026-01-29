import { useState, useEffect } from 'react';
import { IDecision } from '@/types/decision';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CloudDecisionHistory {
  history: IDecision[];
  addDecision: (decision: IDecision) => Promise<void>;
  updateDecision: (updatedDecision: IDecision) => Promise<void>;
  updateDecisionCategory: (decisionId: string, categoryId: string | undefined) => Promise<void>;
  deleteDecision: (decisionId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isSyncing: boolean;
  isOffline: boolean;
}

// Offline queue for failed requests
interface OfflineAction {
  type: 'add' | 'update' | 'delete' | 'clear';
  decision?: IDecision;
  decisionId?: string;
  categoryId?: string;
  timestamp: number;
}

export const useCloudDecisionHistory = (): CloudDecisionHistory => {
  const { currentWorkspace } = useWorkspaces();
  const { user } = useAuth();
  const [history, setHistory] = useState<IDecision[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);

  // Migration flag per workspace
  const getMigrationKey = (workspaceId: string) => `cloudHistoryMigrated_${workspaceId}`;

  // Load history from cloud
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
      
      setHistory(decisions);
      console.log(`📦 Loaded ${decisions.length} decisions from cloud`);
      
    } catch (error) {
      console.error('Cloud history load error:', error);
      setIsOffline(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // One-shot migration from localStorage to cloud
  const migrateLocalHistory = async () => {
    if (!user?.id) return;
    
    const workspaceId = currentWorkspace?.id || 'default';
    const migrationKey = getMigrationKey(workspaceId);
    
    if (localStorage.getItem(migrationKey)) {
      return; // Already migrated
    }
    
    try {
      // Load local history
      const localHistoryKey = workspaceId === 'default' ? 'decisionHistory' : 'workspaceDecisionHistory';
      const storedHistory = localStorage.getItem(localHistoryKey);
      
      if (!storedHistory) {
        localStorage.setItem(migrationKey, '1');
        return;
      }
      
      const localHistory: IDecision[] = workspaceId === 'default' 
        ? JSON.parse(storedHistory)
        : (JSON.parse(storedHistory)[workspaceId] || []);
      
      if (localHistory.length === 0) {
        localStorage.setItem(migrationKey, '1');
        return;
      }
      
      console.log(`🔄 Migrating ${localHistory.length} decisions to cloud...`);
      
      // Upload to cloud
      const decisionsToUpload = localHistory.map(decision => ({
        id: decision.id,
        user_id: user.id,
        workspace_id: currentWorkspace?.id || null,
        dilemma: decision.dilemma,
        emoji: decision.emoji,
        category: decision.category,
        tags: decision.tags || [],
        thread_id: decision.threadId,
        decision_data: decision as any,
        timestamp: decision.timestamp ? new Date(decision.timestamp).toISOString() : null
      }));
      
      const { error } = await supabase
        .from('decisions')
        .upsert(decisionsToUpload, { onConflict: 'id' });
      
      if (error) {
        console.error('Migration failed:', error);
        return;
      }
      
      localStorage.setItem(migrationKey, '1');
      console.log('✅ Migration completed successfully');
      
    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  // Cloud operations with offline queue
  const addDecision = async (decision: IDecision, retryCount = 0): Promise<boolean> => {
    // Immediate local update
    setHistory(prev => [decision, ...prev]);
    
    if (!user?.id) {
      console.warn('⚠️ Cannot save decision to cloud: user not authenticated');
      return false;
    }
    
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    try {
      const { error } = await supabase
        .from('decisions')
        .insert({
          id: decision.id,
          user_id: user.id,
          workspace_id: currentWorkspace?.id || null,
          dilemma: decision.dilemma,
          emoji: decision.emoji,
          category: decision.category,
          tags: decision.tags || [],
          thread_id: decision.threadId,
          decision_data: decision as any,
          timestamp: decision.timestamp ? new Date(decision.timestamp).toISOString() : null
        });
      
      if (error) {
        // Retry on network errors or temporary failures
        if (retryCount < maxRetries && (
          error.message?.includes('network') || 
          error.message?.includes('timeout') ||
          error.code === 'PGRST301' || // Connection error
          error.code === 'PGRST302'    // Timeout
        )) {
          console.warn(`⚠️ Retry ${retryCount + 1}/${maxRetries} for decision ${decision.id}:`, error.message);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
          return addDecision(decision, retryCount + 1);
        }
        throw error;
      }
      
      console.log('✅ Decision saved to cloud:', decision.id);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to add decision to cloud (attempt ${retryCount + 1}):`, error);
      
      // Add to offline queue for later retry
      setOfflineQueue(prev => {
        // Avoid duplicates
        const exists = prev.some(item => item.type === 'add' && item.decision.id === decision.id);
        if (exists) return prev;
        
        return [...prev, {
          type: 'add',
          decision,
          timestamp: Date.now()
        }];
      });
      setIsOffline(true);
      return false;
    }
  };

  const updateDecision = async (updatedDecision: IDecision, retryCount = 0): Promise<boolean> => {
    // Immediate local update
    setHistory(prev => prev.map(d => 
      d.id === updatedDecision.id ? updatedDecision : d
    ));
    
    if (!user?.id) {
      console.warn('⚠️ Cannot update decision in cloud: user not authenticated');
      return false;
    }
    
    const maxRetries = 3;
    const retryDelay = 1000;
    
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
        .eq('user_id', user.id);
      
      if (error) {
        // Retry on network errors or temporary failures
        if (retryCount < maxRetries && (
          error.message?.includes('network') || 
          error.message?.includes('timeout') ||
          error.code === 'PGRST301' || // Connection error
          error.code === 'PGRST302'    // Timeout
        )) {
          console.warn(`⚠️ Retry ${retryCount + 1}/${maxRetries} for update decision ${updatedDecision.id}:`, error.message);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
          return updateDecision(updatedDecision, retryCount + 1);
        }
        throw error;
      }
      
      console.log('✅ Decision updated in cloud:', updatedDecision.id);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to update decision in cloud (attempt ${retryCount + 1}):`, error);
      
      // Add to offline queue for later retry
      setOfflineQueue(prev => {
        // Avoid duplicates
        const exists = prev.some(item => item.type === 'update' && item.decision.id === updatedDecision.id);
        if (exists) return prev;
        
        return [...prev, {
          type: 'update',
          decision: updatedDecision,
          timestamp: Date.now()
        }];
      });
      setIsOffline(true);
      return false;
    }
  };

  const updateDecisionCategory = async (decisionId: string, categoryId: string | undefined) => {
    // Immediate local update
    setHistory(prev => prev.map(d => 
      d.id === decisionId ? { ...d, category: categoryId } : d
    ));
    
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ category: categoryId })
        .eq('id', decisionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Failed to update category in cloud:', error);
      setOfflineQueue(prev => [...prev, {
        type: 'update',
        decisionId,
        categoryId,
        timestamp: Date.now()
      }]);
      setIsOffline(true);
    }
  };

  const deleteDecision = async (decisionId: string) => {
    // Immediate local update
    setHistory(prev => prev.filter(d => d.id !== decisionId));
    
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', decisionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Failed to delete decision from cloud:', error);
      setOfflineQueue(prev => [...prev, {
        type: 'delete',
        decisionId,
        timestamp: Date.now()
      }]);
      setIsOffline(true);
    }
  };

  const clearHistory = async () => {
    // Immediate local update
    setHistory([]);
    
    if (!user?.id) return;
    
    try {
      const workspaceId = currentWorkspace?.id;
      
      let query = supabase
        .from('decisions')
        .delete()
        .eq('user_id', user.id);
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { error } = await query;
      if (error) throw error;
      
    } catch (error) {
      console.error('Failed to clear history in cloud:', error);
      setOfflineQueue(prev => [...prev, {
        type: 'clear',
        timestamp: Date.now()
      }]);
      setIsOffline(true);
    }
  };

  // Process offline queue when back online
  const processOfflineQueue = async () => {
    if (!user?.id || offlineQueue.length === 0) return;
    
    console.log(`🔄 Processing ${offlineQueue.length} offline actions...`);
    
    for (const action of offlineQueue) {
      try {
        switch (action.type) {
          case 'add':
            if (action.decision) {
              await addDecision(action.decision);
            }
            break;
          case 'update':
            if (action.decision) {
              await updateDecision(action.decision);
            }
            break;
          case 'delete':
            if (action.decisionId) {
              await deleteDecision(action.decisionId);
            }
            break;
          case 'clear':
            await clearHistory();
            break;
        }
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
    
    setOfflineQueue([]);
    setIsOffline(false);
  };

  // Initial load and migration
  useEffect(() => {
    if (user?.id) {
      migrateLocalHistory().then(() => {
        loadCloudHistory();
      });
    }
  }, [user?.id, currentWorkspace?.id]);

  // Realtime updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('decisions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'decisions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Realtime decision update:', payload.eventType);
          loadCloudHistory(); // Refresh history on changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      processOfflineQueue();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  return {
    history,
    addDecision,
    updateDecision,
    updateDecisionCategory,
    deleteDecision,
    clearHistory,
    isSyncing,
    isOffline
  };
};