import React from 'react';
import { IBreakdownItem } from '@/types/decision';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
  resultType?: 'factual' | 'comparative' | 'simple-choice';
}
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma,
  resultType = 'comparative'
}) => {
  if (!breakdown || breakdown.length === 0) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>Aucune donnée disponible pour le tableau comparatif</p>
      </div>;
  }

  // Pour les questions factuelles, ne pas afficher le tableau comparatif
  // car il n'y a qu'une seule réponse
  if (resultType === 'factual') {
    return null;
  }

  // Pour les questions de choix, trier par score décroissant
  const sortedOptions = [...breakdown].sort((a, b) => b.score - a.score);

  // Vérifier qu'on a bien plusieurs options pour justifier un tableau
  if (sortedOptions.length < 2) {
    console.warn(`⚠️ Only ${sortedOptions.length} option(s) found for comparison table (expected 3-5 for ${resultType} questions)`);
    return <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>Pas assez d'options pour un tableau comparatif (attendu: 3-5 options)</p>
      </div>;
  }
  return <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Option</TableHead>
              <TableHead>Avantages</TableHead>
              <TableHead>Inconvénients</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOptions.map((option, index) => <TableRow key={index} className={index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}>
                <TableCell className="font-medium align-top">
                  <div className="flex flex-col gap-2">
                    {index === 0 && <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-fit">
                        Recommandé
                      </Badge>}
                    <span className="text-sm">
                      {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                    </span>
                    <Badge variant="outline" className={`font-mono w-fit ${option.score >= 80 ? 'border-green-500 text-green-700 dark:text-green-300' : option.score >= 60 ? 'border-yellow-500 text-yellow-700 dark:text-yellow-300' : 'border-red-500 text-red-700 dark:text-red-300'}`}>
                      {option.score}/100
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1">
                    {option.pros?.slice(0, 3).map((pro, proIndex) => <div key={proIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{pro}</span>
                      </div>)}
                    {option.pros?.length > 3 && <p className="text-xs text-muted-foreground italic">
                        +{option.pros.length - 3} autres avantages
                      </p>}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-1">
                    {option.cons?.slice(0, 3).map((con, conIndex) => <div key={conIndex} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{con}</span>
                      </div>)}
                    {option.cons?.length > 3 && <p className="text-xs text-muted-foreground italic">
                        +{option.cons.length - 3} autres inconvénients
                      </p>}
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Tableau comparatif des {sortedOptions.length} options analysées
      </div>
    </div>;
};