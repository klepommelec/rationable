import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Plus, Building2, Check } from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { useI18nUI } from '@/contexts/I18nUIContext';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspaces();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { t } = useI18nUI();

  const handleWorkspaceClick = (workspace: any) => {
    if (workspace.id !== currentWorkspace?.id) {
      switchWorkspace(workspace);
    }
  };

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={currentWorkspace?.image_url || undefined} alt={currentWorkspace?.name || 'Workspace'} />
              <AvatarFallback className="text-xs">
                {currentWorkspace?.name?.charAt(0).toUpperCase() || 'W'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {currentWorkspace?.name || 'Aucun workspace'}
            </span>
          </div>
        </DropdownMenuSubTrigger>
        
        <DropdownMenuSubContent>
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {t('workspaces.title')}
          </div>
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceClick(workspace)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={workspace.image_url || undefined} alt={workspace.name} />
                <AvatarFallback className="text-xs">
                  {workspace.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate flex-1">{workspace.name}</span>
              {currentWorkspace?.id === workspace.id && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="h-4 w-4" />
            <span>{t('workspaces.newWorkspace')}</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateWorkspace={createWorkspace}
      />
    </>
  );
};