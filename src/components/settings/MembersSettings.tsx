import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WorkspaceMembersManager } from '@/components/workspace/WorkspaceMembersManager';
import { useI18nUI } from '@/contexts/I18nUIContext';

export const MembersSettings: React.FC = () => {
  const { t } = useI18nUI();
  const { currentWorkspace } = useWorkspaces();

  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t('settings.members.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.members.subtitle')}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('settings.members.noWorkspaceSelected')}
              </h3>
              <p className="text-muted-foreground">
                {t('settings.members.selectWorkspaceMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('settings.members.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.members.subtitle')} "{currentWorkspace.name}"
          </p>
        </div>
      </div>

      <WorkspaceMembersManager 
        workspaceId={currentWorkspace.id}
        workspaceName={currentWorkspace.name}
      />
    </div>
  );
};

export default MembersSettings;