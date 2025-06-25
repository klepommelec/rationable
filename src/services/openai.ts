
import { supabase } from '@/integrations/supabase/client';
import { UploadedFileInfo } from './fileUploadService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callOpenAiApi = async (prompt: string, files?: UploadedFileInfo[], retryCount = 0): Promise<any> => {
  try {
    console.log(`🔄 Tentative ${retryCount + 1}/${MAX_RETRIES} d'appel à l'API OpenAI`);
    
    const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
      body: { prompt, files },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`Erreur de l'assistant IA: ${error.message || "Une erreur inconnue est survenue."}`);
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
      return data;
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la tentative ${retryCount + 1}:`, error);
    
    // Si c'est une erreur de réseau et qu'on peut encore retry
    if (retryCount < MAX_RETRIES - 1 && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('Failed to send a request to the Edge Function') ||
      error.message.includes('Network')
    )) {
      console.log(`⏳ Retry dans ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return callOpenAiApi(prompt, files, retryCount + 1);
    }
    
    // Si on a épuisé les tentatives ou si c'est une autre erreur
    throw error;
  }
};
