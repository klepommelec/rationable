
import React from 'react';
import { User, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplateCard from './TemplateCard';
import { PERSONAL_TEMPLATES, PROFESSIONAL_TEMPLATES } from '@/data/predefinedTemplates';

interface TemplateGridProps {
  templates: any[];
  showPredefined: boolean;
  filteredPersonalTemplates: any[];
  filteredProfessionalTemplates: any[];
  onOpenTemplate: (template: any) => void;
  onResetFilters: () => void;
}

const TemplateGrid = ({
  templates,
  showPredefined,
  filteredPersonalTemplates,
  filteredProfessionalTemplates,
  onOpenTemplate,
  onResetFilters
}: TemplateGridProps) => {
  if (showPredefined) {
    return (
      <div className="space-y-8">
        {/* Templates personnels */}
        {filteredPersonalTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Usage Personnel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonalTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpen={onOpenTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Templates professionnels */}
        {filteredProfessionalTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Usage Professionnel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionalTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpen={onOpenTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {filteredPersonalTemplates.length === 0 && filteredProfessionalTemplates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg mb-4">
                Aucun template trouvé pour vos critères de recherche.
              </p>
              <Button onClick={onResetFilters}>
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground text-lg mb-4">
            Aucun template trouvé pour vos critères de recherche.
          </p>
          <Button onClick={onResetFilters}>
            Réinitialiser les filtres
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onOpen={onOpenTemplate}
        />
      ))}
    </div>
  );
};

export default TemplateGrid;
