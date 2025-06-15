
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, History, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IDecision } from '@/types/decision';

interface DecisionHistoryProps {
  history: IDecision[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({ history, onLoad, onDelete, onClear, onClose }) => {

  const handleLoad = (id: string) => {
    onLoad(id);
    onClose();
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 pt-16">
        <History className="h-16 w-16 mb-4" />
        <h3 className="text-lg font-semibold">Aucun historique</h3>
        <p className="text-sm">Vos décisions analysées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mt-4">
      <div className="flex justify-end items-center px-1 mb-4">
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Tout effacer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible et supprimera tout votre historique de décisions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onClear}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {history.map(decision => (
            <div key={decision.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-300 truncate max-w-xs">{decision.dilemma}</p>
                <p className="text-xs text-slate-500">{new Date(decision.timestamp).toLocaleString('fr-FR')}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleLoad(decision.id)} className="border-slate-600">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Charger
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(decision.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
