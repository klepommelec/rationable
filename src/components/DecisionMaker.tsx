
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Plus, Trash2, Sparkles, LoaderCircle, Lightbulb } from 'lucide-react';

interface IResult {
  recommendation: string;
  breakdown: {
    option: string;
    pros: string[];
    cons: string[];
  }[];
}

const DecisionMaker = () => {
  const [dilemma, setDilemma] = useState('');
  const [criteria, setCriteria] = useState<string[]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [result, setResult] = useState<IResult | null>(null);

  useEffect(() => {
    if (dilemma.trim().length < 5) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleGenerateCriteria();
    }, 1500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dilemma]);

  const handleCriterionChange = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    setCriteria([...criteria, '']);
  };

  const removeCriterion = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  const handleGenerateCriteria = () => {
    if (dilemma.trim() === '') return;
    setIsGeneratingCriteria(true);
    setResult(null);
    // Simulation d'un appel à une IA pour générer des critères
    setTimeout(() => {
      if (dilemma.toLowerCase().includes("framework js")) {
        setCriteria(["Facilité d'apprentissage", "Performance", "Écosystème", "Demande sur le marché"]);
      } else if (dilemma.toLowerCase().includes("vacances")) {
        setCriteria(["Budget", "Météo", "Activités", "Type de séjour"]);
      } else {
        setCriteria(["Coût", "Qualité", "Durabilité"]);
      }
      setIsGeneratingCriteria(false);
    }, 2000);
  };

  const handleAnalyze = () => {
    setIsLoading(true);
    setResult(null);

    // Simulation d'un appel à une IA qui génère les options et l'analyse
    setTimeout(() => {
      let generatedOptions: string[] = [];
      if (dilemma.toLowerCase().includes("framework js")) {
        generatedOptions = ["React", "Vue", "Svelte", "Angular"];
      } else if (dilemma.toLowerCase().includes("vacances")) {
        generatedOptions = ["Plage en Italie", "Randonnée en Suisse", "City-trip à Lisbonne", "Road-trip en Ecosse"];
      } else {
        generatedOptions = ["Option A générée par l'IA", "Option B générée par l'IA", "Option C générée par l'IA"];
      }
      
      const recommendation = generatedOptions[Math.floor(Math.random() * generatedOptions.length)];
      
      const newResult: IResult = {
        recommendation,
        breakdown: generatedOptions.map(option => ({
          option,
          pros: ["C'est une option viable.", "Potentiel de croissance élevé.", "Aligné avec les objectifs à long terme."],
          cons: ["Nécessite un investissement initial.", "Risque de marché modéré."]
        }))
      };

      setResult(newResult);
      setIsLoading(false);
    }, 2500);
  };

  const isAnalyzeDisabled = dilemma.trim() === '' || criteria.filter(c => c.trim() !== '').length < 1 || isLoading || isGeneratingCriteria;

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
              <label className="text-slate-300 font-medium">2. Critères d'évaluation</label>
              {isGeneratingCriteria && (
                  <div className="flex items-center text-xs text-cyan-400">
                    <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                    Génération des critères...
                  </div>
              )}
            </div>

            {criteria.map((criterion, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Critère ${index + 1}`}
                  value={criterion}
                  onChange={(e) => handleCriterionChange(index, e.target.value)}
                  className="bg-slate-800 border-slate-700 focus:ring-cyan-500"
                  disabled={isGeneratingCriteria}
                />
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
