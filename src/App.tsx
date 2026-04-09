
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PointsProvider } from "@/contexts/PointsContext";
import { BackgroundProvider } from "@/components/BackgroundProvider";
import LandingPage from "./pages/LandingPage";
import MainPlatform from "./pages/MainPlatform";
import HomePage from "./pages/HomePage";
import VolunteerActivities from "./pages/VolunteerActivities";
import RedeemPoints from "./pages/RedeemPoints";
import Heatmaps from "./pages/Heatmaps";
import Badges from "./pages/Badges";
import Documents from "./pages/Documents";
import Testing from "./pages/Testing";
import NotFound from "./pages/NotFound";
import Polls from "./pages/Polls";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="civixity-theme">
      <PointsProvider>
        <BackgroundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/platform" element={<MainPlatform />}>
                  <Route index element={<HomePage />} />
                  <Route path="volunteer" element={<VolunteerActivities />} />
                  <Route path="redeem" element={<RedeemPoints />} />
                  <Route path="heatmaps" element={<Heatmaps />} />
                  <Route path="badges" element={<Badges />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="polls" element={<Polls />} />
                  {/* Test Harness Page */}
                  <Route path="testing" element={<Testing />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BackgroundProvider>
    </PointsProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
