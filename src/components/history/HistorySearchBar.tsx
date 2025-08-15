import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Trash2, FileDown, FileText, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { IDecision } from '@/types/decision';
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
import { toast } from "sonner";

interface HistorySearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'date' | 'category';
  setSortBy: (sort: 'date' | 'category') => void;
  categoryCounts: Record<string, number>;
  filteredDecisions: IDecision[];
  onClear: () => void;
}

export const HistorySearchBar: React.FC<HistorySearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categoryCounts,
  filteredDecisions,
  onClear
}) => {
  const exportToPDF = async () => {
    try {
      const dataStr = JSON.stringify(filteredDecisions, null, 2);
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
      const dataStr = JSON.stringify(filteredDecisions, null, 2);
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

  const copyToClipboard = async () => {
    try {
      const textData = filteredDecisions.map(decision => 
        `🤔 ${decision.dilemma}\n✅ ${decision.result.recommendation}\n📅 ${new Date(decision.timestamp).toLocaleString('fr-FR')}\n`
      ).join('\n---\n\n');
      
      await navigator.clipboard.writeText(textData);
      toast.success("Données copiées dans le presse-papiers !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  return (
    <div className="space-y-3">
      {/* Layout mobile : recherche sur toute la largeur, puis boutons sur 2ème niveau */}
      <div className="sm:hidden space-y-3">
        {/* 1er niveau : barre de recherche pleine largeur */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        {/* 2ème niveau : boutons qui prennent chacun la moitié de la largeur */}
        <div className="grid grid-cols-2 gap-2">
          {/* Bouton Filtrer */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                Filtrer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="p-2 space-y-3">
                {/* Sélection de catégorie */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="uncategorized">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Non catégorisées
                          </Badge>
                          <span className="text-muted-foreground">({categoryCounts.uncategorized || 0})</span>
                        </div>
                      </SelectItem>
                      {DEFAULT_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {category.name}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">({categoryCounts[category.id] || 0})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sélection du tri */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trier par</label>
                  <Select value={sortBy} onValueChange={(value: 'date' | 'category') => setSortBy(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">
                        Par date
                      </SelectItem>
                      <SelectItem value="category">
                        Par catégorie
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton Plus d'options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Plus d'options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileDown className="mr-2 h-4 w-4" />
                  <span>Exporter</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tout effacer
                  </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Layout desktop : tout sur la même ligne */}
      <div className="hidden sm:flex gap-2 items-center">
        {/* Barre de recherche avec largeur fixe */}
        <div className="relative" style={{ width: '350px' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Bouton Filtrer */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Filtrer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <div className="p-2 space-y-3">
              {/* Sélection de catégorie */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="uncategorized">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Non catégorisées
                        </Badge>
                        <span className="text-muted-foreground">({categoryCounts.uncategorized || 0})</span>
                      </div>
                    </SelectItem>
                    {DEFAULT_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {category.name}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground">({categoryCounts[category.id] || 0})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sélection du tri */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trier par</label>
                <Select value={sortBy} onValueChange={(value: 'date' | 'category') => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">
                      Par date
                    </SelectItem>
                    <SelectItem value="category">
                      Par catégorie
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bouton Plus d'options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Plus d'options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FileDown className="mr-2 h-4 w-4" />
                <span>Exporter</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
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
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout effacer
                </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};