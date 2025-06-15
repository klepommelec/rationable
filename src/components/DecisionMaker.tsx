
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Plus, Sparkles, LoaderCircle, Lightbulb, BookCopy, Eraser, History } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CriterionRow } from './CriterionRow';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DecisionHistory } from './DecisionHistory';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';


const templates = [
  {
    name: "💻 Choisir un ordinateur",
    dilemma: "Quel nouvel ordinateur portable devrais-je acheter ?",
    criteria: [
      { name: "Performance" },
      { name: "Prix" },
      { name: "Autonomie de la batterie" },
      { name: "Portabilité" },
    ],
  },
  {
    name: "✈️ Choisir des vacances",
    dilemma: "Où devrais-je partir pour mes prochaines vacances ?",
    criteria: [
      { name: "Budget total" },
      { name: "Activités" },
      { name: "Météo" },
      { name: "Temps de trajet" },
    ],
  },
  {
    name: "🤔 Apprendre un framework JS",
    dilemma: "Quel framework JavaScript devrais-je apprendre en 2025 ?",
    criteria: [
      { name: "Popularité" },
      { name: "Courbe d'apprentissage" },
      { name: "Performance" },
      { name: "Offres d'emploi" },
    ],
  },
];


const callOpenAiApi = async (prompt: string) => {
  const { data, error } = await supabase.functions.invoke('openai-decision-maker', {
    body: { prompt },
  });

  if (error) {
    console.error("Supabase function error:", error);
    const errorMessage = error.context?.data?.error || error.message || "Une erreur inconnue est survenue.";
    throw new Error(`Erreur de l'assistant IA: ${errorMessage}`);
  }

  return data;
};


