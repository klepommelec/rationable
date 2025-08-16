import { Users, LogOut, User, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useDecisionMakerContext } from '@/contexts/DecisionMakerContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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
  
  // Détection d'une décision active
  const hasActiveDecision = location.pathname === '/' && user && (
    result !== null || analysisStep !== 'idle' || dilemma.trim() !== ''
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
    return profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  };
  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
              <Link to="/templates">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" className="object-cover w-full h-full" />}
                      <AvatarFallback className="text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {getUserDisplayName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <WorkspaceSelector />
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Bouton partager en dernier pour les décisions en cours */}
              {currentDecision && <ShareButton decision={currentDecision} />}
            </> : <Link to="/auth">
              <Button variant="default" size="sm">
                Se connecter
              </Button>
            </Link>}
        </div>
      </div>
    </header>;
};
export default Navbar;