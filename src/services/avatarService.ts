
import { supabase } from '@/integrations/supabase/client';

export interface AvatarUploadResult {
  avatarUrl: string;
  filePath: string;
}

export const uploadUserAvatar = async (file: File, userId: string): Promise<AvatarUploadResult> => {
  console.log('📤 Uploading avatar for user:', userId);
  
  // Nettoyer le nom de fichier et créer un nom unique
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/avatar-${Date.now()}.${fileExtension}`;
  const filePath = fileName;
  
  try {
    // Supprimer l'ancien avatar s'il existe
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
      await supabase.storage
        .from('avatars')
        .remove(filesToDelete);
      console.log('🗑️ Removed old avatars:', filesToDelete);
    }

    // Upload du nouveau fichier
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Error uploading avatar:', error);
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    console.log('✅ Avatar uploaded successfully:', publicUrl);

    return {
      avatarUrl: publicUrl,
      filePath: data.path
    };

  } catch (error) {
    console.error('❌ Failed to upload avatar:', error);
    throw error;
  }
};

export const deleteUserAvatar = async (filePath: string): Promise<void> => {
  console.log('🗑️ Deleting avatar:', filePath);
  
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath]);
  
  if (error) {
    console.error('❌ Error deleting avatar:', error);
    throw error;
  }
  
  console.log('✅ Avatar deleted successfully');
};
