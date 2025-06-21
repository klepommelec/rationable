
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useDecisionMaker } from '@/hooks/useDecisionMaker';

const Layout = () => {
  const location = useLocation();
  const { getCurrentDecision, analysisStep } = useDecisionMaker();
  
  // Vérifier si on est sur la page principale
  const isHomePage = location.pathname === '/';
  const currentDecision = getCurrentDecision();
  
  // Le bouton de partage doit apparaître quand :
  // 1. On est sur la page d'accueil
  // 2. Une analyse est terminée
  // 3. Il y a une décision courante
  const shouldShowShareButton = isHomePage && 
                               analysisStep === 'done' && 
                               currentDecision !== null && 
                               currentDecision !== undefined;

  // Debug logs améliorés
  console.log('🔍 [DEBUG] Layout - Share button conditions:', {
    isHomePage,
    analysisStep,
    hasCurrentDecision: currentDecision !== null,
    currentDecisionId: currentDecision?.id,
    shouldShowShareButton
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar 
        currentDecision={currentDecision} 
        showShareButton={shouldShowShareButton}
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
