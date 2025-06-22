
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

export const uploadFilesToStorage = async (files: UploadedFile[]): Promise<UploadedFileInfo[]> => {
  console.log('📤 Uploading files to Supabase Storage...', files.length);
  
  const uploadedFiles: UploadedFileInfo[] = [];
  
  for (const file of files) {
    try {
      // Créer un nom de fichier unique avec timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.file.name}`;
      const filePath = `decision-documents/${fileName}`;
      
      console.log(`📤 Uploading file: ${fileName}`);
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('decision-files')
        .upload(filePath, file.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
        throw error;
      }
      
      console.log(`✅ File uploaded successfully: ${fileName}`);
      
      uploadedFiles.push({
        id: file.id,
        fileName: file.file.name,
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
