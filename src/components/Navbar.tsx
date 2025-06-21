import { Users } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import ShareButton from './ShareButton';
import { Button } from '@/components/ui/button';
interface NavbarProps {
  currentDecision?: any;
}
const Navbar: React.FC<NavbarProps> = ({
  currentDecision
}) => {
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-auto hover:underline transition-all duration-200">
          <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-9 w-9 " />
          <span className="font-medium text-xl">Rationable</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link to="/templates">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          </Link>
          {currentDecision && <ShareButton decision={currentDecision} />}
          <ThemeToggle />
        </div>
      </div>
    </header>;
};
export default Navbar;