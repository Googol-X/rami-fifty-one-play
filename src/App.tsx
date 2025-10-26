import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { GameProvider } from "@/contexts/GameContext";
import { LandscapeOnly } from "@/components/LandscapeOnly";
import { features } from "@/config/app.config";
import Home from "./pages/Home";
import Table from "./pages/Table";
import Regles from "./pages/Regles";
import Auth from "./pages/Auth";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";
import { GameSandbox } from "./features/game/sandbox/GameSandbox";
import Sandbox from "./features/game/sandbox/Sandbox";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PremiumProvider>
        <NotificationProvider>
          <GameProvider>
            <TooltipProvider>
              <LandscapeOnly>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/table" element={<Table />} />
                    <Route path="/regles" element={<Regles />} />
                    <Route path="/sandbox" element={<Sandbox />} />
                    {/* Ancien sandbox accessible uniquement si feature flag activé */}
                    {features.gameSandbox && <Route path="/old-sandbox" element={<GameSandbox />} />}
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </LandscapeOnly>
            </TooltipProvider>
          </GameProvider>
        </NotificationProvider>
      </PremiumProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
