import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18nUI } from '@/contexts/I18nUIContext';
import WorkspaceImageUpload from '@/components/WorkspaceImageUpload';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (name: string, description?: string, image?: File) => Promise<any>;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  open,
  onOpenChange,
  onCreateWorkspace,
}) => {
  const { t } = useI18nUI();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleImageChange = async (file: File) => {
    setSelectedImage(file);
  };

  const handleImageDelete = async () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await onCreateWorkspace(name.trim(), description.trim() || undefined, selectedImage || undefined);
      setName('');
      setDescription('');
      setSelectedImage(null);
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('workspaces.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('workspaces.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('workspaces.createDialog.nameLabel')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('workspaces.createDialog.namePlaceholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('workspaces.createDialog.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('workspaces.createDialog.descriptionPlaceholder')}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('workspaces.image.changeImage')}</Label>
            <WorkspaceImageUpload
              currentImageUrl={null}
              workspaceName={name || 'Nouveau workspace'}
              onImageChange={handleImageChange}
              onImageDelete={handleImageDelete}
              disabled={isCreating}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              {t('workspaces.createDialog.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {isCreating ? t('workspaces.createDialog.creating') : t('workspaces.createDialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};