
import React from 'react';
import { User, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TemplateCard from './TemplateCard';

interface TemplateGridProps {
  templates: any[];
  showPredefined: boolean;
  filteredPersonalTemplates: any[];
  filteredProfessionalTemplates: any[];
  onOpenTemplate: (template: any) => void;
  onResetFilters: () => void;
  userContext: 'personal' | 'professional';
}

const TemplateGrid = ({
  templates,
  showPredefined,
  filteredPersonalTemplates,
  filteredProfessionalTemplates,
  onOpenTemplate,
  onResetFilters,
  userContext
}: TemplateGridProps) => {
  if (showPredefined) {
    // Afficher les templates dans l'ordre basé sur le contexte utilisateur
    const isPersonalContext = userContext === 'personal';
    const primaryTemplates = isPersonalContext ? filteredPersonalTemplates : filteredProfessionalTemplates;
    const secondaryTemplates = isPersonalContext ? filteredProfessionalTemplates : filteredPersonalTemplates;
    const primaryIcon = isPersonalContext ? User : Briefcase;
    const secondaryIcon = isPersonalContext ? Briefcase : User;
    const primaryTitle = isPersonalContext ? "Usage Personnel" : "Usage Professionnel";
    const secondaryTitle = isPersonalContext ? "Usage Professionnel" : "Usage Personnel";
    const primaryColor = isPersonalContext ? "text-blue-600" : "text-green-600";
    const secondaryColor = isPersonalContext ? "text-green-600" : "text-blue-600";

    return (
      <div className="space-y-8">
        {/* Templates principaux (basés sur le contexte utilisateur) */}
        {primaryTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              {React.createElement(primaryIcon, { className: `h-5 w-5 ${primaryColor}` })}
              <h2 className="text-xl font-semibold">{primaryTitle}</h2>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                Recommandé pour vous
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {primaryTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpen={onOpenTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Templates secondaires */}
        {secondaryTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              {React.createElement(secondaryIcon, { className: `h-5 w-5 ${secondaryColor}` })}
              <h2 className="text-xl font-semibold">{secondaryTitle}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryTemplates.map((template) => (
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
