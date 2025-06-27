
import { Users, LogOut, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NavbarProps {
  currentDecision?: any;
}

const Navbar: React.FC<NavbarProps> = ({
  currentDecision
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const {
    user,
    profile,
    signOut
  } = useAuth();

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

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-150 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur border-b supports-[backdrop-filter]:bg-white/90' 
        : isSettingsPage 
          ? 'bg-transparent border-b'
          : 'bg-transparent'
    }`}>
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-auto hover:underline transition-all duration-200">
          <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-9 w-9 rounded-none " />
          <span className="text-xl font-medium">Rationable</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/templates">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              </Link>
              
              {currentDecision && <ShareButton decision={currentDecision} />}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
