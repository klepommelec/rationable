
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
import { useI18nUI } from '@/contexts/I18nUIContext';

interface ExportMenuProps {
  decisions: IDecision[];
  singleDecision?: IDecision;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ decisions, singleDecision }) => {
  const { t } = useI18nUI();
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
      toast.error(t('export.pdfDialog.toasts.pdfOnlySingle'));
      return;
    }

    setIsExporting(true);
    try {
      const options = customOptions || pdfOptions;
      await exportToPDF(singleDecision, options);
      toast.success(t('export.pdfDialog.toasts.launchSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('export.pdfDialog.toasts.pdfError'));
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
      
      toast.success(t('export.pdfDialog.toasts.jsonSuccess'));
    } catch (error) {
      toast.error(t('export.pdfDialog.toasts.jsonError'));
    }
  };

  const exportToImage = async () => {
    if (!singleDecision) {
      toast.error(t('export.pdfDialog.toasts.imageOnlySingle'));
      return;
    }

    setIsExporting(true);
    try {
      // This would capture the analysis result component
      toast.info(t('export.pdfDialog.toasts.imageDev'));
    } catch (error) {
      toast.error(t('export.pdfDialog.toasts.pdfError'));
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
      toast.success(t('export.pdfDialog.toasts.copySuccess'));
    } catch (error) {
      toast.error(t('export.pdfDialog.toasts.copyError'));
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
            {isExporting ? t('export.menuButton.busy') : t('export.menuButton.idle')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 h-4 w-4" />
              <span>{t('export.menu.pdf')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={handleQuickPDFExport}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{t('export.menu.pdfStandard')}</span>
              </DropdownMenuItem>
              <Dialog open={showPDFOptions} onOpenChange={setShowPDFOptions}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('export.menu.pdfCustom')}</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('export.pdfDialog.title')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-charts">{t('export.pdfDialog.includeCharts')}</Label>
                      <Switch
                        id="include-charts"
                        checked={pdfOptions.includeCharts}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeCharts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-links">{t('export.pdfDialog.includeLinks')}</Label>
                      <Switch
                        id="include-links"
                        checked={pdfOptions.includeLinks}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeLinks: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-breakdown">{t('export.pdfDialog.includeBreakdown')}</Label>
                      <Switch
                        id="include-breakdown"
                        checked={pdfOptions.includeBreakdown}
                        onCheckedChange={(checked) => 
                          setPdfOptions(prev => ({ ...prev, includeBreakdown: checked }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('export.pdfDialog.pageFormat')}</Label>
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
                      <Label>{t('export.pdfDialog.orientation')}</Label>
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
                          <SelectItem value="portrait">{t('export.pdfDialog.orientationPortrait')}</SelectItem>
                          <SelectItem value="landscape">{t('export.pdfDialog.orientationLandscape')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={() => handlePDFExport()} 
                      className="w-full"
                      disabled={isExporting}
                    >
                      {isExporting ? t('export.menuButton.busy') : t('export.pdfDialog.generatePdf')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onClick={exportToImage}>
            <Image className="mr-2 h-4 w-4" />
            <span>{t('export.menu.image')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={exportToJSON}>
            <Download className="mr-2 h-4 w-4" />
            <span>{t('export.menu.json')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={copyToClipboard}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('export.menu.copy')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
