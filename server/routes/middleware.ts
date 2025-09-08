import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Role definitions
export const Roles = {
  SuperAdmin: "super_admin",
  Finance: "finance_person",
  EventManager: "event_manager",
  Ordinary: "ordinary_user",
} as const;

export type RoleValue = (typeof Roles)[keyof typeof Roles];

// Role helper functions
export const hasAnyRole = (userRole: RoleValue | undefined, allowed: RoleValue[]) =>
  !!userRole && allowed.includes(userRole);

export const hasRole = (userRole: RoleValue | undefined, role: RoleValue) =>
  userRole === role;

export const isAdmin = (userRole: RoleValue | undefined) =>
  hasAnyRole(userRole, [Roles.SuperAdmin, Roles.Finance, Roles.EventManager]);

// Middleware: Verify Supabase access token and attach user
export const authenticateSupabase = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res
        .status(500)
        .json({ message: "Supabase server credentials not configured" });
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.supabaseUser = data.user;
    req.supabaseRole =
      (data.user.user_metadata?.role as RoleValue) || Roles.Ordinary;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware: Verify specific roles
export const requireRoles =
  (allowedRoles: RoleValue[]) => (req: any, res: any, next: any) => {
    const role: RoleValue | undefined = req.supabaseRole;
    if (!hasAnyRole(role, allowedRoles)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

// Middleware: Require super admin role
export const requireSuperAdmin = requireRoles([Roles.SuperAdmin]);

// Middleware: Require admin roles (any admin)
export const requireAdmin = requireRoles([
  Roles.SuperAdmin,
  Roles.Finance,
  Roles.EventManager,
]);

// Middleware: Require finance permissions
export const requireFinance = requireRoles([Roles.SuperAdmin, Roles.Finance]);

// Middleware: Require event management permissions
export const requireEventManager = requireRoles([
  Roles.SuperAdmin,
  Roles.EventManager,
]);

// Middleware: Check if user owns resource or is admin
export const requireOwnerOrAdmin = (userIdParam: string = "userId") => {
  return (req: any, res: any, next: any) => {
    const requestedUserId = req.params[userIdParam];
    const currentUserId = req.supabaseUser?.id;
    const userRole = req.supabaseRole;

    // Allow if user is accessing their own resource or is an admin
    if (requestedUserId === currentUserId || isAdmin(userRole)) {
      return next();
    }

    return res.status(403).json({
      message: "Access denied. You can only access your own resources."
    });
  };
};

// Error handling middleware
export const handleRouteError = (error: any, req: any, res: any, routeName: string) => {
  console.error(`Error in ${routeName}:`, error);

  if (error.message?.includes("Invalid input")) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (error.message?.includes("not found")) {
    return res.status(404).json({ message: "Resource not found" });
  }

  if (error.message?.includes("already exists")) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  return res.status(500).json({
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message
  });
};
