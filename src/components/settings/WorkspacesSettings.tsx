import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Settings, Users, Trash2, Crown, Edit } from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import WorkspaceImageUpload from '@/components/WorkspaceImageUpload';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
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

export const WorkspacesSettings: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, refreshWorkspaces } = useWorkspaces();
  const { user } = useAuth();
  const { t } = useI18nUI();
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialiser les valeurs d'édition avec le workspace actuel
  useEffect(() => {
    if (currentWorkspace) {
      setEditName(currentWorkspace.name);
      setEditDescription(currentWorkspace.description || '');
    }
  }, [currentWorkspace]);

  const saveWorkspace = useCallback(async (name: string, description: string) => {
    if (!currentWorkspace) return;
    
    // Vérifier s'il y a des changements
    const hasChanges = name !== currentWorkspace.name || 
                      (description.trim() || null) !== (currentWorkspace.description || null);
    
    if (!hasChanges) return; // Pas de changement

    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({
          name: name,
          description: description.trim() || null
        })
        .eq('id', currentWorkspace.id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      await refreshWorkspaces();
      setHasUnsavedChanges(false);
      // Toast discret pour la sauvegarde automatique
      toast.success(t('workspaces.information.savedSuccess'));
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error(t('workspaces.information.savedError'));
    } finally {
      setIsUpdating(false);
    }
  }, [currentWorkspace, user?.id, refreshWorkspaces, toast, t]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (!currentWorkspace) return;
    
    const hasChanges = editName !== currentWorkspace.name || 
                      (editDescription.trim() || null) !== (currentWorkspace.description || null);
    
    setHasUnsavedChanges(hasChanges);
    
    if (!hasChanges) return;
    
    const timeoutId = setTimeout(() => {
      saveWorkspace(editName, editDescription);
    }, 1000); // Debounce de 1 seconde
    
    return () => clearTimeout(timeoutId);
  }, [editName, editDescription, currentWorkspace, saveWorkspace]);

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceToDelete)
        .eq('user_id', user?.id); // Seul le propriétaire peut supprimer

      if (error) throw error;

      toast.success(t('workspaces.deleteSuccess'));
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast.error(t('workspaces.deleteError'));
    } finally {
      setDeleting(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleSwitchWorkspace = (workspace: any) => {
    if (workspace.id !== currentWorkspace?.id) {
      switchWorkspace(workspace);
      toast.success(t('workspaces.selectSuccess', { name: workspace.name }));
    }
  };


  const handleImageChange = async (file: File) => {
    if (!currentWorkspace) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `workspace-${currentWorkspace.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      let bucketName = 'workspace-images';
      let uploadError;

      // Essayer d'abord le bucket workspace-images
      const { error: workspaceImagesError } = await supabase.storage
        .from('workspace-images')
        .upload(filePath, file);

      if (workspaceImagesError) {
        console.log('workspace-images bucket not available, using avatars bucket');
        bucketName = 'avatars';
        const { error: avatarsError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);
        uploadError = avatarsError;
      } else {
        uploadError = workspaceImagesError;
      }

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      // Mettre à jour l'URL de l'image
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const { error: imageError } = await supabase
        .from('workspaces')
        .update({ image_url: publicUrl })
        .eq('id', currentWorkspace.id)
        .eq('user_id', user?.id);

      if (imageError) {
        console.error('Database update error:', imageError);
        throw new Error(`Erreur de mise à jour: ${imageError.message}`);
      }

      await refreshWorkspaces();
    } catch (error) {
      console.error('Error updating workspace image:', error);
      throw error;
    }
  };

  const handleImageDelete = async () => {
    if (!currentWorkspace) return;

    try {
      const { error: imageError } = await supabase
        .from('workspaces')
        .update({ image_url: null })
        .eq('id', currentWorkspace.id)
        .eq('user_id', user?.id);

      if (imageError) throw imageError;

      await refreshWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace image:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">

      {/* Section Workspace actuel */}
      {currentWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>{t('workspaces.image.title')}</CardTitle>
            <CardDescription>
              {t('workspaces.image.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section Image */}
            <div className="space-y-4">
              <WorkspaceImageUpload
                currentImageUrl={currentWorkspace.image_url}
                workspaceName={currentWorkspace.name}
                onImageChange={handleImageChange}
                onImageDelete={handleImageDelete}
                disabled={isUpdating}
              />
            </div>

          </CardContent>
        </Card>
      )}

      {/* Section Workspace Information */}
      {currentWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle>{t('workspaces.information.title')}</CardTitle>
            <CardDescription>
              {t('workspaces.information.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section Informations */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">{t('workspaces.information.nameLabel')}</Label>
                <Input
                  id="workspace-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('workspaces.information.namePlaceholder')}
                  disabled={isUpdating}
                />
                {hasUnsavedChanges && (
                  <p className="text-xs text-muted-foreground">
                    {t('workspaces.information.saving')}...
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workspace-description">{t('workspaces.information.descriptionLabel')}</Label>
                <Textarea
                  id="workspace-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={t('workspaces.information.descriptionPlaceholder')}
                  disabled={isUpdating}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Tous les workspaces */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('workspaces.yourWorkspaces')} ({workspaces.length})
          </CardTitle>
          <CardDescription>
            Gérez tous vos workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('workspaces.noWorkspaces')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('workspaces.createFirstWorkspace')}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('workspaces.createWorkspace')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <div 
                  key={workspace.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    currentWorkspace?.id === workspace.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {workspace.image_url ? (
                        <img 
                          src={workspace.image_url} 
                          alt={workspace.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{workspace.name}</h4>
                        {workspace.user_id === user?.id && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            {t('workspaces.owner')}
                          </Badge>
                        )}
                        {currentWorkspace?.id === workspace.id && (
                          <Badge variant="default" className="text-xs">
                            {t('workspaces.current')}
                          </Badge>
                        )}
                      </div>
                      {workspace.description && (
                        <p className="text-sm text-muted-foreground">
                          {workspace.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('workspaces.createdOn')} {new Date(workspace.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {currentWorkspace?.id !== workspace.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchWorkspace(workspace)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t('workspaces.select')}
                      </Button>
                    )}
                    
                    {workspace.user_id === user?.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkspace(workspace)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWorkspaceToDelete(workspace.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      <AlertDialog open={!!workspaceToDelete} onOpenChange={() => setWorkspaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce workspace ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le workspace et toutes ses données. 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorkspace}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t('workspaces.deleting') : t('workspaces.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkspacesSettings;