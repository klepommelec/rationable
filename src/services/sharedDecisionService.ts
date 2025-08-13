
import { supabase } from '@/integrations/supabase/client';
import { IDecision } from '@/types/decision';

export interface SharedDecision {
  id: string;
  public_id: string;
  title: string;
  decision_data: IDecision;
  created_at: string;
  expires_at: string | null;
  view_count: number;
}

export const shareDecision = async (decision: IDecision): Promise<string> => {
  // Check if user is authenticated - now required for sharing
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Vous devez être connecté pour partager une décision');
  }

  // Check rate limit with user-specific identifier for better security
  const { data: rateLimitOk, error: rateLimitError } = await supabase
    .rpc('check_rate_limit', {
      resource: 'shared_decisions',
      identifier: user.id,
      max_actions: 5, // Reduced limit for better security
      window_minutes: 60
    });

  if (rateLimitError) {
    console.warn('Rate limit check failed:', rateLimitError);
  } else if (!rateLimitOk) {
    throw new Error('Trop de partages créés récemment. Veuillez réessayer plus tard.');
  }

  // Generate a unique public ID
  const { data: publicIdData, error: publicIdError } = await supabase
    .rpc('generate_public_id');
  
  if (publicIdError) {
    throw new Error(`Erreur lors de la génération de l'ID : ${publicIdError.message}`);
  }

  const publicId = publicIdData;
  
  // Create the shared decision record
  const { error } = await supabase
    .from('shared_decisions')
    .insert({
      public_id: publicId,
      title: decision.dilemma,
      decision_data: decision as any // Cast to any for JSON compatibility
    });

  if (error) {
    throw new Error(`Erreur lors du partage : ${error.message}`);
  }

  return publicId;
};

export const getSharedDecision = async (publicId: string): Promise<SharedDecision | null> => {
  const { data, error } = await supabase
    .from('shared_decisions')
    .select('*')
    .eq('public_id', publicId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur lors de la récupération : ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Increment view count
  await supabase
    .from('shared_decisions')
    .update({ view_count: data.view_count + 1 })
    .eq('public_id', publicId);

  // Cast the returned data to our SharedDecision interface
  return {
    id: data.id,
    public_id: data.public_id,
    title: data.title,
    decision_data: data.decision_data as unknown as IDecision,
    created_at: data.created_at,
    expires_at: data.expires_at,
    view_count: data.view_count
  };
};
