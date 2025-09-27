import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, TrendingUp, RefreshCw, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateMonthlyTemplates, rotateMonthlyTemplates, getCurrentMonthKey } from '@/services/monthlyTemplatesService';

interface MonthlyTemplate {
  id: string;
  month_key: string;
  context: string;
  language: string;
  prompt: string;
  is_active: boolean;
  generated_at: string;
  news_sources?: Array<{ source: string; category: string }>;
}

const MonthlyTemplatesSettings: React.FC = () => {
  const [templates, setTemplates] = useState<MonthlyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rotating, setRotating] = useState(false);
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monthly_templates')
        .select('*')
        .order('month_key', { ascending: false })
        .order('context', { ascending: true })
        .order('language', { ascending: true });

      if (error) throw error;
      setTemplates((data || []).map(template => ({
        ...template,
        news_sources: template.news_sources as Array<{ source: string; category: string }> || []
      })));
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleGenerateTemplates = async () => {
    try {
      setGenerating(true);
      const success = await generateMonthlyTemplates();
      
      if (success) {
        toast({
          title: "Succès",
          description: "Templates générés avec succès",
        });
        await loadTemplates();
      } else {
        throw new Error('Échec de la génération');
      }
    } catch (error) {
      console.error('Error generating templates:', error);
      toast({
        title: "Erreur",
        description: "Échec de la génération des templates",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRotateTemplates = async () => {
    try {
      setRotating(true);
      const currentMonth = getCurrentMonthKey();
      const success = await rotateMonthlyTemplates(currentMonth);
      
      if (success) {
        toast({
          title: "Succès", 
          description: `Templates activés pour ${currentMonth}`,
        });
        await loadTemplates();
      } else {
        throw new Error('Échec de la rotation');
      }
    } catch (error) {
      console.error('Error rotating templates:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'activation des templates",
        variant: "destructive"
      });
    } finally {
      setRotating(false);
    }
  };

  const currentMonth = getCurrentMonthKey();
  const activeTemplates = templates.filter(t => t.is_active);
  const currentMonthTemplates = templates.filter(t => t.month_key === currentMonth);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Templates Mensuels Automatisés
          </CardTitle>
          <CardDescription>
            Gestion des templates basés sur l'actualité, générés automatiquement chaque mois
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Mois actuel: {currentMonth}</span>
              <Badge variant={activeTemplates.length > 0 ? "default" : "secondary"}>
                {activeTemplates.length} templates actifs
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateTemplates}
                disabled={generating}
                size="sm"
                variant="outline"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Générer Templates
              </Button>
              <Button
                onClick={handleRotateTemplates}
                disabled={rotating || currentMonthTemplates.length === 0}
                size="sm"
              >
                {rotating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Activer pour {currentMonth}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                templates.reduce((acc, template) => {
                  if (!acc[template.month_key]) acc[template.month_key] = [];
                  acc[template.month_key].push(template);
                  return acc;
                }, {} as Record<string, MonthlyTemplate[]>)
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([monthKey, monthTemplates]) => (
                  <div key={monthKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        {monthKey}
                        {monthTemplates.some(t => t.is_active) && (
                          <Badge variant="default">Actif</Badge>
                        )}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {monthTemplates.length} templates
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {monthTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className={`p-3 rounded border ${
                            template.is_active ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {template.context}
                            </Badge>
                            <Badge variant="outline">
                              {template.language.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm">{template.prompt}</p>
                          {template.news_sources && template.news_sources.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.news_sources.slice(0, 2).map((source, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {source.category}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planification Automatique</CardTitle>
          <CardDescription>
            Les templates sont générés automatiquement le 1er de chaque mois via un cron job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Génération: 1er du mois à 00:01 UTC</p>
            <p>• Activation: 1er du mois à 00:11 UTC</p>
            <p>• Sources: Actualités FR/EN via Perplexity + IA Claude</p>
            <p>• Contextes: Personnel et Professionnel</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyTemplatesSettings;