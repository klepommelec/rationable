import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Sparkles, LoaderCircle, Lightbulb, BookCopy, Eraser, History, RefreshCw } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DecisionHistory } from './DecisionHistory';
import { ICriterion, IResult, IDecision } from '@/types/decision';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from './ThemeToggle';
import { CriteriaManager } from './CriteriaManager';
import { ResultSkeleton } from './ResultSkeleton';
import { CriteriaSkeleton } from './CriteriaSkeleton';
import { useDebounceCallback } from 'usehooks-ts';


const templates = [
  {
    name: "💻 Choisir un ordinateur",
    dilemma: "Quel nouvel ordinateur portable devrais-je acheter ?",
  },
  {
    name: "✈️ Choisir des vacances",
    dilemma: "Où devrais-je partir pour mes prochaines vacances ?",
  },
  {
    name: "🤔 Apprendre un framework JS",
    dilemma: "Quel framework JavaScript devrais-je apprendre en 2025 ?",
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
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'generating-criteria' | 'generating-options' | 'done'>('idle');
  const [criteria, setCriteria] = useState<ICriterion[]>([]);
  const [result, setResult] = useState<IResult | null>(null);
  const [history, setHistory] = useState<IDecision[]>([]);
  
  const initialCriteriaRef = useRef<ICriterion[]>([]);
  
  const isLoading = analysisStep === 'generating-criteria' || analysisStep === 'generating-options';

  const handleGenerateOptions = async (criteriaOverride?: ICriterion[]) => {
    const currentCriteria = criteriaOverride || criteria;
    
    if (currentCriteria.length < 2) {
      toast.error("Veuillez définir au moins 2 critères.");
      if (criteriaOverride) {
        setAnalysisStep('idle');
      }
      return;
    }
    if (currentCriteria.some(c => c.name.trim() === '')) {
      toast.error("Veuillez nommer tous les critères avant de continuer.");
      if (criteriaOverride) {
        setAnalysisStep('idle');
      }
      return;
    }

    setAnalysisStep('generating-options');

    const criteriaNames = currentCriteria.map(c => c.name);
    
    const prompt = `Vous êtes un assistant expert en prise de décision. Analysez le dilemme suivant : "${dilemma}" en vous basant sur les critères suivants, qui sont classés par ordre d'importance : ${criteriaNames.join(', ')}.
    Veuillez :
    1. Générer 3 options potentielles.
    2. Pour chaque option, fournir une liste concise d'avantages (pros) et d'inconvénients (cons) en se basant sur les critères fournis.
    3. Pour chaque option, calculer un score de pertinence de 0 à 100, basé sur l'adéquation de l'option avec les critères. Un score plus élevé signifie une meilleure adéquation.
    4. Fournir une recommandation claire pour la meilleure option et expliquer pourquoi en quelques phrases.

    Retournez le résultat sous la forme d'un objet JSON valide avec la structure suivante (n'incluez PAS la clé "criteria" dans votre réponse JSON) :
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
      const apiResult: Omit<IResult, 'criteria'> = await callOpenAiApi(prompt);

      if (apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number')) {
          const newResult: IResult = {
            ...apiResult,
            criteria: criteriaNames,
          };
          setResult(newResult);
          
          if (!result) {
            const newDecision: IDecision = {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              dilemma,
              criteria: currentCriteria,
              result: newResult
            };
            setHistory(prevHistory => [newDecision, ...prevHistory]);
          }
          setAnalysisStep('done');
          toast.success("Analyse complète générée !");

      } else {
        throw new Error("La structure de la réponse de l'IA pour les options est invalide.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de la génération des options : ${e.message}`);
      }
      setAnalysisStep(result ? 'done' : 'idle');
    }
  };

  const handleStartAnalysis = async () => {
    setAnalysisStep('generating-criteria');
    setResult(null);
    setCriteria([]);

    const prompt = `Vous êtes un assistant expert en prise de décision. Pour le dilemme suivant : "${dilemma}", veuillez déterminer les 4 critères d'évaluation les plus pertinents.
    
    Retournez le résultat sous la forme d'un objet JSON valide avec la structure suivante :
    {
      "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"]
    }`;
    
    try {
      const response = await callOpenAiApi(prompt);
      if (response && response.criteria && Array.isArray(response.criteria)) {
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          setCriteria(newCriteria);
          toast.success("Critères générés ! Génération des options en cours...");
          await handleGenerateOptions(newCriteria);
      } else {
        throw new Error("La structure de la réponse de l'IA pour les critères est invalide.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de la génération des critères : ${e.message}`);
      }
      setAnalysisStep('idle');
    }
  };
  
  const debouncedGenerateOptions = useDebounceCallback(handleGenerateOptions, 2000);

  useEffect(() => {
    if (analysisStep === 'done') {
      initialCriteriaRef.current = criteria;
    }
  }, [analysisStep, criteria]);

  useEffect(() => {
    const criteriaHaveChanged = JSON.stringify(criteria) !== JSON.stringify(initialCriteriaRef.current);
    if (analysisStep === 'done' && criteriaHaveChanged) {
      toast.info("Les critères ont changé, mise à jour de l'analyse...", { icon: <RefreshCw className="animate-spin" />, duration: 2000 });
      debouncedGenerateOptions();
    }
  }, [criteria, analysisStep, debouncedGenerateOptions]);
  
  const applyTemplate = (template: typeof templates[0]) => {
    setDilemma(template.dilemma);
    setResult(null);
    setCriteria([]);
    setAnalysisStep('idle');
    toast.success(`Modèle "${template.name}" appliqué !`);
  }

  const clearSession = () => {
    setDilemma('');
    setResult(null);
    setCriteria([]);
    setAnalysisStep('idle');
    toast.info("Session réinitialisée.");
  }
  
  const loadDecision = (decisionId: string) => {
    const decisionToLoad = history.find(d => d.id === decisionId);
    if (decisionToLoad) {
      setDilemma(decisionToLoad.dilemma);
      setCriteria(decisionToLoad.criteria);
      setResult(decisionToLoad.result);
      setAnalysisStep('done');
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

  const isMainButtonDisabled = dilemma.trim() === '' || isLoading;

  const renderMainButton = () => {
    switch (analysisStep) {
      case 'generating-criteria':
        return (
          <Button disabled className="w-full bg-cyan-500 text-slate-900 font-bold text-lg py-6">
            <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
            Génération des critères...
          </Button>
        );
      case 'generating-options':
        return (
          <Button disabled className="w-full bg-cyan-500 text-slate-900 font-bold text-lg py-6">
            <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
            Analyse en cours...
          </Button>
        );
      case 'done':
         return (
          <Button onClick={clearSession} variant="secondary" className="w-full font-bold text-lg py-6">
            <Eraser className="h-5 w-5 mr-2" />
            Recommencer une nouvelle analyse
          </Button>
        );
      case 'idle':
      default:
        return (
          <Button onClick={handleStartAnalysis} disabled={isMainButtonDisabled} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold text-lg py-6 transition-all duration-300 ease-in-out transform hover:scale-105">
            <Sparkles className="h-5 w-5 mr-2" />
            Lancer l'analyse
          </Button>
        );
    }
  };

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
            <label className="font-medium">Votre dilemme</label>
            <Textarea
              placeholder="Ex: Quel framework JS devrais-je apprendre en 2025 ?"
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              className="focus:ring-cyan-500 text-base md:text-sm"
              disabled={isLoading || analysisStep === 'done'}
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
                <Button key={template.name} variant="outline" size="sm" onClick={() => applyTemplate(template)} disabled={isLoading || analysisStep !== 'idle'}>
                  <BookCopy className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
           {analysisStep === 'generating-criteria' && <CriteriaSkeleton />}

           { (analysisStep === 'generating-options' || analysisStep === 'done') && criteria.length > 0 && (
            <CriteriaManager
              criteria={criteria}
              setCriteria={setCriteria}
              isInteractionDisabled={isLoading}
            />
           )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {renderMainButton()}
        </CardFooter>
      </Card>
      
      {analysisStep === 'generating-options' && <ResultSkeleton />}

      {result && (analysisStep === 'done' || analysisStep === 'generating-options') && (
        <Card className="mt-8 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Lightbulb className="text-yellow-400" /> Recommandation de l'IA</CardTitle>
             <Badge className="w-fit bg-cyan-500 text-slate-900 text-lg mt-2">{result.recommendation}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.criteria && result.criteria.length > 0 && (
                <div className="p-4 rounded-lg bg-accent border">
                    <h3 className="font-semibold text-lg mb-2">Critères d'analyse utilisés</h3>
                    <div className="flex flex-wrap gap-2">
                        {result.criteria.map((criterion, index) => (
                            <Badge key={index} variant="secondary">{criterion}</Badge>
                        ))}
                    </div>
                </div>
            )}
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
