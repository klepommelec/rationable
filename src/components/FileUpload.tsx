
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import { toast } from "sonner";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'pdf' | 'image' | 'other';
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, disabled }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;
    
    setIsUploading(true);
    
    try {
      const newFiles: UploadedFile[] = [];
      
      for (const file of acceptedFiles) {
        // Validation de la taille (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
          continue;
        }
        
        let fileType: 'pdf' | 'image' | 'other' = 'other';
        let preview: string | undefined;
        
        if (file.type.startsWith('image/')) {
          fileType = 'image';
          preview = URL.createObjectURL(file);
        } else if (file.type === 'application/pdf') {
          fileType = 'pdf';
        }
        
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          preview,
          type: fileType
        });
      }
      
      onFilesChange([...files, ...newFiles]);
      
      if (newFiles.length > 0) {
        toast.success(`${newFiles.length} fichier(s) ajouté(s)`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'ajout des fichiers');
    } finally {
      setIsUploading(false);
    }
  }, [files, onFilesChange, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: disabled || isUploading,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
    
    // Nettoyer les URLs de preview
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 ${isUploading ? 'animate-pulse' : ''} text-muted-foreground mb-4`} />
            {isUploading ? (
              <p className="text-sm text-muted-foreground">Traitement en cours...</p>
            ) : isDragActive ? (
              <p className="text-sm text-primary">Déposez les fichiers ici...</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez vos documents ici, ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Images, Word (max 10MB par fichier)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers uploadés */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers joints ({files.length})</h4>
          {files.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="p-3">
              <div className="flex items-center gap-3">
                {getFileIcon(uploadedFile.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                </div>
                {uploadedFile.preview && (
                  <img 
                    src={uploadedFile.preview} 
                    alt="Preview" 
                    className="h-10 w-10 object-cover rounded"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Les documents seront analysés avec votre dilemme pour vous aider dans votre décision</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
