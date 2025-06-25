
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileText, Download, Settings, Image } from 'lucide-react';
import { toast } from "sonner";
import { IDecision } from '@/types/decision';
import { exportToPDF, PDFExportOptions } from '@/services/pdfExportService';
import ShareButton from './ShareButton';

interface ExportMenuProps {
  decisions: IDecision[];
  singleDecision?: IDecision;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ decisions, singleDecision }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptions>({
    includeCharts: true,
    includeLinks: true,
    includeBreakdown: true,
    format: 'A4',
    orientation: 'portrait'
  });

  const dataToExport = singleDecision ? [singleDecision] : decisions;

  const handlePDFExport = async (customOptions?: PDFExportOptions) => {
    if (!singleDecision) {
      toast.error("L'export PDF n'est disponible que pour une décision individuelle");
      return;
    }

    setIsExporting(true);
    try {
      const options = customOptions || pdfOptions;
      await exportToPDF(singleDecision, options);
      toast.success("Export PDF lancé !");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setIsExporting(false);
      setShowPDFOptions(false);
    }
  };

  const handleQuickPDFExport = () => {
    handlePDFExport({
      includeCharts: true,
      includeLinks: true,
      includeBreakdown: true,
      format: 'A4',
      orientation: 'portrait'
    });
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

  const exportToImage = async () => {
    if (!singleDecision) {
      toast.error("L'export image n'est disponible que pour une décision individuelle");
      return;
    }

    setIsExporting(true);
    try {
      // This would capture the analysis result component
      toast.info("Fonctionnalité d'export image en développement");
    } catch (error) {
      toast.error("Erreur lors de l'export image");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textData = dataToExport.map(decision => 
        `🤔 ${decision.dilemma}\n✅ ${decision.result.recommendation}\n📝 ${decision.result.description}\n📅 ${new Date(decision.timestamp).toLocaleString('fr-FR')}\n`
      ).join('\n---\n\n');
      
      await navigator.clipboard.writeText(textData);
      toast.success("Données copiées dans le presse-papiers !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  return (
    <div className="flex gap-2">
      {singleDecision && (
        <ShareButton decision={singleDecision} />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <FileDown className="h-4 w-4 mr-2" />
            {isExporting ? 'Export...' : 'Exporter'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export PDF</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={handleQuickPDFExport}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF Standard</span>
              </DropdownMenuItem>
              <Dialog open={showPDFOptions} onOpenChange={setShowPDFOptions}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>PDF Personnalisé</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Options d'export PDF</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-charts">Inclure les graphiques</Label>
                      <Switch
                        id="include-charts"
                        checked={pdfOptions.includeCharts}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeCharts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-links">Inclure les liens</Label>
                      <Switch
                        id="include-links"
                        checked={pdfOptions.includeLinks}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeLinks: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-breakdown">Inclure l'analyse détaillée</Label>
                      <Switch
                        id="include-breakdown"
                        checked={pdfOptions.includeBreakdown}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeBreakdown: checked }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format de page</Label>
                      <Select
                        value={pdfOptions.format}
                        onValueChange={(value: 'A4' | 'Letter') => 
                          setPdfOptions(prev => ({ ...prev, format: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Orientation</Label>
                      <Select
                        value={pdfOptions.orientation}
                        onValueChange={(value: 'portrait' | 'landscape') => 
                          setPdfOptions(prev => ({ ...prev, orientation: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Paysage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => handlePDFExport()} 
                      className="w-full"
                      disabled={isExporting}
                    >
                      {isExporting ? 'Export en cours...' : 'Générer PDF'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onClick={exportToImage}>
            <Image className="mr-2 h-4 w-4" />
            <span>Export Image</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportToJSON}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export JSON</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyToClipboard}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Copier le texte</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
