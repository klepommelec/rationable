
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lightbulb, Target, TrendingUp, User, Building } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [useContext, setUseContext] = useState<'personal' | 'professional'>('personal');
  const { profile, updateProfile } = useAuth();
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    await updateProfile({ 
      full_name: fullName || profile?.full_name || '',
      use_context: useContext,
      onboarding_completed: true 
    });
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" 
              alt="Rationable Logo" 
              className="h-10 w-10" 
            />
            <span className="font-bold text-2xl">Rationable</span>
          </div>
          <Progress value={progressPercentage} className="w-full mb-4" />
          <CardDescription>Étape {currentStep} sur {totalSteps}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Lightbulb className="h-16 w-16 mx-auto text-primary" />
                <CardTitle className="text-2xl">Bienvenue sur Rationable !</CardTitle>
                <CardDescription className="text-lg">
                  Votre assistant IA personnel pour prendre des décisions éclairées et structurées.
                </CardDescription>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Structurez vos dilemmes</h3>
                  <p className="text-sm text-muted-foreground">
                    Transformez vos questionnements en analyses structurées
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Comparez vos options</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualisez et comparez vos choix selon vos critères
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold">Décidez sereinement</h3>
                  <p className="text-sm text-muted-foreground">
                    Prenez des décisions basées sur une analyse objective
                  </p>
                </div>
              </div>
              
              <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
                Commencer
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <CardTitle className="text-2xl">Comment utiliserez-vous Rationable ?</CardTitle>
              <CardDescription>
                Choisissez votre contexte d'utilisation principal pour une expérience personnalisée.
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    useContext === 'personal' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setUseContext('personal')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Usage Personnel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Décisions personnelles comme choisir un smartphone, une destination de vacances, ou des investissements personnels.
                  </p>
                </div>
                
                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    useContext === 'professional' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setUseContext('professional')}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Building className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-foreground">Usage Professionnel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Décisions d'entreprise comme choisir une stack technique, une stratégie marketing, ou des partenaires.
                  </p>
                </div>
              </div>
              
              <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
                Continuer
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <CardTitle className="text-2xl">Personnalisons votre profil</CardTitle>
              <CardDescription>
                Comment souhaitez-vous être appelé ?
              </CardDescription>
              
              <div className="max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Votre nom ou prénom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
              
              <Button onClick={handleNext} size="lg" className="w-full md:w-auto">
                Continuer
              </Button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <CardTitle className="text-2xl">Tout est prêt !</CardTitle>
              <CardDescription className="text-lg">
                {fullName && `Bienvenue ${fullName} ! `}
                Vous pouvez maintenant commencer à utiliser Rationable pour vos prises de décision.
              </CardDescription>
              
              <div className="p-4 bg-muted rounded-lg text-left">
                <h4 className="font-semibold mb-2">Pour commencer :</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Décrivez votre dilemme en quelques mots</li>
                  <li>• L'IA identifiera automatiquement vos critères</li>
                  <li>• Ajustez et personnalisez selon vos besoins</li>
                  <li>• Obtenez une analyse détaillée et des recommandations</li>
                </ul>
              </div>
              
              <Button onClick={handleFinish} size="lg" className="w-full md:w-auto">
                Commencer à utiliser Rationable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
