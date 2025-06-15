
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Eraser } from 'lucide-react';
import { CriteriaManager } from '../CriteriaManager';
import { ICriterion, IResult } from '@/types/decision';

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
    return (
        <Card className="mt-8 backdrop-blur-sm animate-fade-in">
            <CardHeader>
                <CardTitle className="text-2xl flex items-start gap-3">
                    <Lightbulb className="text-yellow-400 h-7 w-7 shrink-0" />
                    <span>{dilemma}</span>
                </CardTitle>
                <Badge className="w-fit bg-cyan-500 text-slate-900 text-lg mt-2">{result.recommendation}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                {criteria.length > 0 && (
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
            <CardFooter>
                <Button onClick={clearSession} variant="secondary" className="w-full font-bold text-lg py-6" disabled={isUpdating}>
                    <Eraser className="h-5 w-5 mr-2" />
                    Recommencer une nouvelle analyse
                </Button>
            </CardFooter>
        </Card>
    );
};

export default AnalysisResult;
