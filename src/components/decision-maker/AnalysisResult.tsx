
import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eraser, Trophy, BookOpen, ShoppingCart, ExternalLink } from 'lucide-react';
import { CriteriaManager } from '../CriteriaManager';
import { ICriterion, IResult } from '@/types/decision';
import { ScoreChart } from './ScoreChart';
import { Skeleton } from '@/components/ui/skeleton';
import { CriteriaSkeleton } from '../CriteriaSkeleton';


interface AnalysisResultProps {
  result: IResult | null;
  criteria: ICriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<ICriterion[]>>;
  isLoading: boolean;
  isUpdating: boolean;
  clearSession: () => void;
  analysisStep: 'idle' | 'analyzing' | 'done';
}
const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  criteria,
  setCriteria,
  isLoading,
  isUpdating,
  clearSession,
  analysisStep
}) => {
  if (analysisStep === 'analyzing' || !result) {
    return (
        <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden backdrop-blur-sm bg-card/70">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        <CardContent className="p-0 flex-grow space-y-4">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Skeleton className="h-10 w-1/2" />
                        </CardFooter>
                    </div>
                    <div className="relative min-h-[250px] md:min-h-0 bg-muted"></div>
                </div>
            </Card>

            <CriteriaSkeleton />

            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg bg-accent border space-y-3">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-6 w-1/4" />
                            </div>
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="h-full ">
                        <CardHeader>
                            <Skeleton className="h-7 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                           <Skeleton className="h-6 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <Skeleton className="h-7 w-2/3" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="w-full h-[250px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardFooter className="p-0">
                    <Skeleton className="h-16 w-full rounded-md" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  const averageScore = result.breakdown.length > 0 ? Math.round(result.breakdown.reduce((acc, item) => acc + item.score, 0) / result.breakdown.length) : 0;
  const topOption = result.breakdown.length > 0 ? result.breakdown.reduce((prev, current) => prev.score > current.score ? prev : current) : null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If unsplash fails, show a placeholder
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.onerror = null; // Prevent infinite loops
  };

  let imageSrc: string = '/placeholder.svg';
  if (result.imageQuery) {
    // Format query for Unsplash: use commas, no extra spaces
    const query = result.imageQuery.replace(/ /g, ',').replace(/,,+/g, ',').trim();
    console.log(`[AnalysisResult] Attempting to fetch image with query: "${query}"`);
    imageSrc = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
  } else if (result.imageBase64) {
    // Fallback for old history items
    imageSrc = `data:image/png;base64,${result.imageBase64}`;
  }

  return <div className="space-y-6 animate-fade-in">
            <Card className="overflow-hidden backdrop-blur-sm bg-card/70">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 flex flex-col">
                        <CardContent className="p-0 flex-grow">
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
                        {imageSrc ? (
                            <img 
                                src={imageSrc} 
                                alt={result.recommendation} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                key={imageSrc}
                                onError={handleImageError}
                            />
                        ) : (
                           <div className="absolute inset-0 w-full h-full bg-secondary flex items-center justify-center">
                                <img src="/placeholder.svg" alt="Placeholder" className="h-24 w-24 opacity-50" />
                           </div>
                        )}
                         <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent md:bg-gradient-to-l"></div>
                    </div>
                </div>
            </Card>

            {criteria.length > 0 && <div className="w-full">
                <CriteriaManager criteria={criteria} setCriteria={setCriteria} isInteractionDisabled={isLoading || isUpdating} />
            </div>}

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
