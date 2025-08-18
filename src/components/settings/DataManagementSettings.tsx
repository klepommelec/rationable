
import { Database, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useI18nUI } from '@/contexts/I18nUIContext';

const DataManagementSettings = () => {
  const { toast } = useToast();
  const { t } = useI18nUI();

  const handleClearHistory = () => {
    toast({
      title: t('settings.data.toast.cleared'),
      description: t('settings.data.toast.clearedDesc'),
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('settings.data.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.data.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">{t('settings.data.history.title')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.data.history.desc')}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('settings.data.clearHistory')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementSettings;
