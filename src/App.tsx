import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import JobDescriptionGenerator from "./pages/JobDescriptionGenerator";
import SmartAdGenerator from "./pages/SmartAdGenerator";
import InterviewAssistant from "./pages/InterviewAssistant";
import OnboardingRoadmap from "./pages/OnboardingRoadmap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop" 
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/job-description" 
              element={
                <ProtectedRoute>
                  <JobDescriptionGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/smart-ad" 
              element={
                <ProtectedRoute>
                  <SmartAdGenerator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interviews" 
              element={
                <ProtectedRoute>
                  <InterviewAssistant />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OnboardingRoadmap />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
