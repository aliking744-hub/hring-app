import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import JobDescriptionGenerator from "./pages/JobDescriptionGenerator";
import SmartAdGenerator from "./pages/SmartAdGenerator";
import InterviewAssistant from "./pages/InterviewAssistant";
import OnboardingRoadmap from "./pages/OnboardingRoadmap";
import SuccessArchitect from "./pages/SuccessArchitect";
import ToolsGrid from "./pages/ToolsGrid";
import HRDashboard from "./pages/HRDashboard";
import Modules from "./pages/Modules";
import AnalyticsHub from "./pages/AnalyticsHub";
import CostCalculator from "./pages/CostCalculator";
import SmartHeadhunting from "./pages/SmartHeadhunting";
import CampaignDetail from "./pages/CampaignDetail";
import CandidateDetail from "./pages/CandidateDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
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
                path="/smart-ad-generator" 
                element={
                  <ProtectedRoute>
                    <SmartAdGenerator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/interview-assistant" 
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
              <Route 
                path="/success-architect" 
                element={
                  <ProtectedRoute>
                    <SuccessArchitect />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tools" 
                element={
                  <ProtectedRoute>
                    <ToolsGrid />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr-dashboard" 
                element={
                  <ProtectedRoute>
                    <HRDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/modules" 
                element={
                  <ProtectedRoute>
                    <Modules />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cost-calculator" 
                element={
                  <ProtectedRoute>
                    <CostCalculator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/smart-headhunting" 
                element={
                  <ProtectedRoute>
                    <SmartHeadhunting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaign/:id" 
                element={
                  <ProtectedRoute>
                    <CampaignDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaign/:campaignId/candidate/:candidateId" 
                element={
                  <ProtectedRoute>
                    <CandidateDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
