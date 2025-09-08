export type UserRole =
  | "super_admin"
  | "finance_person"
  | "event_manager"
  | "ordinary_user";

export type Permission =
  // User management
  | "users.create"
  | "users.read"
  | "users.update"
  | "users.delete"
  | "users.assign_roles"

  // Event management
  | "events.create"
  | "events.read"
  | "events.update"
  | "events.delete"
  | "events.feature"
  | "events.analytics"

  // Registration management
  | "registrations.read_all"
  | "registrations.read_own"
  | "registrations.create"
  | "registrations.update"
  | "registrations.delete"
  | "registrations.approve"
  | "registrations.cancel"
  | "registrations.export"

  // Financial management
  | "finance.read"
  | "finance.update"
  | "finance.export"
  | "finance.reports"

  // Admin access
  | "admin.dashboard"
  | "admin.analytics"
  | "admin.reports"
  | "admin.system_settings"

  // Newsletter management
  | "newsletter.read"
  | "newsletter.create"
  | "newsletter.send"
  | "newsletter.export";

// Define permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full access to everything
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
    "users.assign_roles",

    "events.create",
    "events.read",
    "events.update",
    "events.delete",
    "events.feature",
    "events.analytics",

    "registrations.read_all",
    "registrations.read_own",
    "registrations.create",
    "registrations.update",
    "registrations.delete",
    "registrations.approve",
    "registrations.cancel",
    "registrations.export",

    "finance.read",
    "finance.update",
    "finance.export",
    "finance.reports",

    "admin.dashboard",
    "admin.analytics",
    "admin.reports",
    "admin.system_settings",

    "newsletter.read",
    "newsletter.create",
    "newsletter.send",
    "newsletter.export",
  ],

  event_manager: [
    // Event management focused permissions
    "events.create",
    "events.read",
    "events.update",
    "events.delete",
    "events.feature",
    "events.analytics",

    "registrations.read_all",
    "registrations.read_own",
    "registrations.create",
    "registrations.approve",
    "registrations.cancel",
    "registrations.export",

    "admin.dashboard",
    "admin.analytics",

    "newsletter.read",
    "newsletter.create",
  ],

  finance_person: [
    // Finance focused permissions
    "events.read", // Can view events but not modify

    "registrations.read_all",
    "registrations.read_own",
    "registrations.update", // Can update payment status
    "registrations.export",

    "finance.read",
    "finance.update",
    "finance.export",
    "finance.reports",

    "admin.dashboard",
    "admin.reports",
  ],

  ordinary_user: [
    // Basic user permissions
    "events.read",
    "registrations.read_own",
    "registrations.create",
  ],
};

// Check if a role has a specific permission
export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[],
): boolean {
  if (!role) return false;
  return permissions.some((permission) => hasPermission(role, permission));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: Permission[],
): boolean {
  if (!role) return false;
  return permissions.every((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Check if user can access admin areas
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return hasPermission(role, "admin.dashboard");
}

// Check if user can manage events
export function canManageEvents(role: UserRole | null | undefined): boolean {
  return hasAnyPermission(role, [
    "events.create",
    "events.update",
    "events.delete",
  ]);
}

// Check if user can manage users
export function canManageUsers(role: UserRole | null | undefined): boolean {
  return hasPermission(role, "users.create");
}

// Check if user can manage finance
export function canManageFinance(role: UserRole | null | undefined): boolean {
  return hasPermission(role, "finance.update");
}

// Check if user can view all registrations
export function canViewAllRegistrations(
  role: UserRole | null | undefined,
): boolean {
  return hasPermission(role, "registrations.read_all");
}

// Check if user can manage registrations
export function canManageRegistrations(
  role: UserRole | null | undefined,
): boolean {
  return hasAnyPermission(role, [
    "registrations.approve",
    "registrations.cancel",
    "registrations.update",
  ]);
}

// Helper to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    event_manager: "Event Manager",
    finance_person: "Finance Manager",
    ordinary_user: "User",
  };

  return roleNames[role] ?? "Unknown Role";
}

// Helper to get role description
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    super_admin: "Full system access with all administrative privileges",
    event_manager:
      "Manages events and registrations (excluding payment processing)",
    finance_person:
      "Handles financial aspects, payments, and financial reporting",
    ordinary_user:
      "Basic user access for event registration and profile management",
  };

  return descriptions[role] ?? "No description available";
}

// Get available roles (useful for admin interfaces)
export function getAvailableRoles(): {
  value: UserRole;
  label: string;
  description: string;
}[] {
  return [
    {
      value: "super_admin",
      label: getRoleDisplayName("super_admin"),
      description: getRoleDescription("super_admin"),
    },
    {
      value: "event_manager",
      label: getRoleDisplayName("event_manager"),
      description: getRoleDescription("event_manager"),
    },
    {
      value: "finance_person",
      label: getRoleDisplayName("finance_person"),
      description: getRoleDescription("finance_person"),
    },
    {
      value: "ordinary_user",
      label: getRoleDisplayName("ordinary_user"),
      description: getRoleDescription("ordinary_user"),
    },
  ];
}

// Check if a role can assign other roles
export function canAssignRole(
  userRole: UserRole | null | undefined,
  targetRole: UserRole,
): boolean {
  if (!hasPermission(userRole, "users.assign_roles")) return false;

  // Super admins can assign any role
  if (userRole === "super_admin") return true;

  // Other roles cannot assign roles (future extensibility)
  return false;
}

// Role hierarchy helpers (higher number = more privileged)
const roleHierarchy: Record<UserRole, number> = {
  ordinary_user: 1,
  event_manager: 2,
  finance_person: 3,
  super_admin: 4,
};

export function getRoleLevel(role: UserRole): number {
  return roleHierarchy[role] ?? 0;
}

export function isHigherRole(
  userRole: UserRole,
  compareRole: UserRole,
): boolean {
  return getRoleLevel(userRole) > getRoleLevel(compareRole);
}

export function canManageRole(
  userRole: UserRole | null | undefined,
  targetRole: UserRole,
): boolean {
  if (!userRole) return false;
  return (
    isHigherRole(userRole, targetRole) &&
    hasPermission(userRole, "users.update")
  );
}
