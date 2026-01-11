import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CoachProvider } from "@/contexts/CoachContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import WarRoomPage from "@/pages/WarRoomPage";
import LibraryPage from "@/pages/LibraryPage";
import CoachPersonalityPage from "@/pages/CoachPersonalityPage";
import CoachOSPage from "@/pages/CoachOSPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/war-room"} component={WarRoomPage} />
      <Route path={"/library"} component={LibraryPage} />
      <Route path={"/coach"} component={CoachPersonalityPage} />
      <Route path={"/coachOS"} component={CoachOSPage} />
      <Route path={"/settings"} component={AccountSettingsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CoachProvider>
            <TooltipProvider>
              <Toaster />
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Router />
              </main>
            </TooltipProvider>
          </CoachProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
