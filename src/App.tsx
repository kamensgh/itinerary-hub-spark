import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import Index from "./pages/Index";
import CreateItineraryView from "./pages/ItineraryView";
import ItineraryPreview from "./pages/ItineraryPreview";
import ItineraryViewOnly from "./pages/ItineraryViewOnly";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  // Enable idle timeout for authenticated users - automatically logs out after 1 hour of inactivity
  useIdleTimeout({ 
    timeoutMinutes: 60,
  });

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/create" element={<CreateItineraryView />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/itinerary/new" element={<CreateItineraryView />} />
      <Route path="/itinerary/:id" element={<CreateItineraryView />} />
      <Route path="/itinerary/:id/view-only" element={<ItineraryViewOnly />} />
      <Route path="/itinerary/preview" element={<ItineraryPreview />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
