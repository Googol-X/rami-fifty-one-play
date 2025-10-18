import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { features } from "@/config/app.config";
import Home from "./pages/Home";
import Table from "./pages/Table";
import Regles from "./pages/Regles";
import Auth from "./pages/Auth";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";
import { GameSandbox } from "./features/game/sandbox/GameSandbox";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PremiumProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/table" element={<Table />} />
                <Route path="/regles" element={<Regles />} />
                {/* Sandbox accessible uniquement si feature flag activé */}
                {features.gameSandbox && <Route path="/sandbox" element={<GameSandbox />} />}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </PremiumProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
