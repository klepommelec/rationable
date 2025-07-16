export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export interface WorkspaceWithMembers extends Workspace {
  members?: WorkspaceMember[];
  member_count?: number;
}