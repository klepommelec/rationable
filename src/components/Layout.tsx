
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useDecisionMaker } from "@/hooks/useDecisionMaker";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const location = useLocation();
  const {
    getCurrentDecision
  } = useDecisionMaker();
  const {
    user
  } = useAuth();

  // Only show share button on the main decision maker page when there's a completed decision
  const currentDecision = location.pathname === '/' && user ? getCurrentDecision() : null;

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Check if we're on the settings page
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Dégradé uniquement sur la home page et en thème clair */}
      {isHomePage && (
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none dark:hidden" 
          style={{
            backgroundImage: 'url(/lovable-uploads/faef67a8-98c5-453e-84c7-2d077a111397.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }} 
        />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {!isSettingsPage && <Navbar currentDecision={currentDecision} />}
        <main 
          role="main" 
          id="main-content" 
          className={`flex-grow ${
            isSettingsPage 
              ? 'h-screen overflow-hidden' 
              : 'container mx-auto sm:px-6 lg:px-8 sm:py-6 lg:py-8 max-w-full overflow-x-hidden px-[3px] py-0'
          }`}
        >
          <Outlet />
        </main>
        {!isSettingsPage && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
