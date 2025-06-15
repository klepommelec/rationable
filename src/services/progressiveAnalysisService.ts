
import { callOpenAiApi } from '@/services/openai';
import { ICriterion, IResult } from '@/types/decision';
import { IProgressiveState, ICriteriaGenerationStep, IOptionAnalysisStep } from '@/types/progressive';

export class ProgressiveAnalysisService {
  private onStateUpdate: (state: IProgressiveState) => void;
  private currentState: IProgressiveState;

  constructor(onStateUpdate: (state: IProgressiveState) => void) {
    this.onStateUpdate = onStateUpdate;
    this.currentState = {
      phase: 'idle',
      progress: 0,
      message: '',
      criteriaGenerated: [],
      optionsAnalyzed: 0,
      totalOptions: 0
    };
  }

  private updateState(updates: Partial<IProgressiveState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateUpdate(this.currentState);
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateEmoji(dilemma: string): Promise<string> {
    this.updateState({
      phase: 'generating-emoji',
      progress: 5,
      message: '🧠 Analyse de votre dilemme...'
    });

    await this.delay(1500);

    const prompt = `Pour le dilemme : "${dilemma}", choisissez un emoji pertinent et retournez UNIQUEMENT l'emoji (un seul caractère unicode). Exemples : 🤔, 💻, ✈️, 🏠, 🎉, 💡, 💸, ❤️, 🍔, 📚, 🏆`;
    
    try {
      const response = await callOpenAiApi(prompt);
      const emoji = typeof response === 'string' ? response.trim() : '🤔';
      
      this.updateState({
        emoji,
        progress: 15,
        message: '✨ Emoji sélectionné !'
      });

      await this.delay(800);
      return emoji;
    } catch (error) {
      console.error('Error generating emoji:', error);
      return '🤔';
    }
  }

  async generateCriteriaProgressively(dilemma: string): Promise<string[]> {
    this.updateState({
      phase: 'generating-criteria',
      progress: 20,
      message: '📊 Identification des critères importants...'
    });

    const prompt = `Pour le dilemme : "${dilemma}", identifiez exactement 4 critères de décision importants. Retournez un objet JSON avec cette structure : {"criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]}`;
    
    try {
      const response = await callOpenAiApi(prompt);
      const criteriaData = typeof response === 'string' ? JSON.parse(response) : response;
      const allCriteria = criteriaData.criteria || [];

      // Simule la génération progressive des critères
      const criteriaGenerated: string[] = [];
      
      for (let i = 0; i < allCriteria.length; i++) {
        await this.delay(1200);
        criteriaGenerated.push(allCriteria[i]);
        
        this.updateState({
          criteriaGenerated: [...criteriaGenerated],
          progress: 20 + (i + 1) * 15,
          message: `💡 Critère ${i + 1}/4 identifié : ${allCriteria[i]}`
        });
      }

      await this.delay(600);
      this.updateState({
        progress: 80,
        message: '✅ Tous les critères identifiés !'
      });

      return allCriteria;
    } catch (error) {
      console.error('Error generating criteria:', error);
      return ['Coût', 'Qualité', 'Facilité d\'utilisation', 'Support'];
    }
  }

  async analyzeOptionsProgressively(dilemma: string, criteria: string[]): Promise<IResult> {
    this.updateState({
      phase: 'analyzing-options',
      progress: 85,
      message: '⚖️ Évaluation des options disponibles...',
      totalOptions: 3
    });

    const criteriaNames = criteria.join(', ');
    const prompt = `Pour le dilemma "${dilemma}", en utilisant les critères : ${criteriaNames}, générez 3 options avec une analyse complète. 
    Retournez un objet JSON avec cette structure exacte :
    {
      "recommendation": "Option Recommandée",
      "imageQuery": "English search query for background image, 2-3 keywords",
      "description": "Description engageante de 2-3 phrases expliquant pourquoi c'est la meilleure option",
      "infoLinks": [{"title": "Titre", "url": "https://example.com"}],
      "shoppingLinks": [{"title": "Titre achat", "url": "https://example.com"}],
      "breakdown": [
        {
          "option": "Option 1",
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1"],
          "score": 85
        }
      ]
    }`;

    try {
      const response = await callOpenAiApi(prompt);
      const result: IResult = typeof response === 'string' ? JSON.parse(response) : response;

      // Simule l'analyse progressive des options
      for (let i = 0; i < result.breakdown.length; i++) {
        await this.delay(1500);
        this.updateState({
          optionsAnalyzed: i + 1,
          progress: 85 + (i + 1) * 4,
          message: `🔍 Analyse de l'option ${i + 1}/3 : ${result.breakdown[i].option}`
        });
      }

      this.updateState({
        phase: 'finalizing',
        progress: 97,
        message: '🎯 Finalisation de la recommandation...'
      });

      await this.delay(1000);

      this.updateState({
        phase: 'done',
        progress: 100,
        message: '✨ Analyse complète !'
      });

      return result;
    } catch (error) {
      console.error('Error analyzing options:', error);
      throw error;
    }
  }
}
