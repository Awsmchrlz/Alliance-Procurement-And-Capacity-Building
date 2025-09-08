import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole, Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

interface PermissionGuardProps {
  children: React.ReactNode;

  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions. If false, requires any permission

  // Role-based access
  role?: UserRole;
  roles?: UserRole[];

  // Behavior options
  fallback?: React.ReactNode;
  showFallback?: boolean;
  redirect?: string;

  // Loading state
  loadingComponent?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  showFallback = false,
  redirect,
  loadingComponent,
}: PermissionGuardProps) {
  const { user, loading } = useAuth();

  // Show loading component while auth is loading
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return null;
  }

  // If no user is logged in, deny access
  if (!user) {
    if (redirect) {
      window.location.href = redirect;
      return null;
    }
    return showFallback ? <>{fallback}</> : null;
  }

  const userRole = user.role;
  let hasAccess = true;

  // Check role-based access
  if (role && userRole !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(userRole as UserRole)) {
    hasAccess = false;
  }

  // Check permission-based access
  if (permission && !hasPermission(userRole, permission)) {
    hasAccess = false;
  }

  if (permissions && permissions.length > 0) {
    if (requireAll) {
      // User must have ALL permissions
      if (!hasAllPermissions(userRole, permissions)) {
        hasAccess = false;
      }
    } else {
      // User must have ANY of the permissions
      if (!hasAnyPermission(userRole, permissions)) {
        hasAccess = false;
      }
    }
  }

  // Grant access if all checks pass
  if (hasAccess) {
    return <>{children}</>;
  }

  // Deny access
  if (redirect) {
    window.location.href = redirect;
    return null;
  }

  return showFallback ? <>{fallback}</> : null;
}

// Convenience components for common use cases
export function AdminGuard({ children, fallback, showFallback = false }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}) {
  return (
    <PermissionGuard
      permission="admin.dashboard"
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function EventManagerGuard({ children, fallback, showFallback = false }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}) {
  return (
    <PermissionGuard
      roles={['super_admin', 'event_manager']}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function FinanceGuard({ children, fallback, showFallback = false }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}) {
  return (
    <PermissionGuard
      roles={['super_admin', 'finance_person']}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function SuperAdminGuard({ children, fallback, showFallback = false }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}) {
  return (
    <PermissionGuard
      role="super_admin"
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Hook for checking permissions in components
export function usePermissions() {
  const { user, permissions } = useAuth();

  return {
    ...permissions,
    userRole: user?.role,
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(user?.role as UserRole),
    canAccess: (permission: Permission) => hasPermission(user?.role, permission),
    canAccessAny: (perms: Permission[]) => hasAnyPermission(user?.role, perms),
    canAccessAll: (perms: Permission[]) => hasAllPermissions(user?.role, perms),
  };
}
