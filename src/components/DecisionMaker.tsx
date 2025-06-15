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


const DecisionMaker = () => {
  const [dilemma, setDilemma] = useState('');
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [criteria, setCriteria] = useState<ICriterion[]>([]);
  const [result, setResult] = useState<IResult | null>(null);
  const [history, setHistory] = useState<IDecision[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const initialCriteriaRef = useRef<ICriterion[]>([]);
  
  const isLoading = analysisStep === 'analyzing';

  const handleGenerateOptions = async () => {
    const currentCriteria = criteria;
    
    if (currentCriteria.length < 2) {
      toast.error("Veuillez définir au moins 2 critères.");
      return;
    }
    if (currentCriteria.some(c => c.name.trim() === '')) {
      toast.error("Veuillez nommer tous les critères avant de continuer.");
      return;
    }

    setIsUpdating(true);

    const criteriaNames = currentCriteria.map(c => c.name);
    
    const prompt = `Pour le dilemme "${dilemma}", en utilisant les critères importants : ${criteriaNames.join(', ')}.
    Veuillez générer 3 options, les évaluer (pros/cons, score de 0 à 100) et fournir une recommandation.
    Format JSON attendu :
    {
      "recommendation": "Option Recommandée",
      "breakdown": [
        {
          "option": "Option 1",
          "pros": ["Avantage 1"],
          "cons": ["Inconvénient 1"],
          "score": 85
        }
      ]
    }`;

    try {
      const apiResult: IResult = await callOpenAiApi(prompt);

      if (apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number')) {
          setResult(apiResult);
          
          const lastDecision = history[0];
          if (lastDecision && lastDecision.dilemma === dilemma) {
            const updatedDecision: IDecision = {
              ...lastDecision,
              criteria: currentCriteria,
              result: apiResult
            };
            setHistory(prevHistory => [updatedDecision, ...prevHistory.slice(1)]);
          }
          toast.success("Analyse mise à jour !");

      } else {
        throw new Error("La structure de la réponse de l'IA pour les options est invalide.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de la mise à jour de l'analyse : ${e.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartAnalysis = async () => {
    setAnalysisStep('analyzing');
    setProgress(0);
    setProgressMessage("Initialisation de l'analyse...");
    setResult(null);
    setCriteria([]);

    setTimeout(() => setProgress(10), 100);

    const prompt = `En tant qu'assistant expert en prise de décision, pour le dilemme : "${dilemma}", veuillez fournir une analyse complète.
    JSON attendu :
    {
      "criteria": ["Critère 1", "Critère 2", "Critère 3", "Critère 4"],
      "result": {
        "recommendation": "Option Recommandée",
        "breakdown": [
          {
            "option": "Option 1",
            "pros": ["Avantage 1"],
            "cons": ["Inconvénient 1"],
            "score": 85
          }
        ]
      }
    }`;
    
    try {
      setProgress(25);
      setProgressMessage("Génération des critères et options...");
      const response = await callOpenAiApi(prompt);
      setProgress(75);
      setProgressMessage("Finalisation de l'analyse...");

      const isValidCriteria = response && response.criteria && Array.isArray(response.criteria);
      const apiResult = response.result;
      const isValidResult = apiResult && apiResult.recommendation && apiResult.breakdown && Array.isArray(apiResult.breakdown) && apiResult.breakdown.every(item => typeof item.score === 'number');

      if (isValidCriteria && isValidResult) {
          const newCriteria = response.criteria.map((name: string) => ({
            id: crypto.randomUUID(),
            name,
          }));
          setCriteria(newCriteria);
          setResult(apiResult);
          
          const newDecision: IDecision = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            dilemma,
            criteria: newCriteria,
            result: apiResult
          };
          setHistory(prevHistory => [newDecision, ...prevHistory]);
          
          setProgress(100);
          setAnalysisStep('done');
          toast.success("Analyse complète générée !");
      } else {
        throw new Error("La structure de la réponse de l'IA est invalide.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.error(`Erreur lors de l'analyse : ${e.message}`);
      }
      setAnalysisStep('idle');
      setProgress(0);
      setProgressMessage('');
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
    if (analysisStep === 'done' && criteriaHaveChanged && !isUpdating) {
      toast.info("Les critères ont changé, mise à jour de l'analyse...", { icon: <RefreshCw className="animate-spin" />, duration: 2000 });
      debouncedGenerateOptions();
    }
  }, [criteria, analysisStep, debouncedGenerateOptions, isUpdating]);
  
  const applyTemplate = (template: typeof templates[0]) => {
    setDilemma(template.dilemma);
    setResult(null);
    setCriteria([]);
    setAnalysisStep('idle');
    setProgress(0);
    setProgressMessage('');
    toast.success(`Modèle "${template.name}" appliqué !`);
  }

  const clearSession = () => {
    setDilemma('');
    setResult(null);
    setCriteria([]);
    setAnalysisStep('idle');
    setProgress(0);
    setProgressMessage('');
    toast.info("Session réinitialisée.");
  }
  
  const loadDecision = (decisionId: string) => {
    const decisionToLoad = history.find(d => d.id === decisionId);
    if (decisionToLoad) {
      setDilemma(decisionToLoad.dilemma);
      setCriteria(decisionToLoad.criteria);
      setResult(decisionToLoad.result);
      setAnalysisStep('done');
      setProgress(0);
      setProgressMessage('');
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
      case 'analyzing':
        return (
          <div className="w-full space-y-2">
            <Button disabled className="w-full bg-cyan-500 text-slate-900 font-bold text-lg py-6">
              <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
              {progressMessage || 'Analyse en cours...'}
            </Button>
            <Progress value={progress} className="w-full h-2" />
          </div>
        );
      case 'done':
         return null;
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
              disabled={isLoading || isUpdating || analysisStep === 'done'}
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
                <Button key={template.name} variant="outline" size="sm" onClick={() => applyTemplate(template)} disabled={isLoading || isUpdating || analysisStep !== 'idle'}>
                  <BookCopy className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {renderMainButton()}
        </CardFooter>
      </Card>
      
      {analysisStep === 'analyzing' && <ResultSkeleton />}
      
      {result && analysisStep === 'done' && (
        <Card className="mt-8 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-start gap-3">
              <Lightbulb className="text-yellow-400 h-7 w-7 shrink-0" />
              <span>{dilemma}</span>
            </CardTitle>
             <Badge className="w-fit bg-cyan-500 text-slate-900 text-lg mt-2">{result.recommendation}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            { criteria.length > 0 && (
              <CriteriaManager
                criteria={criteria}
                setCriteria={setCriteria}
                isInteractionDisabled={isLoading || isUpdating}
              />
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
          {analysisStep === 'done' && (
            <CardFooter>
              <Button onClick={clearSession} variant="secondary" className="w-full font-bold text-lg py-6" disabled={isUpdating}>
                <Eraser className="h-5 w-5 mr-2" />
                Recommencer une nouvelle analyse
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default DecisionMaker;
