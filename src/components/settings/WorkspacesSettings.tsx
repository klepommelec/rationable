import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Plus, Edit3, Trash2, Crown, Building2, Briefcase } from 'lucide-react';
import { toast } from "sonner";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useI18nUI } from '@/contexts/I18nUIContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const WorkspacesSettings: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, updateWorkspace, deleteWorkspace } = useWorkspaces();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    description: '', 
    color: '', 
    use_context: 'personal' as 'personal' | 'professional'
  });
  const { t } = useI18nUI();

  const handleEditWorkspace = (workspace: any) => {
    setEditingWorkspace(workspace.id);
    setEditForm({
      name: workspace.name,
      description: workspace.description || '',
      color: workspace.color,
      use_context: workspace.use_context || 'personal',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingWorkspace) return;
    
    await updateWorkspace(editingWorkspace, {
      name: editForm.name,
      description: editForm.description || undefined,
      color: editForm.color,
      use_context: editForm.use_context,
    });
    
    setEditingWorkspace(null);
  };

  const handleCancelEdit = () => {
    setEditingWorkspace(null);
    setEditForm({ name: '', description: '', color: '', use_context: 'personal' });
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    
    await deleteWorkspace(workspaceToDelete);
    setWorkspaceToDelete(null);
  };

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('workspaces.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('workspaces.description')}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('workspaces.newWorkspace')}
        </Button>
      </div>

      <div className="grid gap-4">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className={`transition-all ${
            currentWorkspace?.id === workspace.id 
              ? 'ring-2 ring-primary border-primary' 
              : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: workspace.color }}
                  />
                  {editingWorkspace === workspace.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="font-semibold"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{workspace.name}</CardTitle>
                        {workspace.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            {t('workspaces.defaultBadge')}
                          </Badge>
                        )}
                        {currentWorkspace?.id === workspace.id && (
                          <Badge variant="default" className="text-xs">
                            {t('workspaces.currentBadge')}
                          </Badge>
                        )}
                      </div>
                      {workspace.description && (
                        <CardDescription className="mt-1">
                          {workspace.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {workspace.use_context === 'professional' ? t('workspaces.professional') : t('workspaces.personal')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {editingWorkspace === workspace.id ? (
                    <>
                       <Button size="sm" onClick={handleSaveEdit}>
                        {t('workspaces.save')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        {t('workspaces.cancel')}
                      </Button>
                    </>
                  ) : (
                    <>
                      {currentWorkspace?.id !== workspace.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => switchWorkspace(workspace)}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          {t('workspaces.activate')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditWorkspace(workspace)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {!workspace.is_default && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setWorkspaceToDelete(workspace.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {editingWorkspace === workspace.id && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">{t('workspaces.workspaceDescription')}</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder={t('workspaces.descriptionPlaceholder')}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>{t('workspaces.color')}</Label>
                    <div className="flex gap-2 mt-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            editForm.color === color 
                              ? 'border-foreground scale-110' 
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditForm({ ...editForm, color })}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editContext">{t('workspaces.usageContext')}</Label>
                    <Select 
                      value={editForm.use_context} 
                      onValueChange={(value) => setEditForm({ ...editForm, use_context: value as 'personal' | 'professional' })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t('workspaces.personalUsage')}</span>
                            <span className="text-sm text-muted-foreground">
                              {t('workspaces.personalDescription')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="professional">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t('workspaces.professionalUsage')}</span>
                            <span className="text-sm text-muted-foreground">
                              {t('workspaces.professionalDescription')}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateWorkspace={createWorkspace}
      />

      <AlertDialog open={!!workspaceToDelete} onOpenChange={() => setWorkspaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('workspaces.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('workspaces.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('workspaces.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorkspace}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('workspaces.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};