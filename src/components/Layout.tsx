
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import { PerplexityCounter } from "@/components/PerplexityCounter";
import { RealTimeSearchToggle } from "@/components/RealTimeSearchToggle";

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Check if we're on the settings page
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Background pour le thème clair */}
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

      {/* Background pour le thème sombre */}
      {isHomePage && (
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none hidden dark:block" 
          style={{
            backgroundImage: 'url(/lovable-uploads/acbf0d3a-fb57-41c6-b877-a64d38b65f84.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }} 
        />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <PerplexityCounter />
        <Navbar />
        <main 
          role="main" 
          id="main-content" 
          className={`flex-grow ${
            isSettingsPage 
              ? 'h-[calc(100vh-4rem)] overflow-hidden' 
              : 'container mx-auto sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8 max-w-full overflow-x-hidden px-[3px] sm:px-6'
          }`}
        >
          <Outlet />
        </main>
        {!isSettingsPage && (
          <>
            <RealTimeSearchToggle />
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
