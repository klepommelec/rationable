import { Users, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useDecisionMakerContext } from '@/contexts/DecisionMakerContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { useI18nUI } from '@/contexts/I18nUIContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18nUI();
  const {
    user,
    profile,
    signOut
  } = useAuth();
  
  const {
    result,
    dilemma,
    analysisStep,
    getCurrentDecision,
    clearSession
  } = useDecisionMakerContext();
  
  // Détection d'une décision active (seulement si analyse démarrée)
  const hasActiveDecision = location.pathname === '/' && user && (
    result !== null || analysisStep !== 'idle'
  );
  
  // Créer l'objet currentDecision pour ShareButton
  const currentDecision = hasActiveDecision ? (
    getCurrentDecision() || {
      id: 'temp-decision',
      timestamp: Date.now(),
      dilemma: dilemma || 'Décision en cours',
      emoji: '🤔',
      criteria: [],
      result: result!
    }
  ) : null;

  // Check if we're on the settings page
  const isSettingsPage = location.pathname === '/settings';
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleSignOut = async () => {
    await signOut();
  };
  const getUserDisplayName = () => {
    const fullName = profile?.full_name || user?.email?.split('@')[0] || t('navbar.userFallback');
    // Extraire seulement le prénom (premier mot)
    return fullName.split(' ')[0];
  };
  const getUserInitials = () => {
    const fullName = profile?.full_name || user?.email?.split('@')[0] || t('navbar.userFallback');
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  return <header className={`sticky top-0 z-50 w-full transition-all duration-150 ${isScrolled ? 'bg-background/95 backdrop-blur border-b border-border supports-[backdrop-filter]:bg-background/90' : isSettingsPage ? 'bg-transparent border-b border-border' : 'bg-transparent'}`}>
      <div className="container flex h-16 items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2 mr-auto hover:underline transition-all duration-200"
          onClick={(e) => {
            // TOUJOURS nettoyer la session quand on clique sur le logo
            e.preventDefault();
            clearSession();
            navigate('/');
          }}
        >
          <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-8 w-8 rounded-none " />
          <span className="text-xl font-semibold">Rationable</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover w-full h-full" />}
                      <AvatarFallback className="text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:flex items-center gap-1">
                      {getUserDisplayName()}
                      <ChevronDown className="h-3 w-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <WorkspaceSelector />
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('navbar.settings')}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navbar.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Bouton partager en dernier pour les décisions en cours */}
              {currentDecision && <ShareButton decision={currentDecision} />}
            </> : 
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  {t('navbar.signIn')}
                </Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button variant="default" size="sm">
                  {t('navbar.getStarted')}
                </Button>
              </Link>
            </div>
          }
        </div>
      </div>
    </header>;
};
export default Navbar;