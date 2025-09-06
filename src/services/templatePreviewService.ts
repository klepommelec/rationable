import { IDecision } from '@/types/decision';
import { supabase } from '@/integrations/supabase/client';

// Service pour prévisualiser les templates sans authentification
// Utilise Supabase pour stocker temporairement les données du template

const CLIENT_ID_KEY = 'template_client_id';

// Générer ou récupérer un client ID pour le rate limiting
const getClientId = (): string => {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

// Vérifier le rate limiting (10 previews par 10 minutes par client)
const checkRateLimit = async (clientId: string): Promise<boolean> => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  const { count, error } = await supabase
    .from('template_previews')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .gte('created_at', tenMinutesAgo);
    
  if (error) {
    console.error('Error checking rate limit:', error);
    return true; // En cas d'erreur, autoriser
  }
  
  return (count || 0) < 10;
};

export const shareTemplateForPreview = async (templateData: IDecision): Promise<string | null> => {
  try {
    const clientId = getClientId();
    
    // Vérifier le rate limiting
    const canCreate = await checkRateLimit(clientId);
    if (!canCreate) {
      console.warn('Rate limit exceeded for template previews');
      return null;
    }
    
    // Générer un ID unique pour cette preview
    const previewId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insérer dans Supabase
    const { error } = await supabase
      .from('template_previews')
      .insert({
        preview_id: previewId,
        decision_data: templateData as any,
        client_id: clientId
      });
      
    if (error) {
      console.error('Error creating template preview:', error);
      return null;
    }
    
    return previewId;
  } catch (error) {
    console.error('Error in shareTemplateForPreview:', error);
    return null;
  }
};

export const getTemplatePreview = async (previewId: string): Promise<IDecision | null> => {
  try {
    const { data, error } = await supabase
      .from('template_previews')
      .select('decision_data')
      .eq('preview_id', previewId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching template preview:', error);
      return null;
    }
    
    return (data?.decision_data as unknown as IDecision) || null;
  } catch (error) {
    console.error('Error in getTemplatePreview:', error);
    return null;
  }
};

// Nettoyer les previews expirées (optionnel, géré automatiquement par la DB)
export const cleanupExpiredPreviews = async () => {
  try {
    await supabase.rpc('cleanup_expired_template_previews');
  } catch (error) {
    console.error('Error cleaning up expired previews:', error);
  }
};