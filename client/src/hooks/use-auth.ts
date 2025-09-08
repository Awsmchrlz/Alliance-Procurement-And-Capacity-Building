import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = 'super_admin' | 'finance_person' | 'event_manager' | 'ordinary_user';

export function useAuth() {
  const [user, setUser] = useState<
    | null
    | {
        id: string;
        email: string | null;
        role: UserRole | null;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
      }
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const sessionUser = data.session?.user ?? null;
      if (sessionUser) {
        const meta = (sessionUser.user_metadata as any) || {};
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          role: meta.role || 'ordinary_user',
          firstName: meta.first_name ?? null,
          lastName: meta.last_name ?? null,
          phoneNumber: meta.phone_number ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        const meta = (sessionUser.user_metadata as any) || {};
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          role: meta.role || 'ordinary_user',
          firstName: meta.first_name ?? null,
          lastName: meta.last_name ?? null,
          phoneNumber: meta.phone_number ?? null,
        });
      } else {
        setUser(null);
      }
    });

    init();

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isFinancePerson = user?.role === 'finance_person';
  const isEventManager = user?.role === 'event_manager';
  const isAdmin = isSuperAdmin || isFinancePerson || isEventManager;
  const canManageUsers = isSuperAdmin;
  const canManageFinance = isSuperAdmin || isFinancePerson;
  const canManageEvents = isSuperAdmin || isEventManager;

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin,
    isFinancePerson,
    isEventManager,
    isAdmin,
    canManageUsers,
    canManageFinance,
    canManageEvents,
  };
}
