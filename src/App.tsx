import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Demo from "./pages/Demo";
import Nominations from "./pages/Nominations";
import CycleLegislatif from "./pages/CycleLegislatif";
import EGop from "./pages/EGop";
import Institutions from "./pages/Institutions";
import JournalOfficiel from "./pages/JournalOfficiel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/gar" element={<Dashboard />} />
          <Route path="/nominations" element={<Nominations />} />
          <Route path="/cycle-legislatif" element={<CycleLegislatif />} />
          <Route path="/egop" element={<EGop />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/journal-officiel" element={<JournalOfficiel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
