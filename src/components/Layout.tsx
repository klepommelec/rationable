
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useDecisionMaker } from "@/hooks/useDecisionMaker";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const location = useLocation();
  const { getCurrentDecision } = useDecisionMaker();
  const { user } = useAuth();
  
  // Only show share button on the main decision maker page when there's a completed decision
  const currentDecision = location.pathname === '/' && user ? getCurrentDecision() : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Dégradé uniquement en thème clair */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none dark:hidden"
        style={{
          backgroundImage: 'url(/lovable-uploads/eec8c18b-38ad-4629-9c00-5c9e97467f34.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="relative z-10">
        <Navbar currentDecision={currentDecision} />
        <main 
          className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden"
          role="main"
          id="main-content"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
