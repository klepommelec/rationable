import { useState } from 'react';
import { Upload, FileText, Search, Tag, MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDropzone } from 'react-dropzone';
import { useWorkspaceDocuments, WorkspaceDocument } from '@/hooks/useWorkspaceDocuments';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentsSettingsProps {
  workspaceId: string;
}

const DocumentsSettings = ({ workspaceId }: DocumentsSettingsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<WorkspaceDocument | null>(null);
  
  const { 
    documents, 
    loading, 
    uploading, 
    uploadDocument, 
    deleteDocument, 
    updateDocumentUsage 
  } = useWorkspaceDocuments(workspaceId);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        await uploadDocument(file);
      }
    }
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(documents.map(doc => doc.category).filter(Boolean))];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentView = async (document: WorkspaceDocument) => {
    await updateDocumentUsage(document.id);
    window.open(document.file_url, '_blank');
  };

  const handleDocumentDownload = async (document: WorkspaceDocument) => {
    await updateDocumentUsage(document.id);
    const link = window.document.createElement('a');
    link.href = document.file_url;
    link.download = document.file_name;
    link.click();
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await deleteDocument(documentToDelete.id);
      setDocumentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Documents du workspace</h3>
        <p className="text-sm text-muted-foreground">
          Gérez les documents qui seront utilisés par l'IA pour enrichir les analyses de décision.
        </p>
      </div>

      {/* Zone de téléchargement */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="text-lg font-medium mb-2">
              {isDragActive ? 'Déposez vos fichiers ici' : 'Télécharger des documents'}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Formats supportés: PDF, Word, Excel, CSV, TXT
            </p>
            <Button disabled={uploading}>
              {uploading ? 'Téléchargement...' : 'Parcourir les fichiers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              {selectedCategory || 'Toutes les catégories'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
              Toutes les catégories
            </DropdownMenuItem>
            {categories.map(category => (
              <DropdownMenuItem
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Liste des documents */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement des documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">Aucun document</h4>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory 
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Commencez par télécharger des documents pour enrichir les analyses de l\'IA.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{document.file_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>•</span>
                        <span>
                          Ajouté {formatDistanceToNow(new Date(document.uploaded_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                        {document.usage_count > 0 && (
                          <>
                            <span>•</span>
                            <span>Utilisé {document.usage_count} fois</span>
                          </>
                        )}
                      </div>
                      {document.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {document.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDocumentView(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualiser
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDocumentDownload(document)}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </DropdownMenuItem>
                      <Separator />
                      <DropdownMenuItem 
                        onClick={() => setDocumentToDelete(document)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{documentToDelete?.file_name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentsSettings;