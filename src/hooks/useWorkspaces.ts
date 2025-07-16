import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, WorkspaceWithMembers } from '@/types/workspace';
import { toast } from '@/hooks/use-toast';

const CURRENT_WORKSPACE_KEY = 'currentWorkspaceId';
const DEFAULT_WORKSPACE_COLOR = '#3b82f6';

export const useWorkspaces = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMembers[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceWithMembers | null>(null);
  const [loading, setLoading] = useState(true);

  // Load workspaces from Supabase
  const loadWorkspaces = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setWorkspaces(data);
        
        // Set current workspace from localStorage or default to first one
        const savedWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_KEY);
        const targetWorkspace = savedWorkspaceId 
          ? data.find(w => w.id === savedWorkspaceId)
          : data.find(w => w.is_default) || data[0];
        
        if (targetWorkspace) {
          setCurrentWorkspace(targetWorkspace);
        }
      } else {
        // Create default workspace if none exists
        await createDefaultWorkspace();
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create default workspace
  const createDefaultWorkspace = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: 'Personnel',
          description: 'Votre workspace personnel par défaut',
          color: DEFAULT_WORKSPACE_COLOR,
          user_id: user.id,
          is_default: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWorkspaces([data]);
        setCurrentWorkspace(data);
      }
    } catch (error) {
      console.error('Error creating default workspace:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le workspace par défaut",
        variant: "destructive",
      });
    }
  };

  // Switch to a different workspace
  const switchWorkspace = (workspace: WorkspaceWithMembers) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspace.id);
    
    toast({
      title: "Workspace changé",
      description: `Vous êtes maintenant dans "${workspace.name}"`,
    });
  };

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string, color: string = DEFAULT_WORKSPACE_COLOR) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          color,
          user_id: user.id,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newWorkspaces = [...workspaces, data];
        setWorkspaces(newWorkspaces);
        switchWorkspace(data);
        
        toast({
          title: "Workspace créé",
          description: `"${name}" a été créé avec succès`,
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le workspace",
        variant: "destructive",
      });
    }
    return null;
  };

  // Update workspace
  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedWorkspaces = workspaces.map(w => w.id === id ? data : w);
        setWorkspaces(updatedWorkspaces);
        
        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(data);
        }
        
        toast({
          title: "Workspace mis à jour",
          description: "Les modifications ont été sauvegardées",
        });
        
        return data;
      }
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le workspace",
        variant: "destructive",
      });
    }
    return null;
  };

  // Delete workspace
  const deleteWorkspace = async (id: string) => {
    if (!user) return false;
    
    const workspace = workspaces.find(w => w.id === id);
    if (!workspace) return false;
    
    // Don't allow deleting the default workspace if it's the only one
    if (workspace.is_default && workspaces.length === 1) {
      toast({
        title: "Impossible de supprimer",
        description: "Vous ne pouvez pas supprimer votre dernier workspace",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const remainingWorkspaces = workspaces.filter(w => w.id !== id);
      setWorkspaces(remainingWorkspaces);
      
      // If we deleted the current workspace, switch to another one
      if (currentWorkspace?.id === id) {
        const newCurrent = remainingWorkspaces.find(w => w.is_default) || remainingWorkspaces[0];
        if (newCurrent) {
          switchWorkspace(newCurrent);
        }
      }
      
      toast({
        title: "Workspace supprimé",
        description: `"${workspace.name}" a été supprimé`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le workspace",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load workspaces on mount and when user changes
  useEffect(() => {
    loadWorkspaces();
  }, [user]);

  return {
    workspaces,
    currentWorkspace,
    loading,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    refreshWorkspaces: loadWorkspaces,
  };
};