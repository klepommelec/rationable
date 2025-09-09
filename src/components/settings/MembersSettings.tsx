import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceMembersManager } from "@/components/workspace/WorkspaceMembersManager";
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { Building2 } from 'lucide-react';

export const MembersSettings: React.FC = () => {
  const { currentWorkspace, workspaces } = useWorkspaces();
  const { t } = useI18nUI();

  if (!currentWorkspace) {
    return (  
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Aucun workspace sélectionné
          </h3>
          <p className="text-muted-foreground mb-4">
            Veuillez sélectionner un workspace pour gérer ses membres
          </p>
          <WorkspaceSelector />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des membres</h3>
          <p className="text-sm text-muted-foreground">
            Invitez et gérez les membres du workspace "{currentWorkspace.name}"
          </p>
        </div>
        <WorkspaceSelector />
      </div>

      <WorkspaceMembersManager 
        workspaceId={currentWorkspace.id}
        workspaceName={currentWorkspace.name}
      />
    </div>
  );
};