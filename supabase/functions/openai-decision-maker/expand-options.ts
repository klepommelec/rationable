// Support expand-options dans la fonction openai-decision-maker
export const expandOptionsHandler = async (payload: any, openai: any) => {
  const { dilemma, criteria, currentOptions, category, maxNewOptions = 5 } = payload;
  
  const systemPrompt = `Tu es un expert en génération d'alternatives créatives pour des décisions.
Ta mission est de générer ${maxNewOptions} nouvelles options viables qui n'ont PAS déjà été considérées.

RÈGLES STRICTES :
1. NE PAS répéter les options existantes : ${currentOptions.join(', ')}
2. Générer EXACTEMENT ${maxNewOptions} nouvelles options uniques
3. Chaque option doit être viable et réaliste pour le contexte donné
4. Inclure 2-4 avantages et 2-4 inconvénients par option
5. Attribuer un score entre 0.1 et 0.9 basé sur la viabilité

FORMAT REQUIS (JSON uniquement) :
{
  "newOptions": [
    {
      "option": "Nom de l'option",
      "pros": ["avantage 1", "avantage 2", "avantage 3"],
      "cons": ["inconvénient 1", "inconvénient 2"],
      "score": 0.75
    }
  ]
}`;

  const userPrompt = `DILEMME : ${dilemma}
CATÉGORIE : ${category || 'Non spécifiée'}
CRITÈRES IMPORTANTS : ${criteria.map((c: any) => c.name).join(', ')}

OPTIONS DÉJÀ CONSIDÉRÉES (à éviter) :
${currentOptions.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

Génère ${maxNewOptions} nouvelles options créatives et viables qui n'ont pas encore été explorées.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8, // Plus créatif pour de nouvelles idées
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Réponse vide de l\'API');
    }

    // Parser la réponse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    if (!result.newOptions || !Array.isArray(result.newOptions)) {
      throw new Error('Structure de réponse invalide');
    }

    // Valider et nettoyer les nouvelles options
    const validatedOptions = result.newOptions
      .filter((opt: any) => opt.option && opt.pros && opt.cons)
      .slice(0, maxNewOptions)
      .map((opt: any) => ({
        option: opt.option.trim(),
        pros: Array.isArray(opt.pros) ? opt.pros.slice(0, 4) : [],
        cons: Array.isArray(opt.cons) ? opt.cons.slice(0, 4) : [],
        score: typeof opt.score === 'number' ? Math.max(0.1, Math.min(0.9, opt.score)) : 0.5
      }));

    return {
      newOptions: validatedOptions,
      success: true
    };

  } catch (error) {
    console.error('❌ Error generating more options:', error);
    throw new Error(`Erreur lors de la génération d'options : ${error.message}`);
  }
};