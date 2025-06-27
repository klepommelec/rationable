
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, X, Camera } from 'lucide-react';
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onAvatarChange: (file: File) => Promise<void>;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  onAvatarChange,
  disabled
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validation de la taille (2MB max pour les avatars)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 2MB)');
      return;
    }

    setIsUploading(true);
    
    try {
      // Créer un aperçu local
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Uploader le fichier
      await onAvatarChange(file);
      
      toast.success('Avatar mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      toast.error('Erreur lors de la mise à jour de l\'avatar');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarChange, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: disabled || isUploading,
    multiple: false,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {displayUrl && <AvatarImage src={displayUrl} alt="Avatar" />}
          <AvatarFallback className="text-lg font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearPreview}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div {...getRootProps()} className={`
        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
        ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {isDragActive ? (
            <Upload className="h-6 w-6 text-primary" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary">Déposez l'image ici...</p>
            ) : (
              <div>
                <p className="font-medium">Changer l'avatar</p>
                <p className="text-muted-foreground text-xs">PNG, JPG, WebP (max 2MB)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
