import { Users, LogOut, User, Lightbulb, LightbulbOff, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
interface NavbarProps {
  currentDecision?: any;
}
const Navbar: React.FC<NavbarProps> = ({
  currentDecision
}) => {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const {
    setTheme,
    theme
  } = useTheme();
  const handleSignOut = async () => {
    await signOut();
  };
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-auto hover:underline transition-all duration-200">
          <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-9 w-9 " />
          <span className="text-xl font-medium">Rationable</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? <>
              <Link to="/templates">
                <Button variant="ghost" size="sm" className="rounded-full">
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
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Thème clair
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <LightbulbOff className="h-4 w-4 mr-2" />
                    Thème sombre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="h-4 w-4 mr-2" />
                    Système
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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