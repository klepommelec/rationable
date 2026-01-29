
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

  // Vérifier que la décision existe en cloud avant de la partager
  // Si elle n'existe pas, essayer de la sauvegarder d'abord
  try {
    const { data: existingDecision, error: checkError } = await supabase
      .from('decisions')
      .select('id')
      .eq('id', decision.id)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if decision doesn't exist
      console.warn('Error checking decision existence:', checkError);
    }

    // Si la décision n'existe pas en cloud, la sauvegarder
    if (!existingDecision) {
      console.log('⚠️ Decision not found in cloud, saving it first...', decision.id);
      
      const { error: saveError } = await supabase
        .from('decisions')
        .insert({
          id: decision.id,
          user_id: user.id,
          workspace_id: null, // Will be set by the hook if workspace context is available
          dilemma: decision.dilemma,
          emoji: decision.emoji,
          category: decision.category,
          tags: decision.tags || [],
          thread_id: decision.threadId,
          decision_data: decision as any,
          timestamp: decision.timestamp ? new Date(decision.timestamp).toISOString() : null
        });

      if (saveError) {
        console.error('Failed to save decision before sharing:', saveError);
        // Continue anyway - the decision might be in a different workspace or there might be a race condition
        // The share will still work as shared_decisions stores the full decision_data
      } else {
        console.log('✅ Decision saved to cloud before sharing');
      }
    }
  } catch (err) {
    console.warn('Error checking/saving decision before sharing:', err);
    // Continue anyway - sharing should still work
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
  // Input validation
  if (!publicId || typeof publicId !== 'string' || publicId.trim().length === 0) {
    throw new Error('ID public invalide');
  }

  // Use the secure function to get the shared decision
  const { data, error } = await supabase
    .rpc('get_shared_decision_by_id', { p_public_id: publicId });

  if (error) {
    throw new Error(`Erreur lors de la récupération : ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  const decisionData = data[0];

  // Increment view count using the secure update policy
  await supabase
    .from('shared_decisions')
    .update({ view_count: decisionData.view_count + 1 })
    .eq('public_id', publicId);

  // Cast the returned data to our SharedDecision interface
  return {
    id: decisionData.id,
    public_id: decisionData.public_id,
    title: decisionData.title,
    decision_data: decisionData.decision_data as unknown as IDecision,
    created_at: decisionData.created_at,
    expires_at: decisionData.expires_at,
    view_count: decisionData.view_count + 1 // Reflect the updated count
  };
};
