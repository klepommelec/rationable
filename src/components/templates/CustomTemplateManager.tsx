
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import { toast } from "sonner";
import { ICriterion, IDecisionCategory, DEFAULT_CATEGORIES } from '@/types/decision';

interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  dilemma: string;
  criteria: ICriterion[];
  category: string;
  tags: string[];
  createdAt: number;
  usageCount: number;
}

interface CustomTemplateManagerProps {
  onApplyTemplate: (template: CustomTemplate) => void;
}

export const CustomTemplateManager: React.FC<CustomTemplateManagerProps> = ({
  onApplyTemplate
}) => {
  const [templates, setTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('customDecisionTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<CustomTemplate>>({
    name: '',
    description: '',
    dilemma: '',
    criteria: [],
    category: 'other',
    tags: []
  });
  
  const [newCriterion, setNewCriterion] = useState('');
  const [newTag, setNewTag] = useState('');

  const saveTemplates = (updatedTemplates: CustomTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('customDecisionTemplates', JSON.stringify(updatedTemplates));
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.dilemma || !newTemplate.criteria?.length) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const template: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name!,
      description: newTemplate.description || '',
      dilemma: newTemplate.dilemma!,
      criteria: newTemplate.criteria!,
      category: newTemplate.category || 'other',
      tags: newTemplate.tags || [],
      createdAt: Date.now(),
      usageCount: 0
    };

    const updatedTemplates = [...templates, template];
    saveTemplates(updatedTemplates);
    
    setNewTemplate({
      name: '',
      description: '',
      dilemma: '',
      criteria: [],
      category: 'other',
      tags: []
    });
    setIsCreating(false);
    toast.success("Template créé avec succès !");
  };

  const handleEditTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({ ...template });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !newTemplate.name || !newTemplate.dilemma || !newTemplate.criteria?.length) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const updatedTemplate: CustomTemplate = {
      ...editingTemplate,
      name: newTemplate.name!,
      description: newTemplate.description || '',
      dilemma: newTemplate.dilemma!,
      criteria: newTemplate.criteria!,
      category: newTemplate.category || 'other',
      tags: newTemplate.tags || []
    };

    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id ? updatedTemplate : t
    );
    saveTemplates(updatedTemplates);
    
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      description: '',
      dilemma: '',
      criteria: [],
      category: 'other',
      tags: []
    });
    toast.success("Template mis à jour !");
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
    toast.success("Template supprimé");
  };

  const handleApplyTemplate = (template: CustomTemplate) => {
    const updatedTemplate = {
      ...template,
      usageCount: template.usageCount + 1
    };
    
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? updatedTemplate : t
    );
    saveTemplates(updatedTemplates);
    
    onApplyTemplate(updatedTemplate);
    toast.success(`Template "${template.name}" appliqué !`);
  };

  const addCriterion = () => {
    if (!newCriterion.trim()) return;
    
    const criterion: ICriterion = {
      id: `criterion-${Date.now()}`,
      name: newCriterion.trim()
    };
    
    setNewTemplate(prev => ({
      ...prev,
      criteria: [...(prev.criteria || []), criterion]
    }));
    setNewCriterion('');
  };

  const removeCriterion = (criterionId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      criteria: prev.criteria?.filter(c => c.id !== criterionId) || []
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    setNewTemplate(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tagIndex: number) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== tagIndex) || []
    }));
  };

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || 
           { name: categoryId, emoji: '🤔', color: 'gray' };
  };

  const TemplateForm = ({ 
    isEditing = false, 
    onSave, 
    onCancel 
  }: { 
    isEditing?: boolean;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Nom du template *</Label>
        <Input
          id="template-name"
          placeholder="Ex: Choisir un ordinateur portable"
          value={newTemplate.name || ''}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Description</Label>
        <Textarea
          id="template-description"
          placeholder="Description courte du template..."
          value={newTemplate.description || ''}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-dilemma">Question/Dilemme *</Label>
        <Input
          id="template-dilemma"
          placeholder="Ex: Quel ordinateur portable devrais-je acheter ?"
          value={newTemplate.dilemma || ''}
          onChange={(e) => setNewTemplate(prev => ({ ...prev, dilemma: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select
          value={newTemplate.category}
          onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_CATEGORIES.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Critères d'évaluation *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un critère..."
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
          />
          <Button onClick={addCriterion} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {newTemplate.criteria?.map((criterion) => (
            <Badge key={criterion.id} variant="secondary" className="flex items-center gap-1">
              {criterion.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeCriterion(criterion.id)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button onClick={addTag} size="sm" variant="outline">
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {newTemplate.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mes Templates Personnalisés</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un Template Personnalisé</DialogTitle>
            </DialogHeader>
            <TemplateForm
              onSave={handleCreateTemplate}
              onCancel={() => setIsCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Aucun template personnalisé créé
            </p>
            <p className="text-sm text-muted-foreground">
              Créez vos propres templates pour réutiliser vos types de décisions récurrents
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category);
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {categoryInfo.emoji} {categoryInfo.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Utilisé {template.usageCount} fois
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <p className="text-sm font-medium mb-3 line-clamp-2">
                    {template.dilemma}
                  </p>

                  <div className="text-xs text-muted-foreground mb-3">
                    {template.criteria.length} critères • {template.tags.length} tags
                  </div>

                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1"
                    >
                      Utiliser
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Modifier le Template</DialogTitle>
                        </DialogHeader>
                        <TemplateForm
                          isEditing
                          onSave={handleUpdateTemplate}
                          onCancel={() => setEditingTemplate(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
