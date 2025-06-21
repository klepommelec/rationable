
import { supabase } from '@/integrations/supabase/client';

export const callOpenAiApi = async (prompt: string, model: string = 'gpt-4o-mini') => {
  const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
    body: { prompt, model },
  });

  if (error) {
    console.error("Supabase function error:", error);
    const errorMessage = error.context?.data?.error || error.message || "Une erreur inconnue est survenue.";
    throw new Error(`Erreur de l'assistant IA: ${errorMessage}`);
  }

  // The API might be returning strings with double-escaped unicode characters.
  // To fix this, we stringify the received data, replace the double escapes (`\\u`)
  // with single escapes (`\u`), and then parse it back.
  // This corrects the encoding issue on the client-side.
  try {
    const jsonString = JSON.stringify(data);
    const correctedString = jsonString.replace(/\\\\u/g, '\\u');
    return JSON.parse(correctedString);
  } catch (e) {
    console.error("Could not correct AI response encoding, returning as is.", e);
    return data; // Fallback to original data if anything goes wrong.
  }
};
