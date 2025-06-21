
import { supabase } from '@/integrations/supabase/client';
import { IDecision } from '@/types/decision';

export interface CommunityTemplate {
  id: string;
  public_id: string;
  title: string;
  description: string | null;
  author_name: string | null;
  decision_data: IDecision;
  category: string | null;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  copy_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateRequest {
  title: string;
  description?: string;
  author_name?: string;
  decision_data: IDecision;
  category?: string;
  tags?: string[];
}

export const shareAsTemplate = async (request: CreateTemplateRequest): Promise<string> => {
  // Generate a unique public ID
  const { data: publicIdData, error: publicIdError } = await supabase
    .rpc('generate_template_public_id');
  
  if (publicIdError) {
    throw new Error(`Erreur lors de la génération de l'ID : ${publicIdError.message}`);
  }

  const publicId = publicIdData;
  
  // Create the community template record
  const { error } = await supabase
    .from('community_templates')
    .insert({
      public_id: publicId,
      title: request.title,
      description: request.description || null,
      author_name: request.author_name || null,
      decision_data: request.decision_data as any,
      category: request.category || null,
      tags: request.tags || [],
      status: 'pending' // Will be moderated
    });

  if (error) {
    throw new Error(`Erreur lors du partage : ${error.message}`);
  }

  return publicId;
};

export const getCommunityTemplates = async (filters?: {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'most_copied';
  limit?: number;
  offset?: number;
}): Promise<CommunityTemplate[]> => {
  let query = supabase
    .from('community_templates')
    .select('*')
    .eq('status', 'approved');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  switch (filters?.sortBy) {
    case 'popular':
      query = query.order('like_count', { ascending: false });
      break;
    case 'most_copied':
      query = query.order('copy_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erreur lors de la récupération : ${error.message}`);
  }

  // Cast the data with proper type conversion using unknown as intermediate
  return (data || []).map(item => ({
    ...item,
    decision_data: item.decision_data as unknown as IDecision
  })) as CommunityTemplate[];
};

export const getTemplateByPublicId = async (publicId: string): Promise<CommunityTemplate | null> => {
  const { data, error } = await supabase
    .from('community_templates')
    .select('*')
    .eq('public_id', publicId)
    .eq('status', 'approved')
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur lors de la récupération : ${error.message}`);
  }

  if (!data) return null;

  // Cast the data with proper type conversion using unknown as intermediate
  return {
    ...data,
    decision_data: data.decision_data as unknown as IDecision
  } as CommunityTemplate;
};

export const copyTemplate = async (templateId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('increment_template_copy_count', { template_id: templateId });

  if (error) {
    throw new Error(`Erreur lors de la copie : ${error.message}`);
  }
};

export const likeTemplate = async (templateId: string): Promise<void> => {
  const { error } = await supabase
    .rpc('increment_template_like_count', { template_id: templateId });

  if (error) {
    throw new Error(`Erreur lors du like : ${error.message}`);
  }
};
