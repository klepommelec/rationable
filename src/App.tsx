
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense } from "react";
import { createLazyComponent, SkeletonFallback } from "./components/LazyComponent";
import { PageTransition } from "./components/animations/PageTransition";

// Lazy loading avancé des pages avec préchargement intelligent
const Index = createLazyComponent(
  () => import("./pages/Index"),
  { preload: true, preloadDelay: 1000 }
);

const NotFound = createLazyComponent(
  () => import("./pages/NotFound"),
  { preload: false }
);

const SharedDecision = createLazyComponent(
  () => import("./pages/SharedDecision"),
  { preload: true, preloadDelay: 2000 }
);

const TemplatePreview = createLazyComponent(
  () => import("./pages/TemplatePreview"),
  { preload: true, preloadDelay: 1500 }
);

const CommunityTemplates = createLazyComponent(
  () => import("./pages/CommunityTemplates"),
  { preload: true, preloadDelay: 2000 }
);

const Settings = createLazyComponent(
  () => import("./pages/Settings"),
  { preload: false, retryCount: 3 }
);

const Auth = createLazyComponent(
  () => import("./pages/Auth"),
  { preload: false }
);

const Privacy = createLazyComponent(
  () => import("./pages/Privacy"),
  { preload: false }
);

// Dashboard des fonctionnalités avancées (développement uniquement)
import { SimpleDashboard } from "./components/SimpleDashboard";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./hooks/useAuth";
import { WorkspacesProvider } from "./contexts/WorkspacesContext";
import { DecisionMakerProvider } from "./contexts/DecisionMakerContext";
import { I18nUIProvider } from "./contexts/I18nUIContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppErrorBoundary } from "./components/core/AppErrorBoundary";
// import { PerformanceMonitor } from "./components/PerformanceMonitor";

const queryClient = new QueryClient();

// Composant de loading amélioré pour le lazy loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="text-sm text-muted-foreground">Chargement...</div>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <WorkspacesProvider>
                <I18nUIProvider>
                  <DecisionMakerProvider>
                  {/* <PerformanceMonitor /> */}
                  <Suspense fallback={<PageLoader />}>
                    <PageTransition>
                      <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/shared/:publicId" element={<SharedDecision />} />
                        <Route path="/template-preview/:previewId" element={<TemplatePreview />} />
                        <Route element={<Layout />}>
                          <Route path="/" element={<Index />} />
                          <Route path="/templates" element={<CommunityTemplates />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/settings" element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          } />
                          {/* Dashboard des fonctionnalités avancées */}
                          <Route path="/admin/advanced-features" element={<SimpleDashboard />} />
                          {/* Route de test */}
                          <Route path="/test" element={<div className="p-8"><h1 className="text-2xl font-bold">Test Route</h1><p>Cette route fonctionne !</p></div>} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PageTransition>
                  </Suspense>
                  </DecisionMakerProvider>
                </I18nUIProvider>
              </WorkspacesProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
