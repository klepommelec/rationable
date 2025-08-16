import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, Shield } from 'lucide-react';
import { AIProviderDashboard } from '@/components/decision-maker/AIProviderDashboard';
import { AIProviderMonitor } from '@/components/decision-maker/AIProviderMonitor';
import { SecurityNotice } from '@/components/SecurityNotice';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <CardTitle>Sécurité</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              À jour
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SecurityNotice />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Dashboard IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiques
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4">
              <AIProviderDashboard />
            </TabsContent>
            <TabsContent value="monitoring" className="mt-4">
              <AIProviderMonitor />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;