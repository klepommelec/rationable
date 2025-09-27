import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, X, Camera, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';

interface WorkspaceImageUploadProps {
  currentImageUrl?: string | null;
  workspaceName?: string;
  onImageChange: (file: File) => Promise<void>;
  onImageDelete?: () => Promise<void>;
  disabled?: boolean;
}

const WorkspaceImageUpload: React.FC<WorkspaceImageUploadProps> = ({
  currentImageUrl,
  workspaceName,
  onImageChange,
  onImageDelete,
  disabled
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useI18nUI();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validation de la taille (5MB max pour les images de workspace)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('workspaces.image.tooBig'));
      return;
    }

    setIsUploading(true);
    
    try {
      // Créer un aperçu local
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Uploader le fichier
      await onImageChange(file);
      
      toast.success(t('workspaces.image.uploadSuccess'));
    } catch (error) {
      console.error('Error uploading workspace image:', error);
      toast.error(t('workspaces.image.uploadError'));
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [disabled, onImageChange, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: disabled || isUploading
  });

  const handleDelete = async () => {
    if (disabled || isUploading) return;
    
    try {
      await onImageDelete?.();
      setPreviewUrl(null);
      toast.success(t('workspaces.image.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting workspace image:', error);
      toast.error(t('workspaces.image.deleteError'));
    }
  };

  const displayImage = previewUrl || currentImageUrl;
  const displayName = workspaceName || 'Workspace';

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Image actuelle */}
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayImage || undefined} alt={displayName} />
          <AvatarFallback className="text-lg">
            <Building2 className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        {/* Bouton de suppression */}
        {displayImage && onImageDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleDelete}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Camera className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-medium">
            {isUploading ? t('workspaces.image.uploading') : t('workspaces.image.changeImage')}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('workspaces.image.supportedFormats')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceImageUpload;

