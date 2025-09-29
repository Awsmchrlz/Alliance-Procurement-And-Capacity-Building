import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import About from "@/pages/about";
import Events from "@/pages/events";
import AdminDashboard from "@/pages/admin-dashboard";

import NotFound from "@/pages/not-found";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { useEffect } from "react";

// Contact component that redirects to home and scrolls to contact section
function ContactRedirect() {
  useEffect(() => {
    // Function to scroll to the very bottom of the page
    const scrollToBottom = () => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Get the full height of the document
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );

        // Scroll to the absolute bottom
        window.scrollTo({
          top: documentHeight,
          behavior: 'smooth'
        });
      });
    };

    // Wait for the page to fully load, then scroll
    const timer = setTimeout(() => {
      // Try multiple times to ensure we get to the bottom
      scrollToBottom();

      // Additional scroll after a delay to ensure we reach the footer
      setTimeout(scrollToBottom, 800);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return <Home />;
}

function Router() {
  const { isAdmin } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/contact" component={ContactRedirect} />
      <Route path="/login">
        <AuthGuard requireAuth={false} redirectTo="/dashboard">
          <Login />
        </AuthGuard>
      </Route>
      <Route path="/register">
        <AuthGuard requireAuth={false} redirectTo="/dashboard">
          <Register />
        </AuthGuard>
      </Route>
      <Route path="/forgot-password">
        <AuthGuard requireAuth={false} redirectTo="/dashboard">
          <ForgotPassword />
        </AuthGuard>
      </Route>
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/events" component={Events} />

      {/* Protected routes */}
      <Route path="/dashboard">
        <AuthGuard>{isAdmin ? <AdminDashboard /> : <Dashboard />}</AuthGuard>
      </Route>

      <Route path="/admin-dashboard">
        <AuthGuard requireAuth={isAdmin} redirectTo="/dashboard">
          <AdminDashboard />
        </AuthGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppFloat
            phoneNumber="+260 571354125"
            message="Hello! I'd like to know more about Alliance Procurement and Capacity Building services."
            showTooltip={true}
          />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
