
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, Plus, Trash2, Sparkles, LoaderCircle, Lightbulb } from 'lucide-react';

interface ICriterion {
  name: string;
  weight: number;
}

interface IResult {
  recommendation: string;
  breakdown: {
    option: string;
    pros: string[];
    cons: string[];
  }[];
}

const callPerplexityApi = async (prompt: string, apiKey: string) => {
  if (!apiKey) {
    throw new Error("Veuillez entrer votre clé API Perplexity.");
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: 'You are a world-class decision making assistant. Your responses must be in French and in valid JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Perplexity API Error:", errorData);
    throw new Error(`Erreur de l'API Perplexity: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  try {
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(content);
  } catch(e) {
    console.error("Failed to parse JSON from API response:", content);
    throw new Error("La réponse de l'API n'était pas un JSON valide.");
  }
};


const DecisionMaker = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('perplexity_api_key') || '');
  const [dilemma, setDilemma] = useState('');
  const [criteria, setCriteria] = useState<ICriterion[]>([
    { name: '', weight: 5 },
    { name: '', weight: 5 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [result, setResult] = useState<IResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('perplexity_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (dilemma.trim().length < 5 || !apiKey) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleGenerateCriteria();
    }, 1500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dilemma, apiKey]);

  const handleCriterionChange = (index: number, name: string) => {
    const newCriteria = [...criteria];
    newCriteria[index].name = name;
    setCriteria(newCriteria);
  };

  const handleWeightChange = (index: number, newWeight: number[]) => {
    const newCriteria = [...criteria];
    newCriteria[index].weight = newWeight[0];
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', weight: 5 }]);
  };

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  const handleGenerateCriteria = async () => {
    if (dilemma.trim() === '' || !apiKey) return;
    setIsGeneratingCriteria(true);
    setError(null);
    setResult(null);

    const prompt = `Pour le dilemme suivant : "${dilemma}", générez 4 critères d'évaluation pertinents. Retournez le résultat sous la forme d'un tableau JSON de chaînes de caractères. Exemple : ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]`;

    try {
      const generatedCriteriaNames = await callPerplexityApi(prompt, apiKey);
      if (Array.isArray(generatedCriteriaNames) && generatedCriteriaNames.every(c => typeof c === 'string')) {
        setCriteria(generatedCriteriaNames.slice(0, 4).map(name => ({ name, weight: 5 })));
      } else {
        throw new Error("Le format des critères générés est incorrect.");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`Erreur lors de la génération des critères : ${e.message}`);
      }
      setCriteria([{ name: 'Coût', weight: 5 }, { name: 'Qualité', weight: 5 }, { name: 'Durabilité', weight: 5 }]);
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const weightedCriteria = criteria.filter(c => c.name.trim() !== '').map(c => `${c.name} (importance: ${c.weight}/10)`).join(', ');
    const prompt = `Vous êtes un assistant expert en prise de décision. Analysez le dilemme suivant : "${dilemma}", en vous basant sur ces critères pondérés : ${weightedCriteria}.
    Veuillez :
    1. Générer 3 à 4 options potentielles.
    2. Pour chaque option, fournir une liste concise d'avantages (pros) et d'inconvénients (cons) en se basant sur les critères.
    3. Fournir une recommandation claire pour la meilleure option et expliquer pourquoi en quelques phrases.

    Retournez le résultat sous la forme d'un objet JSON valide avec la structure suivante :
    {
      "recommendation": "Nom de l'option recommandée",
      "breakdown": [
        {
          "option": "Nom de l'option 1",
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1", "Inconvénient 2"]
        }
      ]
    }`;
    
    try {
      const newResult = await callPerplexityApi(prompt, apiKey);
      if (newResult && newResult.recommendation && newResult.breakdown) {
          setResult(newResult);
      } else {
        throw new Error("La structure de la réponse de l'IA est invalide.");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(`Erreur lors de l'analyse : ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAnalyzeDisabled = !apiKey || dilemma.trim() === '' || criteria.filter(c => c.name.trim() !== '').length < 1 || isLoading || isGeneratingCriteria;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <BrainCircuit className="h-12 w-12 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Assistant de Décision IA</CardTitle>
          <CardDescription className="text-slate-400">Posez votre dilemme, listez vos options, et laissez l'IA vous éclairer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-slate-300 font-medium">Clé API Perplexity</label>
            <Input
              id="api-key"
              type="password"
              placeholder="Entrez votre clé API Perplexity"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-500">
              Votre clé est stockée localement. Obtenez votre clé sur <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noreferrer" className="underline text-cyan-400">le site de Perplexity</a>.
            </p>
          </div>

          {error && (
            <div className="p-4 my-4 rounded-md bg-red-900/50 border border-red-500/50 text-red-300 text-sm">
              <p className="font-bold mb-1">Une erreur est survenue</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-300 font-medium">1. Votre dilemme</label>
            <Input
              placeholder="Ex: Quel framework JS devrais-je apprendre en 2025 ?"
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
              disabled={isLoading || isGeneratingCriteria}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 font-medium">2. Critères d'évaluation (Pondération)</label>
              {isGeneratingCriteria && (
                  <div className="flex items-center text-xs text-cyan-400">
                    <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                    Génération des critères...
                  </div>
              )}
            </div>

            {criteria.map((criterion, index) => (
              <div key={index} className="flex items-center gap-4">
                <Input
                  placeholder={`Critère ${index + 1}`}
                  value={criterion.name}
                  onChange={(e) => handleCriterionChange(index, e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:ring-cyan-500 flex-grow"
                  disabled={isGeneratingCriteria}
                />
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <Slider
                    value={[criterion.weight]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleWeightChange(index, value)}
                    disabled={isGeneratingCriteria}
                    className="w-full"
                  />
                  <span className="w-6 text-center text-slate-400 font-mono">{criterion.weight}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeCriterion(index)} disabled={criteria.length <= 1 || isGeneratingCriteria}>
                  <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500 transition-colors" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addCriterion} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" disabled={isGeneratingCriteria}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un critère
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105">
            {isLoading ? (
              <>
                <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Lancer l'analyse
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {result && !isLoading && (
        <Card className="mt-8 bg-slate-900/80 border-slate-800 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Recommandation de l'IA</CardTitle>
             <Badge className="w-fit bg-cyan-500 text-slate-900 text-lg mt-2">{result.recommendation}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-300">Analyse détaillée :</h3>
            {result.breakdown.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h4 className="font-bold text-cyan-400 text-md">{item.option}</h4>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-green-400">Avantages</h5>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {item.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-400">Inconvénients</h5>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {item.cons.map((con, i) => <li key={i}>{con}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DecisionMaker;
