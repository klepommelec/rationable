
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SharedDecision from "./pages/SharedDecision";
import TemplatePreview from "./pages/TemplatePreview";
import CommunityTemplates from "./pages/CommunityTemplates";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./hooks/useAuth";
import { WorkspacesProvider } from "./contexts/WorkspacesContext";
import { DecisionMakerProvider } from "./contexts/DecisionMakerContext";
import { I18nUIProvider } from "./contexts/I18nUIContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppErrorBoundary } from "./components/core/AppErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <WorkspacesProvider>
                <I18nUIProvider>
                  <DecisionMakerProvider>
                  <AppErrorBoundary>
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
                    </Route>
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppErrorBoundary>
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
