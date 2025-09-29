
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";
import BackgroundGradientAnimation from "./BackgroundGradientAnimation";
import { useTheme } from "next-themes";

import { RealTimeSearchToggle } from "@/components/RealTimeSearchToggle";

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Check if we're on the settings page
  const isSettingsPage = location.pathname === '/settings';
  
  // Configuration des couleurs selon le thème
  const lightThemeConfig = {
    gradientBackgroundStart: "rgb(200, 220, 255)", // Bleu plus visible
    gradientBackgroundEnd: "rgb(255, 200, 220)",   // Rose plus visible
    firstColor: "59, 130, 246",    // Bleu
    secondColor: "168, 85, 247",   // Violet
    thirdColor: "34, 197, 94",     // Vert
    fourthColor: "251, 146, 60",   // Orange
    fifthColor: "236, 72, 153",    // Rose
    pointerColor: "99, 102, 241"   // Indigo
  };

  const darkThemeConfig = {
    gradientBackgroundStart: "rgb(15, 23, 42)",
    gradientBackgroundEnd: "rgb(30, 41, 59)",
    firstColor: "59, 130, 246",    // Bleu vif
    secondColor: "168, 85, 247",   // Violet vif
    thirdColor: "34, 197, 94",     // Vert vif
    fourthColor: "251, 146, 60",   // Orange vif
    fifthColor: "236, 72, 153",    // Rose vif
    pointerColor: "99, 102, 241"   // Indigo vif
  };

  const currentConfig = theme === 'dark' ? darkThemeConfig : lightThemeConfig;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* Background animé pour la page d'accueil uniquement */}
      {isHomePage && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Background de base - adapté au thème */}
          <div
            className={`absolute inset-0 ${
              theme === 'dark' 
                ? 'bg-gradient-to-b from-background to-muted/20' 
                : 'bg-gradient-to-b from-background to-background'
            }`}
          />
          
          {/* Premier orbe - Bleu */}
          <div
            className="absolute rounded-full"
            style={{
              width: "min(500px, 50vw)",
              height: "min(500px, 50vw)",
              top: "20%",
              left: "max(10%, -100px)",
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(18, 113, 255, 0.2) 0%, rgba(18, 113, 255, 0.1) 50%, transparent 100%)',
              animation: 'moveVertical 30s ease infinite',
              filter: 'blur(80px)',
            }}
          />
          
          {/* Deuxième orbe - Jaune */}
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "min(450px, 45vw)",
              height: "min(450px, 45vw)",
              top: "40%",
              left: "50%",
              transform: "translateX(-50%)",
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0.04) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(180, 180, 50, 0.35) 0%, rgba(180, 180, 50, 0.15) 50%, transparent 100%)',
              animation: 'moveHorizontal 25s ease infinite',
            }}
          />
          
          {/* Troisième orbe - Cyan */}
          <div
            className="absolute rounded-full"
            style={{
              width: "min(600px, 60vw)",
              height: "min(600px, 60vw)",
              top: "10%",
              right: "max(20%, -150px)",
              background: theme === 'dark'
                ? 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, rgba(34, 211, 238, 0.03) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(100, 220, 255, 0.3) 0%, rgba(100, 220, 255, 0.15) 50%, transparent 100%)',
              animation: 'moveVertical 35s ease infinite',
              filter: 'blur(80px)',
            }}
          />
          
          
          {/* CSS Animations */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes moveVertical {
                0% { transform: translateY(-50%); }
                50% { transform: translateY(50%); }
                100% { transform: translateY(-50%); }
              }
              
              @keyframes moveInCircle {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(180deg); }
                100% { transform: rotate(360deg); }
              }
            `
          }} />
        </div>
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
        
        <Navbar />
        <main 
          role="main" 
          id="main-content" 
          className={`flex-grow ${
            isSettingsPage 
              ? 'h-[calc(100vh-4rem)] overflow-hidden pt-16' 
              : 'container mx-auto sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8 max-w-full overflow-x-hidden px-[3px] sm:px-6 pt-16'
          }`}
        >
          <Outlet />
        </main>
        {!isSettingsPage && (
          <>
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
