
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { DEFAULT_CATEGORIES } from '@/types/decision';

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags: string[];
    like_count?: number;
    author_name?: string;
  };
  onOpen: (template: any) => void;
}

const TemplateCard = ({ template, onOpen }: TemplateCardProps) => {
  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(cat => cat.id === categoryId) || { name: categoryId, emoji: '🤔' };
  };

  const categoryInfo = getCategoryInfo(template.category || 'other');

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          {template.like_count !== undefined && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {template.like_count}
              </span>
            </div>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpen(template)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ouvrir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
