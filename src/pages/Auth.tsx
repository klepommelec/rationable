
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AuthForm from '@/components/AuthForm';
import { Helmet } from 'react-helmet-async';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Connexion - Rationable</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <AuthForm
              onSuccess={handleSuccess}
              defaultTab={defaultTab}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
