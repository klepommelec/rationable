import { useWorkspacesContext } from '@/contexts/WorkspacesContext';

export const useWorkspaces = () => {
  return useWorkspacesContext();
};