
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
    decision_data: data.decision_data as IDecision,
    created_at: data.created_at,
    expires_at: data.expires_at,
    view_count: data.view_count
  };
};
