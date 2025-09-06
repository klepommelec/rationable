import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
          <Building2 className="mr-2 h-4 w-4" />
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: currentWorkspace?.color || '#3b82f6' }}
            />
            <span className="truncate">
              {currentWorkspace?.name || 'Aucun workspace'}
            </span>
          </div>
        </DropdownMenuSubTrigger>
        
        <DropdownMenuSubContent>
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Workspaces
          </div>
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceClick(workspace)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: workspace.color }}
              />
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