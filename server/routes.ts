import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // Assumes storage.ts from my previous response
import { insertUserSchema, insertEventRegistrationSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Middleware: Verify Supabase access token and attach user
const authenticateSupabase = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ message: "Supabase server credentials not configured" });
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.supabaseUser = data.user;
    req.supabaseRole = data.user.user_metadata?.role || "ordinary_user";
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware: Verify admin role based on Supabase metadata
const requireSupabaseAdmin = (req: any, res: any, next: any) => {
  const role = req.supabaseRole;
  if (role !== "super_admin" && role !== "finance_person") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
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
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ message: "Supabase server credentials not configured" });
      }

      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = await storage.getUser(data.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

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
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events/register", authenticateSupabase, async (req: any, res) => {
    try {
      const registrationData = insertEventRegistrationSchema.parse(req.body);

      // Ensure the user is registering themselves
      if (registrationData.userId !== req.supabaseUser.id) {
        return res.status(403).json({ message: "Can only register for yourself" });
      }

      // Check if user is already registered for this event
      const existingRegistrations = await storage.getEventRegistrationsByUser(registrationData.userId);
      const alreadyRegistered = existingRegistrations.some(reg => reg.eventId === registrationData.eventId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      // Check if event exists and has capacity
      const event = await storage.getEvent(registrationData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
        return res.status(400).json({ message: "Event is full" });
      }

      const registration = await storage.createEventRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Registration confirmation email (stub)
  app.post("/api/notifications/registration-confirmation", async (req, res) => {
    try {
      const { email, eventId, fullName } = req.body;
      if (!email || !eventId || !fullName) {
        return res.status(400).json({ message: "Email, eventId, and fullName required" });
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
  app.get("/api/users/:userId/registrations", authenticateSupabase, async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Ensure user can only access their own data (unless admin)
      if (req.supabaseRole !== "super_admin" && req.supabaseRole !== "finance_person" && req.supabaseUser.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const registrations = await storage.getEventRegistrationsByUser(userId);
      const registrationsWithEvents = await Promise.all(
        registrations.map(async (registration) => {
          const event = await storage.getEvent(registration.eventId);
          return { ...registration, event };
        })
      );

      res.json(registrationsWithEvents);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.delete("/api/users/:userId/registrations/:registrationId", authenticateSupabase, async (req: any, res) => {
    try {
      const { userId, registrationId } = req.params;

      // Ensure user can only cancel their own registrations (unless admin)
      if (req.supabaseRole !== "super_admin" && req.supabaseRole !== "finance_person" && req.supabaseUser.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const registration = await storage.getEventRegistration(registrationId);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      // Check if user owns this registration
      if (req.supabaseRole !== "super_admin" && req.supabaseRole !== "finance_person" && registration.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteEventRegistration(registrationId);
      res.json({ message: "Registration cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling registration:", error);
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);

      // Check if email is already subscribed
      const existingSubscription = await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      if (existingSubscription) {
        return res.status(400).json({ message: "Email already subscribed" });
      }

      const subscription = await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ message: "Subscription failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/events", authenticateSupabase, requireSupabaseAdmin, async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching admin events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/admin/users", authenticateSupabase, requireSupabaseAdmin, async (_req, res) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ message: "Supabase server credentials not configured" });
      }

      const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const allUsers: any[] = [];
      const perPage = 1000;
      let page = 1;

      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) {
          throw error;
        }
        const batch = data.users || [];
        if (batch.length === 0) break;
        allUsers.push(...batch);
        if (batch.length < perPage) break;
        page += 1;
      }

      const mappedUsers = await Promise.all(
        allUsers.map(async (u: any) => {
          const user = await storage.getUser(u.id);
          return user || {
            id: u.id,
            email: u.email || "",
            firstName: u.user_metadata?.first_name || "",
            lastName: u.user_metadata?.last_name || "",
            phoneNumber: u.user_metadata?.phone_number || "",
            role: u.user_metadata?.role || "ordinary_user",
            createdAt: u.created_at,
          };
        })
      );

      res.json(mappedUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/registrations", authenticateSupabase, requireSupabaseAdmin, async (_req, res) => {
    try {
      const registrations = await storage.getAllEventRegistrations();
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseAdmin = supabaseUrl && serviceRoleKey ? createSupabaseClient(supabaseUrl, serviceRoleKey) : null;

      const registrationsWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          const event = await storage.getEvent(registration.eventId);
          let user: any = undefined;
          if (supabaseAdmin) {
            try {
              const { data } = await supabaseAdmin.auth.admin.getUserById(registration.userId);
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
        })
      );

      res.json(registrationsWithDetails);
    } catch (error) {
      console.error("Error fetching admin registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.patch("/api/admin/registrations/:registrationId", authenticateSupabase, requireSupabaseAdmin, async (req, res) => {
    try {
      const { registrationId } = req.params;
      const { paymentStatus, hasPaid } = req.body;

      if (!paymentStatus && hasPaid === undefined) {
        return res.status(400).json({ message: "No updates provided" });
      }

      const updatedRegistration = await storage.updateEventRegistration(registrationId, {
        paymentStatus,
        hasPaid,
      });

      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      res.json(updatedRegistration);
    } catch (error) {
      console.error("Error updating registration:", error);
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  app.patch("/api/admin/users/:userId/role", authenticateSupabase, requireSupabaseAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !["super_admin", "finance_person", "ordinary_user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ message: "Supabase server credentials not configured" });
      }

      const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role },
      });

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get("/api/admin/newsletter-subscriptions", authenticateSupabase, requireSupabaseAdmin, async (_req, res) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/admin/email-blast", authenticateSupabase, requireSupabaseAdmin, async (req, res) => {
    try {
      const { subject, message, fromName = "Alliance Procurement", fromEmail = "no-reply@apcb.com" } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      const subscriptions = await storage.getAllNewsletterSubscriptions();

      // Log email blast details (replace with SendGrid when ready)
      console.log(`📧 Sending email blast to ${subscriptions.length} subscribers`);
      console.log(`   Subject: ${subject}`);
      console.log(`   From: ${fromName} <${fromEmail}>`);

      // TODO: Integrate SendGrid
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const messages = subscriptions.map(sub => ({
        to: sub.email,
        from: { email: fromEmail, name: fromName },
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif;">${message}</div>`,
      }));
      await sgMail.send(messages);
      */

      res.json({
        message: `Email blast queued for ${subscriptions.length} subscribers`,
        results: { sent: subscriptions.length, failed: 0, total: subscriptions.length },
      });
    } catch (error) {
      console.error("Error sending email blast:", error);
      res.status(500).json({ message: "Failed to send email blast" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}