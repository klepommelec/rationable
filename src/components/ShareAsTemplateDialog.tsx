
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { IDecision, DEFAULT_CATEGORIES } from '@/types/decision';
import { shareAsTemplate } from '@/services/communityTemplateService';
import { toast } from "sonner";

interface ShareAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: IDecision;
}

const ShareAsTemplateDialog: React.FC<ShareAsTemplateDialogProps> = ({ 
  open, 
  onOpenChange, 
  decision 
}) => {
  const [title, setTitle] = useState(decision.dilemma);
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState(decision.category || '');
  const [tags, setTags] = useState<string[]>(decision.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    setIsSubmitting(true);
    try {
      const publicId = await shareAsTemplate({
        title: title.trim(),
        description: description.trim() || undefined,
        author_name: authorName.trim() || undefined,
        decision_data: decision,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success("Template partagé avec succès ! Il sera visible après modération.");
      onOpenChange(false);
      
      // Reset form
      setTitle(decision.dilemma);
      setDescription('');
      setAuthorName('');
      setCategory(decision.category || '');
      setTags(decision.tags || []);
    } catch (error) {
      console.error('Error sharing template:', error);
      toast.error("Erreur lors du partage du template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Partager comme template communautaire</DialogTitle>
          <DialogDescription>
            Partagez votre décision avec la communauté pour aider d'autres utilisateurs.
            Votre template sera examiné avant publication.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre descriptif du template..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement ce template et quand l'utiliser..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="author">Nom d'auteur (optionnel)</Label>
            <Input
              id="author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Votre nom ou pseudo (ou laissez vide pour rester anonyme)"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Partage en cours..." : "Partager"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAsTemplateDialog;
