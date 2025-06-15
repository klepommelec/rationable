import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, Plus, Trash2, Sparkles, LoaderCircle, Lightbulb, BookCopy, Eraser } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ICriterion {
  name: string;
  weight: number;
}

interface IBreakdownItem {
  option: string;
  pros: string[];
  cons: string[];
  score: number;
}

interface IResult {
  recommendation: string;
  breakdown: IBreakdownItem[];
}

const templates = [
  {
    name: "💻 Choisir un ordinateur",
    dilemma: "Quel nouvel ordinateur portable devrais-je acheter ?",
    criteria: [
      { name: "Prix", weight: 8 },
      { name: "Performance", weight: 9 },
      { name: "Autonomie de la batterie", weight: 7 },
      { name: "Portabilité", weight: 6 },
    ],
  },
  {
    name: "✈️ Choisir des vacances",
    dilemma: "Où devrais-je partir pour mes prochaines vacances ?",
    criteria: [
      { name: "Budget total", weight: 9 },
      { name: "Activités", weight: 7 },
      { name: "Météo", weight: 8 },
      { name: "Temps de trajet", weight: 5 },
    ],
  },
  {
    name: "🤔 Apprendre un framework JS",
    dilemma: "Quel framework JavaScript devrais-je apprendre en 2025 ?",
    criteria: [
      { name: "Courbe d'apprentissage", weight: 7 },
      { name: "Popularité", weight: 8 },
      { name: "Performance", weight: 9 },
      { name: "Offres d'emploi", weight: 10 },
    ],
  },
];


const callOpenAiApi = async (prompt: string, apiKey: string) => {
  if (!apiKey) {
    throw new Error("Veuillez entrer votre clé API OpenAI.");
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a world-class decision making assistant. Your responses must be in French and in valid JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI API Error:", errorData);
    throw new Error(`Erreur de l'API OpenAI: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch(e) {
    console.error("Failed to parse JSON from API response:", content);
    throw new Error("La réponse de l'API n'était pas un JSON valide.");
  }
};


const DecisionMaker = () => {
  const [apiKey, setApiKey] = useState('');
  const [dilemma, setDilemma] = useState('');
  const [criteria, setCriteria] = useState<ICriterion[]>([
    { name: '', weight: 5 },
    { name: '', weight: 5 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [result, setResult] = useState<IResult | null>(null);
  const justAppliedTemplate = useRef(false);

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    const savedState = localStorage.getItem('decision_maker_state');
    if (savedState) {
      try {
        const { dilemma, criteria, result } = JSON.parse(savedState);
        if (dilemma) setDilemma(dilemma);
        if (criteria && criteria.length > 0) setCriteria(criteria);
        if (result) setResult(result);
      } catch (e) {
        console.error("Failed to parse saved state from localStorage", e);
        localStorage.removeItem('decision_maker_state');
      }
    }
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = JSON.stringify({ dilemma, criteria, result });
    localStorage.setItem('decision_maker_state', stateToSave);
  }, [dilemma, criteria, result]);

  useEffect(() => {
    if (justAppliedTemplate.current) {
      justAppliedTemplate.current = false;
      return;
    }

    if (dilemma.trim().length < 10 || !apiKey || isGeneratingCriteria) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleGenerateCriteria();
    }, 1500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dilemma]);

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
    setResult(null);

    const prompt = `Pour le dilemme suivant : "${dilemma}", générez 4 critères d'évaluation pertinents. Retournez le résultat sous la forme d'un objet JSON avec une seule clé "criteria" contenant un tableau de chaînes de caractères. Exemple : {"criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]}`;

    try {
      const response = await callOpenAiApi(prompt, apiKey);
      const generatedCriteriaNames = response.criteria;
      if (Array.isArray(generatedCriteriaNames) && generatedCriteriaNames.every(c => typeof c === 'string')) {
        setCriteria(generatedCriteriaNames.slice(0, 4).map(name => ({ name, weight: 5 })));
      } else {
        throw new Error("Le format des critères générés est incorrect.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de la génération des critères : ${e.message}`);
      }
      setCriteria([{ name: 'Coût', weight: 5 }, { name: 'Qualité', weight: 5 }, { name: 'Durabilité', weight: 5 }]);
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    const weightedCriteria = criteria.filter(c => c.name.trim() !== '').map(c => `${c.name} (importance: ${c.weight}/10)`).join(', ');
    const prompt = `Vous êtes un assistant expert en prise de décision. Analysez le dilemme suivant : "${dilemma}", en vous basant sur ces critères pondérés : ${weightedCriteria}.
    Veuillez :
    1. Générer 3 options potentielles.
    2. Pour chaque option, fournir une liste concise d'avantages (pros) et d'inconvénients (cons) en se basant sur les critères.
    3. Pour chaque option, calculer un score de pertinence de 0 à 100, basé sur l'adéquation de l'option avec les critères pondérés. Un score plus élevé signifie une meilleure adéquation.
    4. Fournir une recommandation claire pour la meilleure option et expliquer pourquoi en quelques phrases.

    Retournez le résultat sous la forme d'un objet JSON valide avec la structure suivante :
    {
      "recommendation": "Nom de l'option recommandée",
      "breakdown": [
        {
          "option": "Nom de l'option 1",
          "pros": ["Avantage 1", "Avantage 2"],
          "cons": ["Inconvénient 1", "Inconvénient 2"],
          "score": 85
        }
      ]
    }`;
    
    try {
      const newResult: IResult = await callOpenAiApi(prompt, apiKey);
      if (newResult && newResult.recommendation && newResult.breakdown && Array.isArray(newResult.breakdown) && newResult.breakdown.every(item => typeof item.score === 'number')) {
          setResult(newResult);
      } else {
        throw new Error("La structure de la réponse de l'IA est invalide ou le score est manquant.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de l'analyse : ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyTemplate = (template: typeof templates[0]) => {
    setDilemma(template.dilemma);
    setCriteria(template.criteria);
    setResult(null);
    justAppliedTemplate.current = true;
    toast.success(`Modèle "${template.name}" appliqué !`);
  }

  const clearSession = () => {
    setDilemma('');
    setCriteria([{ name: '', weight: 5 }, { name: '', weight: 5 }]);
    setResult(null);
    localStorage.removeItem('decision_maker_state');
    toast.info("Session réinitialisée.");
  }

  const isAnalyzeDisabled = !apiKey || dilemma.trim() === '' || criteria.filter(c => c.name.trim() !== '').length < 1 || isLoading || isGeneratingCriteria;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <BrainCircuit className="h-12 w-12 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Assistant de Décision IA</CardTitle>
          <CardDescription className="text-slate-400">Posez votre dilemme, et laissez l'IA vous éclairer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-slate-300 font-medium">Clé API OpenAI</label>
            <Input
              id="api-key"
              type="password"
              placeholder="Entrez votre clé API OpenAI"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-500">
              Votre clé est stockée localement. Obtenez votre clé sur <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline text-cyan-400">le site d'OpenAI</a>.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-medium">Ou utilisez un modèle</label>
               <Button variant="ghost" size="sm" onClick={clearSession} className="text-slate-400 hover:text-white">
                <Eraser className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map(template => (
                <Button key={template.name} variant="outline" size="sm" onClick={() => applyTemplate(template)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  <BookCopy className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

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
            {result.breakdown.sort((a, b) => b.score - a.score).map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-cyan-400 text-md">{item.option}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{item.score}/100</span>
                    <Progress value={item.score} className="w-24 h-2 bg-slate-700" />
                  </div>
                </div>

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
