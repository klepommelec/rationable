import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Eraser, Trophy, BookOpen, ShoppingCart, ExternalLink } from 'lucide-react';
import { CriteriaManager } from '../CriteriaManager';
import { ICriterion, IResult } from '@/types/decision';
import { ScoreChart } from './ScoreChart';

interface AnalysisResultProps {
  dilemma: string;
  result: IResult;
  criteria: ICriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<ICriterion[]>>;
  isLoading: boolean;
  isUpdating: boolean;
  clearSession: () => void;
}
const AnalysisResult: React.FC<AnalysisResultProps> = ({
  dilemma,
  result,
  criteria,
  setCriteria,
  isLoading,
  isUpdating,
  clearSession
}) => {
  const averageScore = result.breakdown.length > 0 ? Math.round(result.breakdown.reduce((acc, item) => acc + item.score, 0) / result.breakdown.length) : 0;
  const topOption = result.breakdown.length > 0 ? result.breakdown.reduce((prev, current) => prev.score > current.score ? prev : current) : null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If unsplash fails, show a placeholder
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.onerror = null; // Prevent infinite loops
  };

  return <div className="mt-8 space-y-6 animate-fade-in">
            <Card className="overflow-hidden backdrop-blur-sm bg-card/70">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        <CardHeader className="p-0">
                            <CardTitle className="text-2xl flex items-start gap-3">
                                <Lightbulb className="text-yellow-400 h-8 w-8 shrink-0 mt-1" />
                                <span>{dilemma}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 flex-grow">
                             <p className="text-muted-foreground pb-2">Basé sur votre analyse, voici la meilleure option :</p>
                             <div className="bg-cyan-900/50 border border-cyan-700 p-4 rounded-lg">
                                <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                   <Trophy /> {result.recommendation}
                                </h3>
                             </div>
                             {result.description && <p className="text-muted-foreground mt-4">{result.description}</p>}
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <div className="w-full space-y-4">
                                {result.infoLinks && result.infoLinks.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 text-sm"><BookOpen /> Pour en savoir plus</h4>
                                        <div className="flex flex-col items-start gap-1.5 mt-2">
                                            {result.infoLinks.map((link, i) => (
                                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5">
                                                    {link.title}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {result.shoppingLinks && result.shoppingLinks.length > 0 && (
                                     <div>
                                        <h4 className="font-semibold flex items-center gap-2 text-sm"><ShoppingCart /> Où l'acheter ?</h4>
                                        <div className="flex flex-col items-start gap-1.5 mt-2">
                                            {result.shoppingLinks.map((link, i) => (
                                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5">
                                                    {link.title}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
                        </CardFooter>
                    </div>
                    <div className="relative min-h-[250px] md:min-h-0">
                        {result.imageQuery &&
                            <img 
                                src={`https://source.unsplash.com/800x600/?${encodeURIComponent(result.imageQuery.replace(/ /g, ','))}`} 
                                alt={result.recommendation} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                key={result.imageQuery}
                                onError={handleImageError}
                            />
                        }
                         <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent md:bg-gradient-to-l"></div>
                    </div>
                </div>
            </Card>

            {criteria.length > 0 && <div className="w-full">
                <CriteriaManager criteria={criteria} setCriteria={setCriteria} isInteractionDisabled={isLoading || isUpdating} />
            </div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="h-full ">
                        <CardHeader>
                            <CardTitle>Statistiques Clés</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Options Analysées</span>
                               <span className="font-bold text-xl">{result.breakdown.length}</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Score Moyen</span>
                               <span className="font-bold text-xl">{averageScore}</span>
                           </div>
                           {topOption && <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Meilleur Score</span>
                               <span className="font-bold text-xl">{topOption.score}</span>
                           </div>}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <ScoreChart data={result.breakdown} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Analyse Détaillée des Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {result.breakdown.sort((a, b) => b.score - a.score).map((item, index) => <div key={index} className="p-4 rounded-lg bg-accent border">
                            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
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
                        </div>)}
                </CardContent>
            </Card>

            <Card>
                <CardFooter className="p-0">
                    <Button onClick={clearSession} variant="secondary" className="w-full font-bold text-lg py-6" disabled={isUpdating}>
                        <Eraser className="h-5 w-5 mr-2" />
                        Recommencer une nouvelle analyse
                    </Button>
                </CardFooter>
            </Card>
        </div>;
};
export default AnalysisResult;