const DecisionMaker = () => {
  const [dilemma, setDilemma] = useState('');
  const [criteria, setCriteria] = useState<ICriterion[]>([
    { id: crypto.randomUUID(), name: '' },
    { id: crypto.randomUUID(), name: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [result, setResult] = useState<IResult | null>(null);
  const [history, setHistory] = useState<IDecision[]>([]);
  const justAppliedTemplate = useRef(false);

  useEffect(() => {
    if (dilemma.trim().length < 10 || isGeneratingCriteria) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleGenerateCriteria();
    }, 1500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dilemma]);

  const handleCriterionChange = (id: string, name: string) => {
    const newCriteria = criteria.map(c => c.id === id ? { ...c, name } : c);
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { id: crypto.randomUUID(), name: '' }]);
  };

  const removeCriterion = (id: string) => {
    const newCriteria = criteria.filter((c) => c.id !== id);
    setCriteria(newCriteria);
  };

  const handleDragEnd = (event: DragEndEvent) => {
      const {active, over} = event;
      if (over && active.id !== over.id) {
        setCriteria((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

  const handleGenerateCriteria = async () => {
    if (dilemma.trim() === '') return;
    setIsGeneratingCriteria(true);
    setResult(null);

    const prompt = `Pour le dilemme suivant : "${dilemma}", générez 4 critères d'évaluation pertinents. Retournez le résultat sous la forme d'un objet JSON avec une seule clé "criteria" contenant un tableau de chaînes de caractères. Exemple : {"criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]}`;

    try {
      const response = await callOpenAiApi(prompt);
      const generatedCriteriaNames = response.criteria;
      if (Array.isArray(generatedCriteriaNames) && generatedCriteriaNames.every(c => typeof c === 'string')) {
        setCriteria(generatedCriteriaNames.slice(0, 4).map(name => ({ id: crypto.randomUUID(), name })));
      } else {
        throw new Error("Le format des critères générés est incorrect.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de la génération des critères : ${e.message}`);
      }
      setCriteria([
          { id: crypto.randomUUID(), name: 'Coût' }, 
          { id: crypto.randomUUID(), name: 'Qualité' }, 
          { id: crypto.randomUUID(), name: 'Durabilité' }
      ]);
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    const orderedCriteria = criteria.filter(c => c.name.trim() !== '').map(c => c.name).join(', ');
    const prompt = `Vous êtes un assistant expert en prise de décision. Analysez le dilemme suivant : "${dilemma}", en vous basant sur ces critères, listés par ordre d'importance (du plus important au moins important) : ${orderedCriteria}.
    Veuillez :
    1. Générer 3 options potentielles.
    2. Pour chaque option, fournir une liste concise d'avantages (pros) et d'inconvénients (cons) en se basant sur les critères.
    3. Pour chaque option, calculer un score de pertinence de 0 à 100, basé sur l'adéquation de l'option avec les critères ordonnés. Un score plus élevé signifie une meilleure adéquation.
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
      const newResult: IResult = await callOpenAiApi(prompt);
      if (newResult && newResult.recommendation && newResult.breakdown && Array.isArray(newResult.breakdown) && newResult.breakdown.every(item => typeof item.score === 'number')) {
          setResult(newResult);
          const newDecision: IDecision = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dilemma,
            criteria: criteria.filter(c => c.name.trim() !== ''),
            result: newResult
          };
          setHistory(prevHistory => [newDecision, ...prevHistory]);
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
    setCriteria(template.criteria.map(c => ({ id: crypto.randomUUID(), name: c.name })));
    setResult(null);
    justAppliedTemplate.current = true;
    toast.success(`Modèle "${template.name}" appliqué !`);
  }

  const clearSession = () => {
    setDilemma('');
    setCriteria([{ id: crypto.randomUUID(), name: '' }, { id: crypto.randomUUID(), name: '' }]);
    setResult(null);
    toast.info("Session réinitialisée.");
  }
  
  const loadDecision = (decisionId: string) => {
    const decisionToLoad = history.find(d => d.id === decisionId);
    if (decisionToLoad) {
      setDilemma(decisionToLoad.dilemma);
      setCriteria(decisionToLoad.criteria);
      setResult(decisionToLoad.result);
      toast.info("Décision précédente chargée.");
    }
  };

  const deleteDecision = (decisionId: string) => {
    setHistory(prevHistory => prevHistory.filter(d => d.id !== decisionId));
    toast.success("Décision supprimée de l'historique.");
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("L'historique des décisions a été effacé.");
  };

  const isAnalyzeDisabled = dilemma.trim() === '' || criteria.filter(c => c.name.trim() !== '').length < 1 || isLoading || isGeneratingCriteria;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <CardHeader className="text-center pt-12">
          <div className="flex justify-center items-center mb-4">
            <BrainCircuit className="h-12 w-12 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400">Assistant de Décision IA</CardTitle>
          <CardDescription className="text-muted-foreground">Posez votre dilemme, et laissez l'IA vous éclairer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">1. Votre dilemme</label>
            <Textarea
              placeholder="Ex: Quel framework JS devrais-je apprendre en 2025 ?"
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              className="focus:ring-cyan-500 text-base md:text-sm"
              disabled={isLoading || isGeneratingCriteria}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-medium">Ou utilisez un modèle</label>
              <div className="flex items-center gap-1">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Historique
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-background w-full sm:max-w-lg p-6 flex flex-col">
                    <SheetHeader className="pr-6">
                      <SheetTitle>Historique des décisions</SheetTitle>
                      <SheetDescription className="text-muted-foreground">
                        Chargez ou supprimez vos analyses passées.
                      </SheetDescription>
                    </SheetHeader>
                    <DecisionHistory 
                      history={history}
                      onLoad={loadDecision}
                      onDelete={deleteDecision}
                      onClear={clearHistory}
                      onClose={() => {}}
                    />
                  </SheetContent>
                </Sheet>
                 <Button variant="ghost" size="sm" onClick={clearSession}>
                  <Eraser className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map(template => (
                <Button key={template.name} variant="outline" size="sm" onClick={() => applyTemplate(template)}>
                  <BookCopy className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {dilemma.trim() !== '' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <label className="font-medium">2. Critères (glissez pour réordonner par importance)</label>
                {isGeneratingCriteria && (
                    <div className="flex items-center text-xs text-cyan-400">
                      <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                      Génération des critères...
                    </div>
                )}
              </div>
              
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={criteria.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {criteria.map((criterion) => (
                      <CriterionRow
                        key={criterion.id}
                        criterion={criterion}
                        onNameChange={handleCriterionChange}
                        onRemove={removeCriterion}
                        isRemoveDisabled={criteria.length <= 1}
                        isDragDisabled={isGeneratingCriteria}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <Button variant="outline" onClick={addCriterion} disabled={isGeneratingCriteria}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un critère
              </Button>
            </div>
          )}
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
        <Card className="mt-8 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Recommandation de l'IA</CardTitle>
             <Badge className="w-fit bg-cyan-500 text-slate-900 text-lg mt-2">{result.recommendation}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-lg">Analyse détaillée :</h3>
            {result.breakdown.sort((a, b) => b.score - a.score).map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-cyan-400 text-md">{item.option}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.score}/100</span>
                    <Progress value={item.score} className="w-24 h-2 bg-secondary" />
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-green-400">Avantages</h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {item.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-400">Inconvénients</h5>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
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
