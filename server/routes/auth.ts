import type { Express } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { authenticateSupabase, requireSuperAdmin, handleRouteError, Roles } from "./middleware";

export function registerAuthRoutes(app: Express): void {
  // Public registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Check if this is the first user (make them super_admin)
      const allUsers = await storage.getAllUsers();
      const isFirstUser = allUsers.length === 0;

      // Create user in Supabase with role in user_metadata
      const user = await storage.createUser({
        ...userData,
        role: isFirstUser ? "super_admin" : userData.role || "ordinary_user",
      });

      res.status(201).json({ user });
    } catch (error) {
      handleRouteError(error, req, res, "auth/register");
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = await storage.getUser(data.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user, token: data.session.access_token });
    } catch (error) {
      handleRouteError(error, req, res, "auth/login");
    }
  });

  // Logout endpoint (client-side token invalidation)
  app.post("/api/auth/logout", authenticateSupabase, async (req, res) => {
    try {
      // In a token-based system, logout is typically handled client-side
      // by removing the token from storage. This endpoint exists for completeness.
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      handleRouteError(error, req, res, "auth/logout");
    }
  });

  // Get current user profile
  app.get("/api/auth/me", authenticateSupabase, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.supabaseUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      handleRouteError(error, req, res, "auth/me");
    }
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      });

      if (error || !data.session) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      res.json({
        token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      });
    } catch (error) {
      handleRouteError(error, req, res, "auth/refresh");
    }
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      // Always return success to prevent email enumeration
      res.json({ message: "Password reset email sent if account exists" });
    } catch (error) {
      handleRouteError(error, req, res, "auth/forgot-password");
    }
  });

  // Password reset confirmation
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password update error:", error);
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      handleRouteError(error, req, res, "auth/reset-password");
    }
  });

  // Change password (authenticated users)
  app.patch("/api/auth/change-password", authenticateSupabase, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      // First verify current password
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: req.supabaseUser.email,
        password: currentPassword,
      });

      if (signInError) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        req.supabaseUser.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error("Password update error:", updateError);
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      handleRouteError(error, req, res, "auth/change-password");
    }
  });
}
