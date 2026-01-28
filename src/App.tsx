import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CoachProvider } from "@/contexts/CoachContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import WarRoomPage from "@/pages/WarRoomPage";
import LibraryPage from "@/pages/LibraryPage";
import CoachPersonalityPage from "@/pages/CoachPersonalityPage";
import CoachOSPage from "@/pages/CoachOSPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/signup"} component={SignupPage} />
      
      {/* Protected Routes */}
      <Route path={"/"}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/war-room"}>
        <ProtectedRoute>
          <WarRoomPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/library"}>
        <ProtectedRoute>
          <LibraryPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/coach"}>
        <ProtectedRoute>
          <CoachPersonalityPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/coachOS"}>
        <ProtectedRoute>
          <CoachOSPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/settings"}>
        <ProtectedRoute>
          <AccountSettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path={"/profile"}>
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      </Route>

      {/* Error Route */}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
