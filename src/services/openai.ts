
import { supabase } from '@/integrations/supabase/client';
import { UploadedFileInfo } from './fileUploadService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callOpenAiApi = async (prompt: string, files?: UploadedFileInfo[], retryCount = 0): Promise<any> => {
  try {
    console.log(`🔄 Tentative ${retryCount + 1}/${MAX_RETRIES} d'appel à l'API OpenAI`);
    console.log(`📍 Supabase URL: ${supabase.supabaseUrl}`);
    console.log(`🔧 Function name: openai-decision-maker`);
    
    const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
      body: { prompt, files },
    });

    if (error) {
      console.error("❌ Supabase function error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Fournir des messages d'erreur plus spécifiques
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        throw new Error(`La fonction Edge 'openai-decision-maker' n'est pas déployée. Vérifiez le déploiement de vos Edge Functions.`);
      } else if (error.message?.includes('timeout')) {
        throw new Error(`Timeout de la fonction Edge. La fonction met trop de temps à répondre.`);
      } else if (error.message?.includes('Failed to send a request')) {
        throw new Error(`Impossible de contacter les Edge Functions. Vérifiez votre configuration Supabase et votre connexion internet.`);
      }
      
      throw new Error(`Erreur de l'assistant IA: ${error.message || "Une erreur inconnue est survenue."}`);
    }

    console.log("✅ Réponse reçue de l'Edge Function");

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
      error.message.includes('Network') ||
      error.message.includes('timeout')
    )) {
      console.log(`⏳ Retry dans ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return callOpenAiApi(prompt, files, retryCount + 1);
    }
    
    // Si on a épuisé les tentatives ou si c'est une autre erreur
    throw error;
  }
};

// Fonction utilitaire pour tester la connectivité
export const testEdgeFunctionConnectivity = async (): Promise<boolean> => {
  try {
    console.log("🔍 Test de connectivité Edge Function...");
    const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
      body: { prompt: "test", files: [] },
    });
    
    if (error) {
      console.error("❌ Test de connectivité échoué:", error);
      return false;
    }
    
    console.log("✅ Test de connectivité réussi");
    return true;
  } catch (error) {
    console.error("❌ Test de connectivité échoué:", error);
    return false;
  }
};
