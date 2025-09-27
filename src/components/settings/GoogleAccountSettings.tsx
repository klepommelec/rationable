import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link, Unlink, MoreHorizontal } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const GoogleAccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const { user, linkWithGoogle, unlinkGoogle } = useAuth();
  const { t } = useI18nUI();
  const { toast } = useToast();

  // Check if user has Google identity linked
  const hasGoogleLinked = user?.identities?.some(identity => identity.provider === 'google') ?? false;
  
  // Get Google identity info
  const googleIdentity = user?.identities?.find(identity => identity.provider === 'google');

  const handleLinkGoogle = async () => {
    setLoading(true);
    
    const { error } = await linkWithGoogle();
    
    if (error) {
      toast({
        title: t('profile.googleAccount.toasts.connectError'),
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: t('profile.googleAccount.toasts.connectSuccess'),
        description: t('profile.googleAccount.toasts.connectSuccess')
      });
    }
    
    setLoading(false);
  };

  const handleUnlinkGoogle = async () => {
    setUnlinkLoading(true);
    
    const { error } = await unlinkGoogle();
    
    if (error) {
      toast({
        title: t('profile.googleAccount.toasts.disconnectError'),
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: t('profile.googleAccount.toasts.disconnectSuccess'),
        description: t('profile.googleAccount.toasts.disconnectSuccess')
      });
    }
    
    setUnlinkLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('profile.googleAccount.title')}
        </CardTitle>
        <CardDescription>
          {t('profile.googleAccount.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasGoogleLinked ? (
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Logo Google */}
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                
                {/* Informations du compte */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {googleIdentity?.email || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gmail • {t('profile.googleAccount.lastActivity')}
                  </p>
                </div>
              </div>
              
              {/* Menu d'actions */}
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {t('profile.googleAccount.connected')}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleUnlinkGoogle}
                      disabled={unlinkLoading}
                      className="text-destructive focus:text-destructive"
                    >
                      {unlinkLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Unlink className="mr-2 h-4 w-4" />
                      )}
                      {t('profile.googleAccount.disconnectAccount')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t('profile.googleAccount.notConnected')}
            </p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleLinkGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center sm:w-auto"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t('auth.actions.linkGoogle')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAccountSettings;