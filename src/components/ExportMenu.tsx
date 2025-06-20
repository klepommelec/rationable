
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FileDown, Share2, FileText, Link, Download } from 'lucide-react';
import { toast } from "sonner";
import { IDecision } from '@/types/decision';

interface ExportMenuProps {
  decisions: IDecision[];
  singleDecision?: IDecision;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ decisions, singleDecision }) => {
  const dataToExport = singleDecision ? [singleDecision] : decisions;

  const exportToPDF = async () => {
    try {
      // Pour l'instant, on simule l'export PDF avec un téléchargement JSON
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `decisions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Export réussi ! (format JSON pour le moment)");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const exportToJSON = () => {
    try {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `decisions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Export JSON réussi !");
    } catch (error) {
      toast.error("Erreur lors de l'export JSON");
    }
  };

  const shareLink = async () => {
    if (singleDecision) {
      // Créer un lien partageable pour une décision unique
      const shareData = {
        title: `Analyse de décision: ${singleDecision.dilemma}`,
        text: `Découvrez mon analyse de décision: ${singleDecision.result.recommendation}`,
        url: window.location.href
      };

      try {
        if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
          toast.success("Lien partagé avec succès !");
        } else {
          await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
          toast.success("Lien copié dans le presse-papiers !");
        }
      } catch (error) {
        toast.error("Erreur lors du partage");
      }
    } else {
      toast.info("Fonctionnalité de partage disponible pour les décisions individuelles uniquement");
    }
  };

  const copyToClipboard = async () => {
    try {
      const textData = dataToExport.map(decision => 
        `🤔 ${decision.dilemma}\n✅ ${decision.result.recommendation}\n📅 ${new Date(decision.timestamp).toLocaleString('fr-FR')}\n`
      ).join('\n---\n\n');
      
      await navigator.clipboard.writeText(textData);
      toast.success("Données copiées dans le presse-papiers !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {singleDecision ? <Share2 className="h-4 w-4 mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
          {singleDecision ? "Partager" : "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exporter en PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <Download className="mr-2 h-4 w-4" />
          <span>Exporter en JSON</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Copier le texte</span>
        </DropdownMenuItem>
        {singleDecision && (
          <DropdownMenuItem onClick={shareLink}>
            <Link className="mr-2 h-4 w-4" />
            <span>Partager le lien</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
