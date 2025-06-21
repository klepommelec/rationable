
import { BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';
import ShareButton from '@/components/ShareButton';
import { IDecision } from '@/types/decision';

interface NavbarProps {
  currentDecision?: IDecision | null;
  showShareButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentDecision, showShareButton = false }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6" />
          <span className="font-bold text-lg">Decision Helper</span>
        </Link>
        
        <div className="flex items-center gap-3 ml-auto">
          {showShareButton && currentDecision && (
            <ShareButton decision={currentDecision} />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
