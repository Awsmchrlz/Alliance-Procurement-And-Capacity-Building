import type { Express } from "express";
import { createServer, type Server } from "http";
import fileUpload from "express-fileupload";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { EvidenceResolver } from "./evidence-resolver";
import { storage } from "./storage";
import { emailService } from "./email-service";
import {
  insertUserSchema,
  insertEventRegistrationSchema,
  insertNewsletterSubscriptionSchema,
  type RoleValue,
} from "../shared/schema";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const Roles: Record<string, RoleValue> = {
  SuperAdmin: "super_admin",
  Finance: "finance_person",
  EventManager: "event_manager",
  Ordinary: "ordinary_user",
};

// Helper function to check if user has any of the required roles
const hasAnyRole = (
  userRole: RoleValue | undefined,
  allowedRoles: RoleValue[],
): boolean => {
  return userRole ? allowedRoles.includes(userRole) : false;
};

// Authentication middleware

// Middleware: Verify Supabase access token and attach user
const authenticateSupabase = async (req: any, res: any, next: any) => {
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
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
const requireRoles =
  (allowedRoles: RoleValue[]) => (req: any, res: any, next: any) => {
    const role: RoleValue | undefined = req.supabaseRole;
    if (!hasAnyRole(role, allowedRoles)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

export async function registerRoutes(app: Express): Promise<Server> {
  // Add file upload middleware
  app.use(
    fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      abortOnLimit: true,
      useTempFiles: true,
      tempFileDir: "/tmp/",
      debug: false,
    }),
  );

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    console.log("🚀 Starting user registration process...");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    try {
      // Validate request body against schema
      const userData = insertUserSchema.parse(req.body);
      console.log("✅ Request data validated successfully");

      // Check if user already exists by phone number (unique identifier)
      console.log(
        `🔍 Checking if user with phone ${userData.phoneNumber} already exists...`,
      );
      const { emailExists, phoneExists } = await storage.checkUserExists(
        userData.email,
        userData.phoneNumber,
      );

      if (phoneExists) {
        console.log(
          `❌ User with phone ${userData.phoneNumber} already exists`,
        );
        return res.status(400).json({
          message: "Phone number already registered",
          details:
            "A user with this phone number is already registered. Phone numbers must be unique.",
        });
      }

      // Note: Multiple users can share the same email (company emails)
      if (emailExists) {
        console.log(
          `ℹ️ Email ${userData.email} is already in use (shared company email allowed)`,
        );
      } else {
        console.log(`✅ Email ${userData.email} is available`);
      }
      console.log(
        `✅ Phone number ${userData.phoneNumber} is available for registration`,
      );

      // Check if this is the first user (make them super_admin)
      console.log("🔍 Checking if this is the first user...");
      const allUsers = await storage.getAllUsers();
      const isFirstUser = allUsers.length === 0;
      const finalRole = isFirstUser
        ? "super_admin"
        : userData.role || "ordinary_user";
      console.log(
        `📝 User will be assigned role: ${finalRole} (first user: ${isFirstUser})`,
      );

      // Create user in Supabase with role in user_metadata
      console.log("🔨 Creating user account...");
      const user = await storage.createUser({
        ...userData,
        role: finalRole,
      });
      console.log(`✅ User account created successfully: ${user.id}`);

      // Send welcome email to new user (fire-and-forget)
      console.log("📧 Sending welcome email...");
      emailService
        .sendUserWelcomeEmail({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        })
        .then(() => {
          console.log(`✅ Welcome email sent to ${user.email}`);
        })
        .catch((error) => {
          console.error("❌ Failed to send welcome email:", error.message);
        });

      // Send notification to super admins (fire-and-forget)
      if (!isFirstUser) {
        console.log("📧 Sending admin notifications...");
        const superAdmins = allUsers.filter(
          (admin) => admin.role === "super_admin" && admin.email !== user.email,
        );
        const adminEmails = superAdmins.map((admin) => ({
          email: admin.email,
          name: `${admin.firstName} ${admin.lastName}`,
        }));

        if (adminEmails.length > 0) {
          console.log(`📧 Notifying ${adminEmails.length} super admin(s)`);
          emailService
            .notifyAdminsNewUserRegistration(
              {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
              },
              adminEmails,
            )
            .then(() => {
              console.log("✅ Admin notifications sent successfully");
            })
            .catch((error) => {
              console.error(
                "❌ Failed to notify admins of new user:",
                error.message,
              );
            });
        } else {
          console.log("ℹ️ No super admins to notify");
        }
      } else {
        console.log(
          "ℹ️ First user registration - no admin notifications needed",
        );
      }

      console.log(
        `🎉 User ${user.email} registered successfully with ID: ${user.id}`,
      );
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          role: user.role,
          createdAt: user.createdAt,
        },
        message: "Registration successful",
      });
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error stack:", error.stack);

      // Determine error type for better user feedback
      let errorMessage = "Registration failed";
      let errorDetails = error.message || "Invalid user data";

      if (error.message?.includes("duplicate key")) {
        errorMessage = "User already exists";
        errorDetails = "A user with this email address is already registered";
      } else if (error.message?.includes("validation")) {
        errorMessage = "Invalid input data";
        errorDetails = "Please check all required fields are filled correctly";
      } else if (error.message?.includes("auth")) {
        errorMessage = "Authentication setup failed";
        errorDetails =
          "There was an issue setting up your account authentication";
      } else if (
        error.message?.includes("database") ||
        error.message?.includes("insert")
      ) {
        errorMessage = "Database error";
        errorDetails = "There was an issue saving your account information";
      }

      res.status(400).json({
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Promote user to admin (super admin only)
  app.patch(
    "/api/admin/users/:userId/promote",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req: any, res) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = [
          "super_admin",
          "finance_person",
          "event_manager",
          "ordinary_user",
        ];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ message: "Invalid role specified" });
        }

        console.log(`🔄 Promoting user ${userId} to role: ${role}`);

        // Update user metadata in Supabase Auth
        const { data: authData, error: authError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role },
          });

        if (authError) {
          console.error("Error updating user role:", authError.message);
          return res.status(400).json({
            message: "Failed to update user role",
            details: authError.message,
          });
        }

        console.log(`✅ User ${userId} promoted to ${role} successfully`);
        res.json({
          message: "User role updated successfully",
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: authData.user.user_metadata.role,
          },
        });
      } catch (error: any) {
        console.error("Error promoting user:", error);
        res
          .status(500)
          .json({ message: "Internal server error", details: error.message });
      }
    },
  );

  // Get all users with roles (super admin, finance users, and event managers)
  app.get(
    "/api/admin/users",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (req: any, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json({ users });
      } catch (error: any) {
        console.error("Error fetching users:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch users", details: error.message });
      }
    },
  );

  // Admin user registration endpoint (super admin only)
  app.post(
    "/api/admin/users/register",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
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

        // Create user using the same method as regular registration
        // This handles both Supabase Auth and database creation atomically
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
        console.error("Admin user registration error:", error);
        res.status(500).json({
          message: "Failed to create user",
          details: error.message,
        });
      }
    },
  );

  // Find user endpoint for login (to get email from phone number)
  app.post("/api/auth/find-user", async (req, res) => {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ message: "Identifier required" });
      }

      // Find user by email or phone
      const user = await storage.getUserByEmailOrPhone(identifier);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return only the email (needed for Supabase auth)
      res.json({ email: user.email });
    } catch (error) {
      console.error("Find user error:", error);
      res.status(500).json({ message: "Failed to find user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res
          .status(400)
          .json({ message: "Email/phone and password required" });
      }

      console.log(`🔐 Login attempt with identifier: ${identifier}`);

      // Find user by email or phone
      const user = await storage.getUserByEmailOrPhone(identifier);
      if (!user) {
        console.log(`❌ No user found with identifier: ${identifier}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`✅ User found: ${user.email} (${user.phoneNumber})`);

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res
          .status(500)
          .json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey);
      // Always use email for Supabase auth (since that's what was used during registration)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (error || !data.user) {
        console.log(`❌ Supabase auth failed: ${error?.message}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`✅ Login successful for user: ${user.email}`);
      res.json({ user, token: data.session.access_token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Events routes
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      console.log(`✅ Events API: Returned ${events?.length || 0} events`);
      res.json(events);
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post(
    "/api/events/register",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        console.log("🔍 Registration Request Debug:", {
          headers: {
            authorization: req.headers.authorization ? "Present" : "Missing",
            contentType: req.headers["content-type"],
          },
          body: req.body,
          authUser: {
            id: req.supabaseUser?.id,
            email: req.supabaseUser?.email,
            role: req.supabaseRole,
          },
        });

        const registrationData = insertEventRegistrationSchema.parse(req.body);

        console.log("🔍 Registration Data Parsed:", {
          bodyUserId: registrationData.userId,
          authUserId: req.supabaseUser.id,
          userEmail: req.supabaseUser.email,
          eventId: registrationData.eventId,
          match: registrationData.userId === req.supabaseUser.id,
        });

        // Ensure the user is registering themselves
        if (registrationData.userId !== req.supabaseUser.id) {
          console.log("❌ User ID mismatch:", {
            provided: registrationData.userId,
            authenticated: req.supabaseUser.id,
          });
          return res
            .status(403)
            .json({ message: "Can only register for yourself" });
        }

        // Check if user is already registered for this event (excluding cancelled registrations)
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
            .json({ message: "Already registered for this event" });
        }

        // Check if event exists
        const eventData = await storage.getEvent(registrationData.eventId);
        if (!eventData) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Force paymentStatus to 'pending' for all new user-initiated registrations
        const registration = await storage.createEventRegistration({
          ...registrationData,
          notes: "", // Always use empty string for notes
          paymentStatus: "pending",
          hasPaid: false,
        });

        console.log("✅ Registration created:", {
          id: registration.id,
          userId: registration.userId,
          registrationNumber: registration.registrationNumber,
          eventId: registration.eventId,
        });

        // Get user and event details for email notifications
        const user = await storage.getUser(registrationData.userId);
        const eventDetails = await storage.getEvent(registrationData.eventId);

        if (user && eventDetails) {
          // Send confirmation email to user (fire-and-forget)
          emailService
            .sendEventRegistrationConfirmation({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              eventTitle: eventDetails.title,
              eventDate: eventDetails.startDate,
              registrationNumber: registration.registrationNumber,
              organization: registrationData.organization,
              country: registrationData.country,
            })
            .catch((emailError) => {
              console.error(
                "Failed to send registration confirmation email:",
                emailError.message,
              );
            });

          // Notify super admins and event managers about new registration (fire-and-forget)
          const allUsers = await storage.getAllUsers();
          const adminEmails = allUsers
            .filter(
              (u) => u.role === "super_admin" || u.role === "event_manager",
            )
            .map((admin) => ({
              email: admin.email,
              name: `${admin.firstName} ${admin.lastName}`,
            }));

          if (adminEmails.length > 0) {
            emailService
              .notifyAdminsNewEventRegistration(
                {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  eventTitle: eventDetails.title,
                  eventDate: eventDetails.startDate,
                  registrationNumber: registration.registrationNumber,
                  organization: registrationData.organization,
                  country: registrationData.country,
                },
                adminEmails,
              )
              .catch((emailError) => {
                console.error(
                  "Failed to notify admins about event registration:",
                  emailError.message,
                );
              });
          }
        }

        res.status(201).json(registration);
      } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ message: "Registration failed" });
      }
    },
  );

  // Admin event registration endpoint (event manager or super admin)
  app.post(
    "/api/admin/events/register",
    authenticateSupabase,
    requireRoles([Roles.EventManager, Roles.SuperAdmin]),
    async (req: any, res) => {
      try {
        const {
          userId,
          eventId,
          country,
          organization,
          position,
          notes,
          hasPaid,
          paymentStatus,
        } = req.body;

        // Validate required fields
        if (!userId || !eventId || !country || !organization || !position) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user exists
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check if event exists
        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is already registered for this event (excluding cancelled registrations)
        const existingRegistrations =
          await storage.getEventRegistrationsByUser(userId);
        const existingRegistration = existingRegistrations.find(
          (reg) => reg.eventId === eventId && reg.paymentStatus !== "cancelled",
        );

        console.log(
          `🔍 Checking registration for user ${userId} and event ${eventId}`,
        );
        console.log(
          `📊 Found ${existingRegistrations.length} total registrations for user`,
        );
        console.log(
          `🎯 Existing registration for this event:`,
          existingRegistration,
        );

        if (existingRegistration) {
          console.log(
            `❌ User already registered with status: ${existingRegistration.paymentStatus}`,
          );
          return res.status(400).json({
            message: "User is already registered for this event",
            existingRegistration: {
              id: existingRegistration.id,
              registrationNumber: existingRegistration.registrationNumber,
              paymentStatus: existingRegistration.paymentStatus,
              registeredAt: existingRegistration.registeredAt,
            },
          });
        }

        // Ensure payment consistency based on database constraint
        // If hasPaid is true, paymentStatus must be 'paid'
        // If hasPaid is false, paymentStatus must be 'pending' or 'cancelled'
        const finalHasPaid = hasPaid || false;
        let finalPaymentStatus = paymentStatus || "pending";

        // Enforce constraint: if hasPaid is true, status must be 'paid'
        if (finalHasPaid && finalPaymentStatus !== "paid") {
          finalPaymentStatus = "paid";
          console.log(
            `⚠️ Adjusted paymentStatus to 'paid' because hasPaid is true`,
          );
        }
        // Enforce constraint: if hasPaid is false, status must be 'pending' or 'cancelled'
        else if (!finalHasPaid && finalPaymentStatus === "paid") {
          finalPaymentStatus = "pending";
          console.log(
            `⚠️ Adjusted paymentStatus to 'pending' because hasPaid is false`,
          );
        }

        console.log(
          `💰 Payment details: hasPaid=${finalHasPaid}, paymentStatus=${finalPaymentStatus}`,
        );

        // Create registration
        const registration = await storage.createEventRegistration({
          eventId,
          userId,
          country,
          organization,
          position,
          notes: "", // Always use empty string for notes
          hasPaid: finalHasPaid,
          paymentStatus: finalPaymentStatus,
          paymentEvidence: null,
          dinnerGalaAttendance: false,
        });

        console.log(`✅ Admin registered user ${userId} for event ${eventId}`);
        res.status(201).json({
          message: "Registration created successfully",
          registration: {
            id: registration.id,
            eventId: registration.eventId,
            userId: registration.userId,
            paymentStatus: registration.paymentStatus,
            registeredAt: registration.registeredAt,
          },
        });
      } catch (error: any) {
        console.error("Admin event registration error:", error);
        res.status(500).json({
          message: "Failed to create registration",
          details: error.message,
        });
      }
    },
  );

  // Sponsorship registration endpoint (public)
  app.post("/api/sponsorships/register", async (req, res) => {
    try {
      const sponsorshipData = req.body;

      // Validate required fields
      if (
        !sponsorshipData.eventId ||
        !sponsorshipData.companyName ||
        !sponsorshipData.contactPerson ||
        !sponsorshipData.email ||
        !sponsorshipData.phoneNumber ||
        !sponsorshipData.sponsorshipLevel
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if event exists
      const event = await storage.getEvent(sponsorshipData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Create sponsorship application
      const sponsorship = await storage.createSponsorship(sponsorshipData);

      // Send confirmation email to applicant (fire-and-forget)
      emailService
        .sendSponsorshipConfirmation({
          companyName: sponsorship.companyName,
          contactPerson: sponsorship.contactPerson,
          email: sponsorship.email,
          sponsorshipLevel: sponsorship.sponsorshipLevel,
          amount: sponsorship.amount,
          eventTitle: event.title,
          eventDate: format(new Date(event.startDate), "MMM d, yyyy"),
        })
        .catch((emailError) => {
          console.error(
            "Failed to send sponsorship confirmation email:",
            emailError.message,
          );
        });

      console.log(
        `✅ Sponsorship application submitted for event ${sponsorshipData.eventId}`,
      );
      res.status(201).json({
        message: "Sponsorship application submitted successfully",
        sponsorship: {
          id: sponsorship.id,
          companyName: sponsorship.companyName,
          sponsorshipLevel: sponsorship.sponsorshipLevel,
          status: sponsorship.status,
          submittedAt: sponsorship.submittedAt,
        },
      });
    } catch (error: any) {
      console.error("Sponsorship registration error:", error);
      res.status(500).json({
        message: "Failed to submit sponsorship application",
        details: error.message,
      });
    }
  });

  // Exhibition registration endpoint (public)
  app.post("/api/exhibitions/register", async (req, res) => {
    try {
      const exhibitionData = req.body;

      // Validate required fields
      if (
        !exhibitionData.eventId ||
        !exhibitionData.companyName ||
        !exhibitionData.contactPerson ||
        !exhibitionData.email ||
        !exhibitionData.phoneNumber
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if event exists
      const event = await storage.getEvent(exhibitionData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check for existing exhibition registration with same email/phone for this event
      const existingExhibitions = await storage.getExhibitionsByUserEmail(
        exhibitionData.email,
      );
      const alreadyRegistered = existingExhibitions.some(
        (exhibition) =>
          exhibition.eventId === exhibitionData.eventId &&
          (exhibition.email === exhibitionData.email ||
            exhibition.phoneNumber === exhibitionData.phoneNumber) &&
          exhibition.paymentStatus !== "cancelled",
      );

      if (alreadyRegistered) {
        return res.status(400).json({
          message: "Already registered for this event",
          details:
            "A registration already exists with this email or phone number for this event.",
        });
      }

      // Create exhibition application
      const exhibition = await storage.createExhibition(exhibitionData);

      // Send confirmation email to applicant (fire-and-forget)
      emailService
        .sendExhibitionConfirmation({
          companyName: exhibition.companyName,
          contactPerson: exhibition.contactPerson,
          email: exhibition.email,
          amount: exhibition.amount,
          eventTitle: event.title,
          eventDate: format(new Date(event.startDate), "MMM d, yyyy"),
        })
        .catch((emailError) => {
          console.error(
            "Failed to send exhibition confirmation email:",
            emailError.message,
          );
        });

      console.log(
        `✅ Exhibition application submitted for event ${exhibitionData.eventId}`,
      );
      res.status(201).json({
        message: "Exhibition application submitted successfully",
        exhibition: {
          id: exhibition.id,
          companyName: exhibition.companyName,
          boothSize: exhibition.boothSize,
          status: exhibition.status,
          submittedAt: exhibition.submittedAt,
        },
      });
    } catch (error: any) {
      console.error("Exhibition registration error:", error);
      res.status(500).json({
        message: "Failed to submit exhibition application",
        details: error.message,
      });
    }
  });

  // Get all sponsorships (admin only)
  app.get(
    "/api/admin/sponsorships",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (req, res) => {
      try {
        const sponsorships = await storage.getAllSponsorships();
        res.json({ sponsorships });
      } catch (error: any) {
        console.error("Error fetching sponsorships:", error);
        res.status(500).json({
          message: "Failed to fetch sponsorships",
          details: error.message,
        });
      }
    },
  );

  // Get all exhibitions (admin only)
  app.get(
    "/api/admin/exhibitions",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (req, res) => {
      try {
        const exhibitions = await storage.getAllExhibitions();
        res.json({ exhibitions });
      } catch (error: any) {
        console.error("Error fetching exhibitions:", error);
        res.status(500).json({
          message: "Failed to fetch exhibitions",
          details: error.message,
        });
      }
    },
  );

  // Public showcase endpoints for approved exhibitions and sponsorships only
  app.get("/api/showcase/sponsorships", async (req, res) => {
    try {
      const sponsorships = await storage.getAllSponsorships();
      // Filter only approved sponsorships
      const approvedSponsorships = sponsorships.filter(
        (s: any) => s.status === "approved" || s.status === "Approved",
      );
      res.json(approvedSponsorships);
    } catch (error: any) {
      console.error("Error fetching approved sponsorships:", error);
      res.status(500).json({
        message: "Failed to fetch approved sponsorships",
        details: error.message,
      });
    }
  });

  app.get("/api/showcase/exhibitions", async (req, res) => {
    try {
      const exhibitions = await storage.getAllExhibitions();
      // Filter only approved exhibitions
      const approvedExhibitions = exhibitions.filter(
        (e: any) => e.status === "approved" || e.status === "Approved",
      );
      res.json(approvedExhibitions);
    } catch (error: any) {
      console.error("Error fetching approved exhibitions:", error);
      res.status(500).json({
        message: "Failed to fetch approved exhibitions",
        details: error.message,
      });
    }
  });

  // Update sponsorship status (admin only)
  app.patch(
    "/api/admin/sponsorships/:id/status",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const updatedSponsorship = await storage.updateSponsorshipStatus(
          id,
          status,
          paymentStatus,
        );

        res.json({
          message: "Sponsorship status updated successfully",
          sponsorship: updatedSponsorship,
        });
      } catch (error: any) {
        console.error("Error updating sponsorship status:", error);
        res.status(500).json({
          message: "Failed to update sponsorship status",
          details: error.message,
        });
      }
    },
  );

  // Update exhibition status (admin only)
  app.patch(
    "/api/admin/exhibitions/:id/status",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const updatedExhibition = await storage.updateExhibitionStatus(
          id,
          status,
          paymentStatus,
        );

        res.json({
          message: "Exhibition status updated successfully",
          exhibition: updatedExhibition,
        });
      } catch (error: any) {
        console.error("Error updating exhibition status:", error);
        res.status(500).json({
          message: "Failed to update exhibition status",
          details: error.message,
        });
      }
    },
  );

  // Update sponsorship logo (admin only)
  app.patch(
    "/api/admin/sponsorships/:id/logo",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { logoPath } = req.body;

        if (!logoPath) {
          return res.status(400).json({ message: "Logo path is required" });
        }

        await storage.updateSponsorshipLogo(id, logoPath);
        res.json({ message: "Sponsorship logo updated successfully" });
      } catch (error: any) {
        console.error("Error updating sponsorship logo:", error);
        res.status(500).json({
          message: "Failed to update sponsorship logo",
          details: error.message,
        });
      }
    },
  );

  // Update exhibition logo (admin only)
  app.patch(
    "/api/admin/exhibitions/:id/logo",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { logoPath } = req.body;

        if (!logoPath) {
          return res.status(400).json({ message: "Logo path is required" });
        }

        await storage.updateExhibitionLogo(id, logoPath);
        res.json({ message: "Exhibition logo updated successfully" });
      } catch (error: any) {
        console.error("Error updating exhibition logo:", error);
        res.status(500).json({
          message: "Failed to update exhibition logo",
          details: error.message,
        });
      }
    },
  );

  // Logo upload endpoint (admin only)
  app.post(
    "/api/admin/upload-logo",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req: any, res) => {
      try {
        const files = req.files;
        const { type, id } = req.body;

        console.log("🚀 Logo upload request received:", { type, id });
        console.log("📁 Files received:", files ? Object.keys(files) : "none");

        if (!files || !files.file || !type || !id) {
          console.error("❌ Missing required fields:", {
            files: !!files,
            type,
            id,
          });
          return res
            .status(400)
            .json({ message: "File, type, and ID are required" });
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        console.log("📄 File details:", {
          name: file.name,
          size: file.size,
          mimetype: file.mimetype,
        });

        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `${type}_logo_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const filePath = `${type}s/${id}/logos/${fileName}`;

        console.log("📁 Generated file path:", filePath);

        // Create Supabase client
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Supabase server credentials not configured" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Upload to Supabase storage
        console.log("☁️ Uploading to Supabase storage...");
        const { data, error } = await supabaseAdmin.storage
          .from("payment-evidence")
          .upload(filePath, file.data, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.mimetype,
          });

        if (error) {
          console.error("❌ Storage upload error:", error);
          return res
            .status(500)
            .json({ message: "Failed to upload file", details: error.message });
        }

        console.log("✅ File uploaded successfully to storage:", data?.path);

        console.log("📤 Returning file path to client:", filePath);
        res.json({ filePath, message: "File uploaded successfully" });
      } catch (error: any) {
        console.error("❌ Error uploading logo:", error);
        console.error("❌ Error stack:", error.stack);
        res
          .status(500)
          .json({ message: "Failed to upload logo", details: error.message });
      }
    },
  );

  // Public endpoints for showcase (get all data for filtering on frontend)
  app.get("/api/showcase/sponsorships", async (req, res) => {
    try {
      const sponsorships = await storage.getAllSponsorships();
      console.log(
        "🔍 Showcase API returning sponsorships:",
        sponsorships.length,
        "items",
      );
      res.json(sponsorships);
    } catch (error: any) {
      console.error("Error fetching sponsorships for showcase:", error);
      res.status(500).json({ message: "Failed to fetch sponsorships" });
    }
  });

  app.get("/api/showcase/exhibitions", async (req, res) => {
    try {
      const exhibitions = await storage.getAllExhibitions();
      console.log(
        "🔍 Showcase API returning exhibitions:",
        exhibitions.length,
        "items",
      );
      res.json(exhibitions);
    } catch (error: any) {
      console.error("Error fetching exhibitions for showcase:", error);
      res.status(500).json({ message: "Failed to fetch exhibitions" });
    }
  });

  // Newsletter sending endpoint
  app.post(
    "/api/admin/newsletter/send",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        // Check if user has admin privileges
        const userRole =
          req.supabaseUser?.user_metadata?.role || req.supabaseUser?.role;
        if (
          !["super_admin", "finance_person", "event_manager"].includes(userRole)
        ) {
          return res.status(403).json({ message: "Admin privileges required" });
        }

        const { subject, content, recipients } = req.body;

        if (!subject || !content || !recipients || !Array.isArray(recipients)) {
          return res
            .status(400)
            .json({ message: "Subject, content, and recipients are required" });
        }

        // For now, we'll simulate email sending
        // In a real implementation, you would integrate with an email service like Resend, SendGrid, etc.
        console.log(
          `Sending newsletter: "${subject}" to ${recipients.length} recipients`,
        );

        // Simulate async email sending
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Log newsletter activity
        console.log("Newsletter sent successfully:", {
          subject,
          recipientCount: recipients.length,
          sentBy: req.supabaseUser.email,
          sentAt: new Date().toISOString(),
        });

        res.json({
          success: true,
          message: `Newsletter sent to ${recipients.length} recipients`,
          subject,
          recipientCount: recipients.length,
        });
      } catch (error) {
        console.error("Newsletter sending error:", error);
        res.status(500).json({ message: "Failed to send newsletter" });
      }
    },
  );

  // Registration confirmation email (stub)
  app.post("/api/notifications/registration-confirmation", async (req, res) => {
    try {
      const { email, eventId, fullName } = req.body;
      if (!email || !eventId || !fullName) {
        return res
          .status(400)
          .json({ message: "Email, eventId, and fullName required" });
      }

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Log email details (replace with SendGrid integration when ready)
      console.log(`📧 Sending confirmation email to: ${email}`);
      console.log(`   Event ID: ${eventId}`);
      console.log(`   Event Title: ${event.title}`);
      console.log(`   Full Name: ${fullName}`);

      // TODO: Integrate SendGrid
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: 'no-reply@apcb.com',
        subject: 'Event Registration Confirmation - Alliance Procurement',
        text: `Hello ${fullName},\n\nYour registration for "${event.title}" has been confirmed!\n\nEvent Details:\n- Event ID: ${eventId}\n- Date: ${event.startDate}\n- Location: ${event.location}\n\nWe will send more details closer to the event date.\n\nBest regards,\nAlliance Procurement Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1C356B; color: white; padding: 20px; text-align: center;">
              <h1>Alliance Procurement</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #1C356B;">Registration Confirmed! 🎉</h2>
              <p>Hello ${fullName},</p>
              <p>Your registration for <strong>${event.title}</strong> has been successfully confirmed!</p>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>Event Details:</strong><br>
                <strong>Event ID:</strong> ${eventId}<br>
                <strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}<br>
                <strong>Location:</strong> ${event.location}<br>
              </div>
              <p>We will send you detailed event information closer to the event date.</p>
              <p>If you have any questions, please contact us.</p>
              <p style="margin-top: 30px;">Best regards,<br><strong>Alliance Procurement Team</strong></p>
            </div>
          </div>
        `
      };
      await sgMail.send(msg);
      */

      res.json({ success: true, message: "Email queued for sending" });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ message: "Failed to send confirmation" });
    }
  });

  // User dashboard routes
  app.get(
    "/api/users/:userId/registrations",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { userId } = req.params;

        console.log("🔍 Fetching registrations debug:", {
          requestedUserId: userId,
          authUserId: req.supabaseUser.id,
          authUserEmail: req.supabaseUser.email,
          userRole: req.supabaseRole,
        });

        // Ensure user can only access their own data (unless admin)
        if (
          req.supabaseRole !== "super_admin" &&
          req.supabaseRole !== "finance_person" &&
          req.supabaseUser.id !== userId
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        const registrations = await storage.getEventRegistrationsByUser(userId);
        console.log("📋 Found registrations:", {
          userId,
          count: registrations.length,
          registrationIds: registrations.map((r) => r.id),
        });
        const registrationsWithEvents = await Promise.all(
          registrations.map(async (registration) => {
            const event = await storage.getEvent(registration.eventId);
            return { ...registration, event };
          }),
        );

        res.json(registrationsWithEvents);
      } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
      }
    },
  );

  // Get user exhibitions by email
  app.get(
    "/api/users/:userId/exhibitions",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { userId } = req.params;

        // Ensure user can only access their own data (unless admin)
        if (
          req.supabaseRole !== "super_admin" &&
          req.supabaseRole !== "finance_person" &&
          req.supabaseUser.id !== userId
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Get user email from their profile
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const exhibitions = await storage.getExhibitionsByUserEmail(user.email);
        console.log(
          `✅ Exhibitions API: Returned ${exhibitions?.length || 0} exhibitions for user ${userId}`,
        );
        res.json(exhibitions);
      } catch (error) {
        console.error("Error fetching user exhibitions:", error);
        res.status(500).json({ message: "Failed to fetch exhibitions" });
      }
    },
  );

  app.patch(
    "/api/users/:userId/registrations/:registrationId/cancel",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { userId, registrationId } = req.params;

        // Ensure user can only cancel their own registrations (unless admin)
        if (
          req.supabaseRole !== "super_admin" &&
          req.supabaseRole !== "finance_person" &&
          req.supabaseUser.id !== userId
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // Check if user owns this registration
        if (
          req.supabaseRole !== "super_admin" &&
          req.supabaseRole !== "finance_person" &&
          registration.userId !== userId
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Check if registration is already cancelled
        if (registration.paymentStatus === "cancelled") {
          return res
            .status(400)
            .json({ message: "Registration is already cancelled" });
        }

        await storage.cancelEventRegistration(registrationId);
        res.json({ message: "Registration cancelled successfully" });
      } catch (error) {
        console.error("Error cancelling registration:", error);
        res.status(500).json({ message: "Failed to cancel registration" });
      }
    },
  );

  // Keep DELETE endpoint for actual deletion (admin only)
  app.delete(
    "/api/users/:userId/registrations/:registrationId",
    authenticateSupabase,
    requireRoles(["super_admin"]),
    async (req: any, res) => {
      try {
        const { userId, registrationId } = req.params;

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        await storage.deleteEventRegistration(registrationId);
        res.json({ message: "Registration deleted successfully" });
      } catch (error) {
        console.error("Error deleting registration:", error);
        res.status(500).json({ message: "Failed to delete registration" });
      }
    },
  );

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(
        req.body,
      );

      // Check if email is already subscribed
      const existingSubscription =
        await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      if (existingSubscription) {
        // If already subscribed, just return success (don't fail the registration)
        return res.status(200).json({
          message: "Already subscribed",
          subscription: existingSubscription,
        });
      }

      const subscription =
        await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ message: "Subscription failed" });
    }
  });

  // Admin routes
  // Admin events listing (all admin roles)
  app.get(
    "/api/admin/events",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (_req, res) => {
      try {
        const events = await storage.getAllEvents();
        res.json(events);
      } catch (error) {
        console.error("Error fetching admin events:", error);
        res.status(500).json({ message: "Failed to fetch events" });
      }
    },
  );

  // Admin registrations listing (all admin roles)
  app.get(
    "/api/admin/registrations",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (_req, res) => {
      try {
        const registrations = await storage.getAllEventRegistrations();
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin =
          supabaseUrl && serviceRoleKey
            ? createClient(supabaseUrl, serviceRoleKey)
            : null;

        const registrationsWithDetails = await Promise.all(
          registrations.map(async (registration) => {
            const event = await storage.getEvent(registration.eventId);
            let user: any = undefined;
            if (supabaseAdmin) {
              try {
                const { data } = await supabaseAdmin.auth.admin.getUserById(
                  registration.userId,
                );
                const u = data?.user;
                if (u) {
                  user = {
                    id: u.id,
                    email: u.email,
                    firstName: u.user_metadata?.first_name || "",
                    lastName: u.user_metadata?.last_name || "",
                  };
                }
              } catch {}
            }
            return { ...registration, event, user };
          }),
        );

        res.json(registrationsWithDetails);
      } catch (error) {
        console.error("Error fetching admin registrations:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
      }
    },
  );

  // Finance-only updates: payment status and hasPaid
  app.patch(
    "/api/admin/registrations/:registrationId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req, res) => {
      try {
        const { registrationId } = req.params;
        const { paymentStatus, hasPaid } = req.body;

        if (!paymentStatus && hasPaid === undefined) {
          return res.status(400).json({ message: "No updates provided" });
        }

        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentStatus,
            hasPaid,
          },
        );

        if (!updatedRegistration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        res.json(updatedRegistration);
      } catch (error) {
        console.error("Error updating registration:", error);
        res.status(500).json({ message: "Failed to update registration" });
      }
    },
  );

  // Role updates (super admin only)
  app.patch(
    "/api/admin/users/:userId/role",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;

        if (
          !role ||
          ![
            "super_admin",
            "finance_person",
            "event_manager",
            "ordinary_user",
          ].includes(role)
        ) {
          return res.status(400).json({ message: "Invalid role" });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Supabase server credentials not configured" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { role },
          },
        );

        if (error) {
          throw error;
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
    },
  );

  // Newsletter subscriptions (super admin only)

  // Email blast (super admin only)
  app.post(
    "/api/admin/email-blast",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const {
          subject,
          message,
          fromName = "Alliance Procurement",
          fromEmail = "no-reply@apcb.com",
        } = req.body;

        if (!subject || !message) {
          return res
            .status(400)
            .json({ message: "Subject and message are required" });
        }

        const users = await storage.getAllUsers();

        // Log email blast details (replace with SendGrid when ready)
        console.log(
          `📧 Sending email blast to ${users.length} registered users`,
        );
        console.log(`   Subject: ${subject}`);
        console.log(`   From: ${fromName} <${fromEmail}>`);

        // TODO: Integrate SendGrid
        /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const messages = users.map(user => ({
        to: user.email,
        from: { email: fromEmail, name: fromName },
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif;">${message}</div>`,
      }));
      await sgMail.send(messages);
      */

        res.json({
          message: `Email blast queued for ${users.length} users`,
          results: {
            sent: users.length,
            failed: 0,
            total: users.length,
          },
        });
      } catch (error) {
        console.error("Error sending email blast:", error);
        res.status(500).json({ message: "Failed to send email blast" });
      }
    },
  );

  // Optional: Direct file serving route (keeping your existing implementation)
  app.get(
    "/evidence/:userId/:eventId/:fileName",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { userId, eventId, fileName } = req.params;
        const filePath = `evidence/${userId || ""}/${eventId || ""}/${fileName || ""}`;

        // Check if user can access this file (own file or admin)
        const canAccess =
          req.supabaseUser.id === userId ||
          req.supabaseRole === "super_admin" ||
          req.supabaseRole === "finance_person";

        if (!canAccess) {
          return res.status(403).json({ message: "Access denied" });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Supabase server credentials not configured" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const bucket = "payment-evidence";

        // Get the file from Supabase storage
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .download(filePath);

        if (error) {
          console.error("File download error:", error);
          return res.status(404).json({ message: "File not found" });
        }

        if (!data) {
          return res.status(404).json({ message: "File not found" });
        }

        // Convert blob to buffer
        const buffer = Buffer.from(await data.arrayBuffer());

        // Set appropriate content type based on file extension
        const ext = fileName.toLowerCase().split(".").pop();
        let contentType = "application/octet-stream";

        switch (ext) {
          case "pdf":
            contentType = "application/pdf";
            break;
          case "jpg":
          case "jpeg":
            contentType = "image/jpeg";
            break;
          case "png":
            contentType = "image/png";
            break;
          case "doc":
            contentType = "application/msword";
            break;
          case "docx":
            contentType =
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            break;
        }

        // Set headers for inline viewing (browser will try to display the file)
        res.set({
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        });

        res.send(buffer);
      } catch (error) {
        console.error("Error serving evidence file:", error);
        res.status(500).json({ message: "Failed to serve file" });
      }
    },
  );

  // PAYMENT EVIDENCE ROUTE - Enhanced with better error handling
  app.get(
    "/api/admin/evidence/:evidencePath",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (req: any, res) => {
      try {
        const { evidencePath } = req.params;
        const decodedPath = decodeURIComponent(evidencePath);

        console.log(`🔍 Admin fetching evidence from path: ${decodedPath}`);
        console.log(`🔍 Path segments:`, decodedPath.split("/"));
        console.log(`🔍 Path length:`, decodedPath.split("/").length);

        if (!decodedPath) {
          console.log(`❌ No evidence path provided`);
          return res.status(400).json({ message: "Evidence path is required" });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          console.error("❌ Missing Supabase credentials");
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const bucket = "payment-evidence";

        console.log(`🪣 Using bucket: ${bucket}`);
        console.log(`📂 File path: ${decodedPath}`);

        // Try to download the file directly using the provided path
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .download(decodedPath || "");

        if (error) {
          console.error(`❌ Storage download error:`, error);

          // Try alternative path formats if the direct path fails
          // Enhanced to handle multiple structures: evidence/, sponsorships/, exhibitions/
          const alternativePaths = [
            decodedPath.replace("/storage/v1/object/", ""),
            decodedPath.replace("/storage/v1/object/public/", ""),
            decodedPath.replace("public/", ""),
            // Handle direct paths as-is (for sponsorships/eventId/filename, exhibitions/eventId/filename)
            decodedPath.includes("/") && decodedPath.split("/").length >= 2
              ? decodedPath
              : null,
            // Handle the evidence structure: evidence/userId/eventId/filename
            decodedPath.includes("/") && decodedPath.split("/").length >= 3
              ? decodedPath
              : null,
            // If path doesn't start with evidence/, try adding it for paths with proper structure
            !decodedPath.startsWith("evidence/") &&
            !decodedPath.startsWith("sponsorships/") &&
            !decodedPath.startsWith("exhibitions/") &&
            decodedPath.includes("/") &&
            decodedPath.split("/").length >= 3
              ? `evidence/${decodedPath}`
              : null,
            // For sponsorships and exhibitions, ensure they're tried as-is
            decodedPath.startsWith("sponsorships/") ||
            decodedPath.startsWith("exhibitions/")
              ? decodedPath
              : null,
            // Last 3 parts: userId/eventId/filename (for backwards compatibility)
            decodedPath.split("/").slice(-3).join("/"),
            `evidence/${decodedPath.split("/").slice(-3).join("/")}`, // Ensure evidence prefix
            // Add evidence prefix if missing (for backwards compatibility)
            decodedPath.startsWith("evidence/")
              ? decodedPath
              : `evidence/${decodedPath}`,
          ].filter(Boolean); // Remove null values

          console.log(`🔄 Trying alternative paths:`, alternativePaths);

          for (const altPath of alternativePaths) {
            try {
              console.log(`🔄 Attempting: ${altPath}`);
              const { data: altData, error: altError } =
                await supabaseAdmin.storage
                  .from(bucket)
                  .download(altPath as string);

              if (!altError && altData) {
                console.log(`✅ Success with alternative path: ${altPath}`);
                const buffer = Buffer.from(await altData.arrayBuffer());
                const filename = altPath?.split("/").pop() || "evidence";
                const ext = filename.toLowerCase().split(".").pop() || "";

                let contentType = "application/octet-stream";
                if (ext === "pdf") contentType = "application/pdf";
                else if (["jpg", "jpeg"].includes(ext || ""))
                  contentType = "image/jpeg";
                else if (ext === "png") contentType = "image/png";

                res.set({
                  "Content-Type": contentType,
                  "Content-Disposition": `inline; filename="${filename}"`,
                  "Cache-Control": "private, max-age=3600",
                });

                return res.send(buffer);
              }
            } catch (altErr) {
              console.log(`❌ Alternative path failed: ${altPath}`, altErr);
            }
          }

          return res.status(404).json({
            message: "Evidence file not found in storage",
            details: error.message,
            attemptedPaths: alternativePaths,
          });
        }

        if (!data) {
          console.log(`❌ No data returned from storage`);
          return res.status(404).json({ message: "Evidence file not found" });
        }

        console.log(`✅ File downloaded successfully`);
        const buffer = Buffer.from(await data.arrayBuffer());
        const filename = decodedPath.split("/").pop() || "evidence";
        const ext = filename.toLowerCase().split(".").pop() || "";

        let contentType = "application/octet-stream";
        if (ext === "pdf") contentType = "application/pdf";
        else if (["jpg", "jpeg"].includes(ext || ""))
          contentType = "image/jpeg";
        else if (ext === "png") contentType = "image/png";

        res.set({
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600",
        });

        res.send(buffer);
      } catch (error: any) {
        console.error("❌ Evidence error:", error);
        res.status(500).json({
          message: "Server error while fetching evidence",
          details: error.message,
        });
      }
    },
  );
  // Route to get payment evidence for users (their own evidence only)
  app.get(
    "/api/users/evidence/:evidencePath",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { evidencePath } = req.params;
        const decodedPath = decodeURIComponent(evidencePath);
        const userId = req.supabaseUser.id;

        console.log(
          `🔍 User ${userId} fetching evidence from path: ${decodedPath}`,
        );

        if (!decodedPath) {
          console.log(`❌ No evidence path provided`);
          return res.status(400).json({ message: "Evidence path is required" });
        }

        // Verify the user owns this evidence by checking if it contains their user ID
        if (!decodedPath.includes(userId)) {
          console.log(
            `❌ User ${userId} trying to access evidence not owned by them`,
          );
          console.log(
            `❌ Path: ${decodedPath} does not contain userId: ${userId}`,
          );
          return res
            .status(403)
            .json({ message: "Access denied to this evidence" });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          console.error("❌ Missing Supabase credentials");
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const bucket = "payment-evidence";

        console.log(`🪣 Using bucket: ${bucket}`);
        console.log(`📂 File path: ${decodedPath}`);

        // Try to download the file directly using the provided path
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .download(decodedPath || "");

        if (error) {
          console.error(`❌ Storage download error:`, error);

          // Try alternative path formats if the direct path fails
          // Updated to handle the new structure: evidence/userId/eventId/filename
          const alternativePaths = [
            decodedPath.replace("/storage/v1/object/", ""),
            decodedPath.replace("/storage/v1/object/public/", ""),
            decodedPath.replace("public/", ""),
            // Handle the new structure: evidence/userId/eventId/filename
            decodedPath.includes("/") && decodedPath.split("/").length >= 3
              ? decodedPath
              : null,
            // If path doesn't start with evidence/, try adding it for paths with proper structure
            !decodedPath.startsWith("evidence/") &&
            decodedPath.includes("/") &&
            decodedPath.split("/").length >= 3
              ? `evidence/${decodedPath}`
              : null,
            // Last 3 parts: userId/eventId/filename (for backwards compatibility)
            decodedPath.split("/").slice(-3).join("/"),
            `evidence/${decodedPath.split("/").slice(-3).join("/")}`, // Ensure evidence prefix
            // Add evidence prefix if missing (for backwards compatibility)
            decodedPath.startsWith("evidence/")
              ? decodedPath
              : `evidence/${decodedPath}`,
          ].filter(Boolean); // Remove null values

          console.log(`🔄 Trying alternative paths:`, alternativePaths);

          for (const altPath of alternativePaths) {
            try {
              console.log(`🔄 Attempting: ${altPath}`);

              // Verify the user still owns this evidence in the alternative path
              if (!(altPath as string).includes(userId)) {
                console.log(
                  `❌ Alternative path ${altPath} doesn't contain user ID ${userId}`,
                );
                continue;
              }

              const { data: altData, error: altError } =
                await supabaseAdmin.storage
                  .from(bucket)
                  .download(altPath as string);

              if (!altError && altData) {
                console.log(`✅ Success with alternative path: ${altPath}`);
                const buffer = Buffer.from(await altData.arrayBuffer());
                const filename = altPath?.split("/").pop() || "evidence";
                const ext = filename.toLowerCase().split(".").pop() || "";

                let contentType = "application/octet-stream";
                if (ext === "pdf") contentType = "application/pdf";
                else if (["jpg", "jpeg"].includes(ext || ""))
                  contentType = "image/jpeg";
                else if (ext === "png") contentType = "image/png";

                res.set({
                  "Content-Type": contentType,
                  "Content-Disposition": `inline; filename="${filename}"`,
                  "Cache-Control": "private, max-age=3600",
                });

                return res.send(buffer);
              }
            } catch (altErr) {
              console.log(`❌ Alternative path failed: ${altPath}`, altErr);
            }
          }

          return res.status(404).json({
            message: "Evidence file not found in storage",
            details: error.message,
            attemptedPaths: alternativePaths,
          });
        }

        if (!data) {
          console.log(`❌ No data returned from storage`);
          return res.status(404).json({ message: "Evidence file not found" });
        }

        console.log(`✅ File downloaded successfully for user ${userId}`);
        const buffer = Buffer.from(await data.arrayBuffer());
        const filename = decodedPath.split("/").pop() || "evidence";
        const ext = filename.toLowerCase().split(".").pop() || "";

        let contentType = "application/octet-stream";
        if (ext === "pdf") contentType = "application/pdf";
        else if (["jpg", "jpeg"].includes(ext || ""))
          contentType = "image/jpeg";
        else if (ext === "png") contentType = "image/png";

        res.set({
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600",
        });

        res.send(buffer);
      } catch (error: any) {
        console.error("❌ User evidence error:", error);
        res.status(500).json({
          message: "Server error while fetching evidence",
          details: error.message,
        });
      }
    },
  );

  // Route to update payment evidence for users (their own evidence only)
  app.put(
    "/api/users/evidence/:registrationId",
    authenticateSupabase,
    async (_req: any, res) => {
      return res
        .status(403)
        .json({ message: "Evidence updates are restricted to finance" });
    },
  );

  // Route to update payment evidence for admins
  app.put(
    "/api/admin/evidence/:registrationId",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const { registrationId } = req.params;
        const { evidenceFile } = req.body;

        if (!evidenceFile) {
          return res.status(400).json({ message: "Evidence file is required" });
        }

        console.log(`🔄 Updating evidence for registration: ${registrationId}`);

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // Check if registration is cancelled
        if (registration.paymentStatus === "cancelled") {
          return res.status(400).json({
            message: "Cannot update evidence for cancelled registration",
          });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return res
            .status(500)
            .json({ message: "Server configuration error" });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const bucket = "payment-evidence";

        // Generate new file path
        const fileExtension = evidenceFile.name.split(".").pop();
        const newFileName = `evidence_${Date.now()}.${fileExtension}`;
        const newFilePath = `evidence/${registration.userId}/${registration.eventId}/${newFileName}`;

        // Upload new evidence file
        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucket)
          .upload(newFilePath, evidenceFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: evidenceFile.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error(`❌ Upload error:`, uploadError);
          return res
            .status(500)
            .json({ message: "Failed to upload new evidence file" });
        }

        // Delete old evidence file if it exists
        if (registration.paymentEvidence) {
          try {
            await supabaseAdmin.storage
              .from(bucket)
              .remove([registration.paymentEvidence]);
            console.log(
              `🗑️ Deleted old evidence: ${registration.paymentEvidence}`,
            );
          } catch (deleteError) {
            console.warn(`⚠️ Failed to delete old evidence:`, deleteError);
            // Don't fail the update if deletion fails
          }
        }

        // Update registration with new evidence path
        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentEvidence: newFilePath,
          },
        );

        if (!updatedRegistration) {
          return res
            .status(500)
            .json({ message: "Failed to update registration" });
        }

        console.log(`✅ Evidence updated successfully: ${newFilePath}`);
        res.json({
          message: "Evidence updated successfully",
          registration: updatedRegistration,
          newEvidencePath: newFilePath,
        });
      } catch (error: any) {
        console.error("❌ Evidence update error:", error);
        res.status(500).json({
          message: "Server error while updating evidence",
          details: error.message,
        });
      }
    },
  );

  // Events CRUD for admins (Super Admin and Event Manager)
  app.post(
    "/api/admin/events",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req: any, res) => {
      try {
        const event = await storage.createEvent(req.body);

        // Send notification to all users about new event (fire-and-forget)
        const allUsers = await storage.getAllUsers();
        const userEmails = allUsers.map((user) => ({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        }));

        if (userEmails.length > 0) {
          emailService
            .sendEventCreationNotification(
              {
                eventTitle: event.title,
                eventDescription: event.description,
                eventDate: event.startDate,
                eventLocation: event.location || "TBA",
                eventPrice: event.price,
              },
              userEmails,
            )
            .catch((emailError: any) => {
              console.error(
                "Failed to send event creation notifications:",
                emailError.message,
              );
            });
        }

        console.log(
          `✅ Event "${event.title}" created successfully by ${req.supabaseUser.email}`,
        );
        res.status(201).json(event);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: "Failed to create event", details: error.message });
      }
    },
  );

  app.patch(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req, res) => {
      try {
        const updated = await storage.updateEvent(req.params.eventId, req.body);
        if (!updated)
          return res.status(404).json({ message: "Event not found" });
        res.json(updated);
      } catch (error: any) {
        res
          .status(400)
          .json({ message: "Failed to update event", details: error.message });
      }
    },
  );

  app.delete(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req, res) => {
      try {
        const ok = await storage.deleteEvent(req.params.eventId);
        if (!ok) return res.status(404).json({ message: "Event not found" });
        res.json({ success: true });
      } catch (error: any) {
        res
          .status(400)
          .json({ message: "Failed to delete event", details: error.message });
      }
    },
  );

  // Email campaign endpoint with user removal functionality
  app.post(
    "/api/email/campaign",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req: any, res) => {
      try {
        const {
          recipients,
          subject,
          content,
          recipientType,
          excludedUsers = [],
        } = req.body;

        if (!recipients || !subject || !content || !recipientType) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({ message: "No recipients provided" });
        }

        // Filter out excluded users
        const filteredRecipients = recipients.filter(
          (recipient) =>
            !excludedUsers.some(
              (excluded: any) =>
                excluded.email === recipient.email ||
                excluded.id === recipient.id,
            ),
        );

        if (filteredRecipients.length === 0) {
          return res
            .status(400)
            .json({ message: "No recipients remaining after exclusions" });
        }

        // Generate HTML template for the email
        const htmlContent = emailService.generateCampaignTemplate(
          subject,
          content,
          "This email was sent to you as a member of our platform.",
        );

        // Send the campaign email
        await emailService.sendCampaignEmail(
          filteredRecipients,
          subject,
          htmlContent,
          content.replace(/<[^>]*>/g, ""), // Strip HTML for text version
        );

        console.log(
          `📧 Email campaign sent to ${filteredRecipients.length} recipients (${recipients.length - filteredRecipients.length} excluded) by ${req.supabaseUser.email}`,
        );

        res.status(200).json({
          message: "Email campaign sent successfully",
          recipientCount: filteredRecipients.length,
          excludedCount: recipients.length - filteredRecipients.length,
          recipientType,
        });
      } catch (error: any) {
        console.error("Email campaign error:", error);
        res.status(500).json({
          message: "Failed to send email campaign",
          details: error.message,
        });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
