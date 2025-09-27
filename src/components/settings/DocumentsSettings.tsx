import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Search,
  Plus,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  workspace_id: string;
  user_id: string;
  created_at: string;
  description?: string;
  tags?: string[];
}

const DocumentsSettings: React.FC = () => {
  const { t } = useI18nUI();
  const { currentWorkspace } = useWorkspaces();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Types de fichiers supportés
  const supportedTypes = {
    'application/pdf': { icon: FileText, color: 'text-red-500' },
    'image/jpeg': { icon: Image, color: 'text-blue-500' },
    'image/png': { icon: Image, color: 'text-blue-500' },
    'image/gif': { icon: Image, color: 'text-blue-500' },
    'image/webp': { icon: Image, color: 'text-blue-500' },
    'text/plain': { icon: FileText, color: 'text-gray-500' },
    'application/msword': { icon: FileText, color: 'text-blue-600' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-600' },
    'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-600' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-600' },
    'video/mp4': { icon: FileVideo, color: 'text-purple-500' },
    'video/webm': { icon: FileVideo, color: 'text-purple-500' },
    'audio/mp3': { icon: FileAudio, color: 'text-orange-500' },
    'audio/wav': { icon: FileAudio, color: 'text-orange-500' },
    'application/zip': { icon: Archive, color: 'text-yellow-500' },
    'application/x-rar-compressed': { icon: Archive, color: 'text-yellow-500' }
  };

  const getFileIcon = (type: string) => {
    const fileType = supportedTypes[type as keyof typeof supportedTypes];
    if (fileType) {
      const IconComponent = fileType.icon;
      return <IconComponent className={`h-5 w-5 ${fileType.color}`} />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList) => {
    if (!currentWorkspace || !user) {
      toast.error(t('settings.documents.noWorkspaceSelectedError'));
      return;
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        }

        // Générer un nom unique pour le fichier
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `workspaces/${currentWorkspace.id}/documents/${fileName}`;

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Sauvegarder les métadonnées en base
        const { data: insertData, error: insertError } = await supabase
          .from('workspace_documents')
          .insert({
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            workspace_id: currentWorkspace.id,
            user_id: user.id,
            description: '',
            tags: []
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return insertData;
      } catch (error) {
        console.error('Erreur upload:', error);
        toast.error(`Erreur lors de l'upload de ${file.name}: ${error.message}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result !== null);
    
    if (successfulUploads.length > 0) {
      setDocuments(prev => [...prev, ...successfulUploads]);
      toast.success(`${successfulUploads.length} ${t('settings.documents.uploadSuccess')}`);
    }

    setUploading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;

      // Supprimer le fichier du storage
      const filePath = document.url.split('/').slice(-2).join('/');
      await supabase.storage
        .from('documents')
        .remove([filePath]);

      // Supprimer de la base de données
      const { error } = await supabase
        .from('workspace_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success(t('settings.documents.deleteSuccess'));
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => doc.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags || [])));

  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t('settings.documents.management')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.documents.managementDescription')}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('settings.documents.noWorkspaceSelected')}
              </h3>
              <p className="text-muted-foreground">
                Veuillez sélectionner un workspace pour gérer ses documents
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('settings.documents.management')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.documents.managementDescription')} "{currentWorkspace.name}"
          </p>
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? t('settings.documents.uploading') : t('settings.documents.addDocuments')}
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('settings.documents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('settings.documents.documents')} ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {documents.length === 0 ? t('settings.documents.noDocument') : t('settings.documents.noResult')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {documents.length === 0 
                  ? t('settings.documents.addDocumentsDescription')
                  : 'Aucun document ne correspond à votre recherche'
                }
              </p>
              {documents.length === 0 && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('settings.documents.addFirstDocument')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(document.type)}
                    <div>
                      <h4 className="font-medium">{document.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(document.size)}</span>
                        <span>•</span>
                        <span>{new Date(document.created_at).toLocaleDateString('fr-FR')}</span>
                        {document.tags && document.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1">
                              {document.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = document.url;
                        link.download = document.name;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.mp4,.webm,.mp3,.wav,.zip,.rar"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default DocumentsSettings;

