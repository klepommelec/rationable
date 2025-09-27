import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceMemberProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'owner' | 'contributor' | 'viewer';
}

export const workspaceMembersService = {
  /**
   * Récupère tous les membres d'un workspace avec leurs profils
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberProfile[]> {
    try {
      // Récupérer le workspace pour obtenir le propriétaire
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('user_id')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      // Récupérer tous les membres du workspace
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role
        `)
        .eq('workspace_id', workspaceId);

      if (membersError) throw membersError;

      // Collecter tous les IDs d'utilisateurs (propriétaire + membres)
      const userIds = new Set<string>();
      userIds.add(workspace.user_id); // Propriétaire
      
      if (membersData) {
        membersData.forEach(member => userIds.add(member.user_id));
      }

      // Récupérer les profils de tous les utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Construire la liste des membres avec leurs profils
      const members: WorkspaceMemberProfile[] = [];

      // Ajouter le propriétaire
      const ownerProfile = profiles?.find(p => p.id === workspace.user_id);
      if (ownerProfile) {
        members.push({
          ...ownerProfile,
          role: 'owner'
        });
      }

      // Ajouter les autres membres
      if (membersData && profiles) {
        membersData.forEach(member => {
          const profile = profiles.find(p => p.id === member.user_id);
          if (profile) {
            members.push({
              ...profile,
              role: member.role as 'owner' | 'contributor' | 'viewer'
            });
          }
        });
      }

      return members;
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  },

  /**
   * Recherche des membres par nom pour les mentions
   */
  async searchMembers(workspaceId: string, query: string): Promise<WorkspaceMemberProfile[]> {
    const allMembers = await this.getWorkspaceMembers(workspaceId);
    
    if (!query.trim()) return allMembers;

    const searchQuery = query.toLowerCase();
    return allMembers.filter(member => 
      member.full_name?.toLowerCase().includes(searchQuery) ||
      member.email?.toLowerCase().includes(searchQuery)
    );
  }
};
