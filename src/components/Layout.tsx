
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useDecisionMaker } from '@/hooks/useDecisionMaker';

const Layout = () => {
  const location = useLocation();
  const { getCurrentDecision, analysisStep } = useDecisionMaker();
  
  // Afficher le bouton de partage seulement sur la page principale quand une décision est complète
  const isHomePage = location.pathname === '/';
  const currentDecision = getCurrentDecision();
  const showShareButton = isHomePage && analysisStep === 'done' && currentDecision;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        currentDecision={currentDecision} 
        showShareButton={!!showShareButton}
      />
      <main 
        className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden"
        role="main"
        id="main-content"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
