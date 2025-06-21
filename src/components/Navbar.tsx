
import { BrainCircuit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    console.log('Logo clicked, navigating to home');
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div 
          className="flex items-center gap-2 mr-auto cursor-pointer" 
          onClick={handleLogoClick}
        >
          <BrainCircuit className="h-6 w-6" />
          <span className="font-bold text-lg">Decision Helper</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Navbar;
