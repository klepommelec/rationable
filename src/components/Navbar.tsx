
import { BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-auto">
          <BrainCircuit className="h-6 w-6" />
          <span className="font-bold text-lg">Decision Helper</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
