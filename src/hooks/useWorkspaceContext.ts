
import { useState, useEffect } from 'react';
import { useWorkspaces } from './useWorkspaces';

export const useWorkspaceContext = () => {
  const { workspaces, currentWorkspace } = useWorkspaces();
  const [isWorkspaceEnabled, setIsWorkspaceEnabled] = useState(true);

  // Déterminer si on doit utiliser les documents du workspace
  const shouldUseWorkspaceDocuments = () => {
    return isWorkspaceEnabled && currentWorkspace && currentWorkspace.id;
  };

  const getCurrentWorkspaceId = () => {
    return currentWorkspace?.id || null;
  };

  return {
    currentWorkspace,
    workspaces,
    isWorkspaceEnabled,
    setIsWorkspaceEnabled,
    shouldUseWorkspaceDocuments,
    getCurrentWorkspaceId
  };
};
