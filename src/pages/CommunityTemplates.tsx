
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Search, Filter } from "lucide-react";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { CommunityTemplate, getCommunityTemplates, copyTemplate } from '@/services/communityTemplateService';
import { useDecisionMaker } from '@/hooks/useDecisionMaker';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const CommunityTemplates = () => {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_copied'>('newest');
  const [copying, setCopying] = useState<string | null>(null);
  
  const { setDilemma, setCriteria, setEmoji, setSelectedCategory, clearSession } = useDecisionMaker();
  const navigate = useNavigate();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getCommunityTemplates({
        search: search || undefined,
        category: categoryFilter || undefined,
        sortBy,
        limit: 50,
      });
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [search, categoryFilter, sortBy]);

  const handleCopyTemplate = async (template: CommunityTemplate) => {
    setCopying(template.id);
    try {
      // Copy the template data to the decision maker
      clearSession();
      setDilemma(template.decision_data.dilemma);
      setCriteria(template.decision_data.criteria);
      setEmoji(template.decision_data.emoji);
      setSelectedCategory(template.decision_data.category);
      
      // Increment copy count
      await copyTemplate(template.id);
      
      toast.success(`Template "${template.title}" copié ! Vous pouvez maintenant le personnaliser.`);
      navigate('/');
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error("Erreur lors de la copie du template");
    } finally {
      setCopying(null);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || { name: categoryId, emoji: '🤔' };
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'popular': return 'Plus populaires';
      case 'most_copied': return 'Plus copiés';
      case 'newest': default: return 'Plus récents';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Templates Communautaires</h1>
        <p className="text-muted-foreground">
          Découvrez et utilisez des templates créés par la communauté pour vous aider dans vos décisions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les catégories</SelectItem>
            {DEFAULT_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents</SelectItem>
            <SelectItem value="popular">Plus populaires</SelectItem>
            <SelectItem value="most_copied">Plus copiés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground text-lg mb-4">
              Aucun template trouvé pour vos critères de recherche.
            </p>
            <Button onClick={() => { setSearch(''); setCategoryFilter(''); }}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category || 'other');
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {categoryInfo.emoji} {categoryInfo.name}
                        </Badge>
                        {template.author_name && (
                          <span className="text-sm text-muted-foreground">
                            par {template.author_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {template.description}
                    </p>
                  )}
                  
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        {template.copy_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {template.like_count}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleCopyTemplate(template)}
                      disabled={copying === template.id}
                    >
                      {copying === template.id ? (
                        <>Copie...</>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </>
                      )}
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

export default CommunityTemplates;
