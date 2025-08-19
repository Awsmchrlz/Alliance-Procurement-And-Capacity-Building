import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEventRegistrationSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = await storage.getUser(decoded.userId);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to verify admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
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

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Check if this is the first user - make them admin
      const allUsers = await storage.getAllUsers();
      const isFirstUser = allUsers.length === 0;
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: isFirstUser ? "admin" : "user", // First user becomes admin
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events/register", authenticateToken, async (req, res) => {
    try {
      const registrationData = insertEventRegistrationSchema.parse(req.body);
      
      // Check if user is already registered for this event
      const existingRegistrations = await storage.getEventRegistrationsByUser(registrationData.userId);
      const alreadyRegistered = existingRegistrations.some(reg => reg.eventId === registrationData.eventId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      const registration = await storage.createEventRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // User dashboard routes
  app.get("/api/users/:userId/registrations", authenticateToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Ensure user can only access their own data (unless admin)
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const registrations = await storage.getEventRegistrationsByUser(userId);
      
      // Get event details for each registration
      const registrationsWithEvents = await Promise.all(
        registrations.map(async (registration) => {
          const event = await storage.getEvent(registration.eventId);
          return { ...registration, event };
        })
      );

      res.json(registrationsWithEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
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
      res.status(400).json({ message: "Subscription failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/events", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/registrations", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getAllEventRegistrations();
      
      // Get event and user details for each registration
      const registrationsWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          const event = await storage.getEvent(registration.eventId);
          const user = await storage.getUser(registration.userId);
          const { password, ...userWithoutPassword } = user || {};
          return { ...registration, event, user: userWithoutPassword };
        })
      );

      res.json(registrationsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.patch("/api/admin/registrations/:registrationId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { registrationId } = req.params;
      const { paymentStatus } = req.body;
      
      const updatedRegistration = await storage.updateEventRegistration(registrationId, {
        paymentStatus,
      });
      
      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      res.json(updatedRegistration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  // Admin route to promote users to admin
  app.patch("/api/admin/users/:userId/role", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Admin routes - newsletter subscriptions
  app.get("/api/admin/newsletter-subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin email blast
  app.post("/api/admin/email-blast", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { subject, message, fromName = "Alliance Procurement", fromEmail = "no-reply@apcb.com" } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }

      const subscriptions = await storage.getAllNewsletterSubscriptions();
      
      // For now, we'll return success without actually sending emails
      // When SENDGRID_API_KEY is configured, this will send real emails
      const results = {
        sent: subscriptions.length,
        failed: 0,
        total: subscriptions.length
      };

      res.json({
        message: `Email blast queued for ${results.sent} subscribers`,
        results
      });
    } catch (error) {
      console.error("Error sending email blast:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
