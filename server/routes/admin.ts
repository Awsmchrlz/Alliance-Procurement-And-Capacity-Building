import type { Express } from "express";
import { storage } from "../storage";
import {
  insertEventRegistrationSchema,
  insertEventSchema,
} from "@shared/schema";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import {
  authenticateSupabase,
  requireSuperAdmin,
  requireAdmin,
  requireFinance,
  requireEventManager,
  handleRouteError,
  Roles,
  RoleValue,
} from "./middleware";

export function registerAdminRoutes(app: Express): void {
  // Admin user registration endpoint (super admin only)
  app.post(
    "/api/admin/users/register",
    authenticateSupabase,
    requireSuperAdmin,
    async (req: any, res) => {
      try {
        const { firstName, lastName, email, phoneNumber, password, role } =
          req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

        // Create user in Supabase Auth
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
              role: role,
            },
          });

        if (authError) {
          console.error("Supabase auth error:", authError);
          return res
            .status(500)
            .json({ message: "Failed to create user account" });
        }

        if (!authData.user) {
          return res.status(500).json({ message: "Failed to create user" });
        }

        // Create user in public.users table
        const user = await storage.createUser({
          firstName,
          lastName,
          email,
          password: password,
          phoneNumber: phoneNumber || null,
          role,
        });

        console.log(`✅ Admin created user: ${email} with role: ${role}`);
        res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt,
          },
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/users/register");
      }
    },
  );

  // Admin users listing (super admin only)
  app.get(
    "/api/admin/users",
    authenticateSupabase,
    requireSuperAdmin,
    async (req: any, res) => {
      try {
        const users = await storage.getAllUsers();

        // Transform users to include additional admin info
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            try {
              const registrations = await storage.getEventRegistrationsByUser(
                user.id,
              );
              return {
                ...user,
                totalRegistrations: registrations.length,
                activeRegistrations: registrations.filter(
                  (r) => r.paymentStatus !== "cancelled",
                ).length,
                paidRegistrations: registrations.filter(
                  (r) => r.hasPaid === true,
                ).length,
              };
            } catch (error) {
              console.error(`Error getting stats for user ${user.id}:`, error);
              return {
                ...user,
                totalRegistrations: 0,
                activeRegistrations: 0,
                paidRegistrations: 0,
              };
            }
          }),
        );

        const roleStats = usersWithStats.reduce(
          (acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        res.json({
          users: usersWithStats,
          stats: {
            totalUsers: usersWithStats.length,
            roleDistribution: roleStats,
          },
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/users");
      }
    },
  );

  // Role updates (super admin only)
  app.patch(
    "/api/admin/users/:userId/role",
    authenticateSupabase,
    requireSuperAdmin,
    async (req: any, res) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !Object.values(Roles).includes(role as RoleValue)) {
          return res.status(400).json({ message: "Invalid role specified" });
        }

        // Prevent self-demotion from super_admin
        if (req.supabaseUser.id === userId && role !== Roles.SuperAdmin) {
          return res.status(400).json({
            message: "Cannot change your own super admin role",
          });
        }

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update user role via Supabase Auth
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { role },
          },
        );

        if (error) {
          console.error("Error updating user role:", error);
          throw error;
        }

        console.log(`✅ Role updated: ${user.email} -> ${role}`);
        res.json({
          message: "User role updated successfully",
          user: { ...user, role },
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/users/role");
      }
    },
  );

  // Admin events listing (all admin roles)
  app.get(
    "/api/admin/events",
    authenticateSupabase,
    requireAdmin,
    async (req: any, res) => {
      try {
        const events = await storage.getAllEvents();

        // Get detailed stats for each event
        const eventsWithStats = await Promise.all(
          events.map(async (event) => {
            try {
              const registrations = await storage.getEventRegistrationsByEvent(
                event.id,
              );
              const activeRegistrations = registrations.filter(
                (r) => r.paymentStatus !== "cancelled",
              );

              return {
                ...event,
                totalRegistrations: registrations.length,
                activeRegistrations: activeRegistrations.length,
                paidRegistrations: activeRegistrations.filter((r) => r.hasPaid)
                  .length,
                pendingPayments: activeRegistrations.filter((r) => !r.hasPaid)
                  .length,
                revenue: activeRegistrations
                  .filter((r) => r.hasPaid)
                  .reduce((sum, r) => sum + (parseFloat(event.price) || 0), 0),
              };
            } catch (error) {
              console.error(
                `Error getting stats for event ${event.id}:`,
                error,
              );
              return {
                ...event,
                totalRegistrations: 0,
                activeRegistrations: 0,
                paidRegistrations: 0,
                pendingPayments: 0,
                revenue: 0,
              };
            }
          }),
        );

        res.json(eventsWithStats);
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/events");
      }
    },
  );

  // Admin registrations listing (all admin roles)
  app.get(
    "/api/admin/registrations",
    authenticateSupabase,
    requireAdmin,
    async (req: any, res) => {
      try {
        const { status, eventId, userId, page = 1, limit = 50 } = req.query;

        let registrations = await storage.getAllEventRegistrations();

        // Apply filters
        if (status) {
          registrations = registrations.filter(
            (r) => r.paymentStatus === status,
          );
        }
        if (eventId) {
          registrations = registrations.filter((r) => r.eventId === eventId);
        }
        if (userId) {
          registrations = registrations.filter((r) => r.userId === userId);
        }

        // Sort by creation date (newest first)
        registrations.sort(
          (a, b) =>
            new Date(b.registeredAt || 0).getTime() -
            new Date(a.registeredAt || 0).getTime(),
        );

        // Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedRegistrations = registrations.slice(
          startIndex,
          endIndex,
        );

        // Get additional stats
        const stats = {
          total: registrations.length,
          pending: registrations.filter((r) => r.paymentStatus === "pending")
            .length,
          confirmed: registrations.filter(
            (r) => r.paymentStatus === "confirmed",
          ).length,
          cancelled: registrations.filter(
            (r) => r.paymentStatus === "cancelled",
          ).length,
          totalRevenue: registrations
            .filter((r) => r.hasPaid)
            .reduce((sum, r) => sum + 0, 0), // TODO: Add amount field to registration
        };

        res.json({
          registrations: paginatedRegistrations,
          stats,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: registrations.length,
            pages: Math.ceil(registrations.length / Number(limit)),
          },
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/registrations");
      }
    },
  );

  // Admin event registration endpoint (event manager or super admin)
  app.post(
    "/api/admin/events/register",
    authenticateSupabase,
    requireEventManager,
    async (req: any, res) => {
      try {
        const registrationData = insertEventRegistrationSchema.parse(req.body);

        // Check if user is already registered for this event
        const existingRegistrations = await storage.getEventRegistrationsByUser(
          registrationData.userId,
        );
        const alreadyRegistered = existingRegistrations.some(
          (reg) =>
            reg.eventId === registrationData.eventId &&
            reg.paymentStatus !== "cancelled",
        );
        if (alreadyRegistered) {
          return res
            .status(400)
            .json({ message: "User already registered for this event" });
        }

        // Check if event exists
        const event = await storage.getEvent(registrationData.eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Admin can override capacity limits and set custom payment status
        const registration = await storage.createEventRegistration({
          ...registrationData,
          paymentStatus: registrationData.paymentStatus || "pending",
          hasPaid: registrationData.hasPaid || false,
        });

        console.log(
          `✅ Admin registered user ${registrationData.userId} for event ${registrationData.eventId}`,
        );
        res.status(201).json(registration);
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/events/register");
      }
    },
  );

  // Finance-only updates: payment status and hasPaid
  app.patch(
    "/api/admin/registrations/:registrationId",
    authenticateSupabase,
    requireFinance,
    async (req: any, res) => {
      try {
        const { registrationId } = req.params;
        const updates = req.body;

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          updates,
        );

        console.log(
          `✅ Finance updated registration ${registrationId}:`,
          updates,
        );
        res.json(updatedRegistration);
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/registrations/update");
      }
    },
  );

  // Events CRUD for admins (Super Admin and Event Manager)
  app.post(
    "/api/admin/events",
    authenticateSupabase,
    requireEventManager,
    async (req: any, res) => {
      try {
        const eventData = insertEventSchema.parse(req.body);
        const event = await storage.createEvent(eventData);

        console.log(
          `✅ Event created: ${event.title} by ${req.supabaseUser.email}`,
        );
        res.status(201).json(event);
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/events/create");
      }
    },
  );

  app.patch(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireEventManager,
    async (req: any, res) => {
      try {
        const { eventId } = req.params;
        const updates = req.body;

        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        const updatedEvent = await storage.updateEvent(eventId, updates);

        console.log(
          `✅ Event updated: ${eventId} by ${req.supabaseUser.email}`,
        );
        res.json(updatedEvent);
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/events/update");
      }
    },
  );

  app.delete(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireSuperAdmin, // Only super admin can delete events
    async (req: any, res) => {
      try {
        const { eventId } = req.params;

        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Check for existing registrations
        const registrations =
          await storage.getEventRegistrationsByEvent(eventId);
        const activeRegistrations = registrations.filter(
          (r) => r.paymentStatus !== "cancelled",
        );

        if (activeRegistrations.length > 0) {
          return res.status(400).json({
            message: "Cannot delete event with active registrations",
            activeRegistrations: activeRegistrations.length,
          });
        }

        await storage.deleteEvent(eventId);

        console.log(
          `✅ Event deleted: ${eventId} by ${req.supabaseUser.email}`,
        );
        res.json({ message: "Event deleted successfully" });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/events/delete");
      }
    },
  );

  // Newsletter subscriptions (super admin only)
  app.get(
    "/api/admin/newsletter-subscriptions",
    authenticateSupabase,
    requireSuperAdmin,
    async (req: any, res) => {
      try {
        const subscriptions = await storage.getAllNewsletterSubscriptions();

        const stats = {
          total: subscriptions.length,
          recentSubscriptions: subscriptions.filter((s) => {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return new Date(s.subscribedAt || 0) > oneMonthAgo;
          }).length,
        };

        res.json({
          subscriptions,
          stats,
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/newsletter-subscriptions");
      }
    },
  );

  // Email blast (super admin only) - placeholder for future email functionality
  app.post(
    "/api/admin/email-blast",
    authenticateSupabase,
    requireSuperAdmin,
    async (req: any, res) => {
      try {
        const { subject, content, recipients } = req.body;

        if (!subject || !content) {
          return res
            .status(400)
            .json({ message: "Subject and content required" });
        }

        // TODO: Implement email service integration
        console.log(`📧 Email blast requested by ${req.supabaseUser.email}:`, {
          subject,
          recipientCount: recipients?.length || "all subscribers",
        });

        res.json({
          message: "Email blast functionality not yet implemented",
          details: {
            subject,
            recipientCount: recipients?.length || "all subscribers",
            status: "pending_implementation",
          },
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/email-blast");
      }
    },
  );

  // Payment evidence routes for admins
  app.get(
    "/api/admin/payment-evidence/:evidencePath",
    authenticateSupabase,
    requireFinance,
    async (req: any, res) => {
      try {
        const { evidencePath } = req.params;

        // Validate evidence path format
        const pathParts = evidencePath.split("/");
        if (pathParts.length !== 3) {
          return res
            .status(400)
            .json({ message: "Invalid evidence path format" });
        }

        const [userId, eventId, fileName] = pathParts;

        // Verify the registration exists
        const registrations = await storage.getEventRegistrationsByUser(userId);
        const registration = registrations.find((r) => r.eventId === eventId);

        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        if (registration.paymentEvidence !== evidencePath) {
          return res.status(404).json({ message: "Evidence file not found" });
        }

        // Serve the file
        const filePath = `./attached_assets/${evidencePath}`;

        if (!fs.existsSync(filePath)) {
          return res
            .status(404)
            .json({ message: "Evidence file not found on disk" });
        }

        const mimeType = fileName.endsWith(".pdf")
          ? "application/pdf"
          : fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
            ? "image/jpeg"
            : fileName.endsWith(".png")
              ? "image/png"
              : "application/octet-stream";

        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
        res.sendFile(path.resolve(filePath));
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/payment-evidence");
      }
    },
  );

  // Update payment evidence for admin (finance role)
  app.put(
    "/api/admin/payment-evidence/:registrationId",
    authenticateSupabase,
    requireFinance,
    async (req: any, res) => {
      try {
        const { registrationId } = req.params;

        if (!req.files || !req.files.evidenceFile) {
          return res.status(400).json({ message: "No evidence file provided" });
        }

        const evidenceFile = Array.isArray(req.files.evidenceFile)
          ? req.files.evidenceFile[0]
          : req.files.evidenceFile;

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // File validation
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(evidenceFile.mimetype)) {
          return res.status(400).json({
            message:
              "Invalid file type. Only JPEG, PNG, and PDF files are allowed.",
          });
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (evidenceFile.size > maxSize) {
          return res
            .status(400)
            .json({ message: "File too large. Maximum size is 10MB." });
        }

        // Create directory structure
        const uploadDir = `./attached_assets/${registration.userId}/${registration.eventId}`;

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const fileExtension = path.extname(evidenceFile.name);
        const fileName = `payment_evidence_${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        const evidencePath = `${registration.userId}/${registration.eventId}/${fileName}`;

        // Remove old evidence file if exists
        if (registration.paymentEvidence) {
          const oldFilePath = `./attached_assets/${registration.paymentEvidence}`;
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Save new file
        await evidenceFile.mv(filePath);

        // Update registration
        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentEvidence: evidencePath,
          },
        );

        console.log(
          `✅ Admin updated payment evidence for registration ${registrationId}`,
        );
        res.json({
          message: "Payment evidence updated successfully",
          evidencePath,
          originalName: evidenceFile.name,
        });
      } catch (error: any) {
        handleRouteError(error, req, res, "admin/payment-evidence/update");
      }
    },
  );
}
