
import { Users, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  currentDecision?: any;
}

const Navbar: React.FC<NavbarProps> = ({ currentDecision }) => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-auto hover:underline transition-all duration-200">
          <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-9 w-9 " />
          <span className="font-medium text-xl">Rationable</span>
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
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
