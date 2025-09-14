import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
};

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // If authentication is required but user is not logged in, redirect to login
        navigate(redirectTo);
      } else if (!requireAuth && user) {
        // If user is already authenticated but trying to access auth pages, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, loading, requireAuth, redirectTo, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if ((requireAuth && !user) || (!requireAuth && user)) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
};
