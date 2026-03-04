import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CoachProvider } from "@/contexts/CoachContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";

// Public pages
import CounterpickPage from "@/pages/CounterpickPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DiscordCallbackPage from "@/pages/DiscordCallbackPage";

// Protected pages (kept for future use)
import UserProfilePage from "@/pages/UserProfilePage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";

// Admin pages
import AdminRoute from "@/components/AdminRoute";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminCounterpicksPage from "@/pages/AdminCounterpicksPage";

import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      {/* Public routes — no login required */}
      <Route path="/" component={CounterpickPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/discord/callback" component={DiscordCallbackPage} />

      {/* Optional protected routes — only if logged in */}
      <Route path="/profile">
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <AccountSettingsPage />
        </ProtectedRoute>
      </Route>

      {/* Admin Operations */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      </Route>
      <Route path="/admin/counterpicks">
        <AdminRoute>
          <AdminCounterpicksPage />
        </AdminRoute>
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
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
