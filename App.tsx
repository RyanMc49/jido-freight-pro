import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./lib/trpc";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import Dashboard from "./pages/Dashboard";
import FuelFinder from "./pages/FuelFinder";
import LiveFuelPrices from "./pages/LiveFuelPrices";
import Navigation from "./pages/Navigation";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import RoadAlerts from "./pages/RoadAlerts";
import AIAssistant from "./pages/AIAssistant";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/fuel"} component={FuelFinder} />
      <Route path={"/live-fuel"} component={LiveFuelPrices} />
      <Route path={"/navigation"} component={Navigation} />
      <Route path={"/alerts"} component={RoadAlerts} />
      <Route path={"/ai"} component={AIAssistant} />
      <Route path={"/business"} component={Business} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

export default App;
