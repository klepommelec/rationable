
import { supabase } from '@/integrations/supabase/client';
import { UploadedFile } from '@/components/FileUpload';

export interface UploadedFileInfo {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
}

// Fonction pour nettoyer et sanitiser les noms de fichiers
const sanitizeFileName = (fileName: string): string => {
  // Séparer le nom et l'extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  
  // Normaliser les caractères Unicode pour gérer les accents
  const normalizedName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remplacer les espaces par des underscores et supprimer les caractères spéciaux
  const cleanName = normalizedName
    .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    .replace(/[^a-zA-Z0-9_-]/g, '') // Garder seulement alphanumériques, underscores et tirets
    .replace(/_+/g, '_') // Éviter les underscores multiples
    .replace(/^_|_$/g, ''); // Supprimer les underscores en début/fin
  
  // S'assurer qu'on a un nom valide
  const finalName = cleanName || 'file';
  
  return finalName + extension;
};

export const uploadFilesToStorage = async (files: UploadedFile[]): Promise<UploadedFileInfo[]> => {
  console.log('📤 Uploading files to Supabase Storage...', files.length);
  
  const uploadedFiles: UploadedFileInfo[] = [];
  
  for (const file of files) {
    try {
      // Nettoyer le nom de fichier
      const sanitizedFileName = sanitizeFileName(file.file.name);
      
      // Créer un nom de fichier unique avec timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `decision-documents/${fileName}`;
      
      console.log(`📤 Uploading file: ${file.file.name} -> ${fileName}`);
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('decision-files')
        .upload(filePath, file.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
        throw new Error(`Erreur lors de l'upload de ${file.file.name}: ${error.message}`);
      }
      
      console.log(`✅ File uploaded successfully: ${fileName}`);
      
      uploadedFiles.push({
        id: file.id,
        fileName: file.file.name, // Garder le nom original pour l'affichage
        filePath: data.path,
        fileType: file.file.type,
        fileSize: file.file.size
      });
      
    } catch (error) {
      console.error(`❌ Failed to upload file ${file.file.name}:`, error);
      throw new Error(`Erreur lors de l'upload de ${file.file.name}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  return uploadedFiles;
};

export const deleteFileFromStorage = async (filePath: string): Promise<void> => {
  console.log(`🗑️ Deleting file from storage: ${filePath}`);
  
  const { error } = await supabase.storage
    .from('decision-files')
    .remove([filePath]);
  
  if (error) {
    console.error(`❌ Error deleting file ${filePath}:`, error);
    throw error;
  }
  
  console.log(`✅ File deleted successfully: ${filePath}`);
};
