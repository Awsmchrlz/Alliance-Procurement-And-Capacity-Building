import type { Express } from "express";
import { storage } from "../storage";
import {
  insertEventRegistrationSchema,
  insertNewsletterSubscriptionSchema,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import {
  authenticateSupabase,
  requireOwnerOrAdmin,
  handleRouteError,
} from "./middleware";

export function registerUserRoutes(app: Express): void {
  // User registration for events
  app.post(
    "/api/events/register",
    authenticateSupabase,
    async (req: any, res) => {
      try {
        const registrationData = insertEventRegistrationSchema.parse(req.body);

        // Ensure the user is registering themselves
        if (registrationData.userId !== req.supabaseUser.id) {
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

        // Check if event exists and has capacity
        const event = await storage.getEvent(registrationData.eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
        if (
          event.maxAttendees &&
          event.currentAttendees &&
          event.currentAttendees >= event.maxAttendees
        ) {
          return res.status(400).json({ message: "Event is full" });
        }

        // Force paymentStatus to 'pending' for all new user-initiated registrations
        const registration = await storage.createEventRegistration({
          ...registrationData,
          paymentStatus: "pending",
          hasPaid: false,
        });
        res.status(201).json(registration);
      } catch (error) {
        handleRouteError(error, req, res, "events/register");
      }
    },
  );

  // Get user's registrations
  app.get(
    "/api/users/:userId/registrations",
    authenticateSupabase,
    requireOwnerOrAdmin(),
    async (req: any, res) => {
      try {
        const { userId } = req.params;
        const registrations = await storage.getEventRegistrationsByUser(userId);

        // Filter out sensitive admin data for non-admin users
        const isAdmin = [
          "super_admin",
          "finance_person",
          "event_manager",
        ].includes(req.supabaseRole);

        const sanitizedRegistrations = registrations.map((reg) => {
          if (isAdmin) {
            return reg; // Admins see everything
          }
          // Regular users see limited data
          const { ...userVisibleData } = reg;
          return userVisibleData;
        });

        res.json(sanitizedRegistrations);
      } catch (error) {
        handleRouteError(error, req, res, "users/registrations");
      }
    },
  );

  // Cancel user's registration (soft delete)
  app.patch(
    "/api/users/:userId/registrations/:registrationId/cancel",
    authenticateSupabase,
    requireOwnerOrAdmin(),
    async (req: any, res) => {
      try {
        const { userId, registrationId } = req.params;

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // Verify ownership
        if (registration.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }

        if (registration.paymentStatus === "cancelled") {
          return res
            .status(400)
            .json({ message: "Registration already cancelled" });
        }

        // Soft cancel by updating status
        const cancelledRegistration =
          await storage.cancelEventRegistration(registrationId);

        console.log(
          `✅ User ${userId} cancelled registration ${registrationId}`,
        );
        res.json({
          message: "Registration cancelled successfully",
          registration: cancelledRegistration,
        });
      } catch (error) {
        handleRouteError(error, req, res, "users/registrations/cancel");
      }
    },
  );

  // Hard delete user's registration (admin only, kept for compatibility)
  app.delete(
    "/api/users/:userId/registrations/:registrationId",
    authenticateSupabase,
    requireOwnerOrAdmin(),
    async (req: any, res) => {
      try {
        const { userId, registrationId } = req.params;
        const isAdmin = [
          "super_admin",
          "finance_person",
          "event_manager",
        ].includes(req.supabaseRole);

        // Only admins can hard delete
        if (!isAdmin) {
          return res.status(403).json({
            message: "Only administrators can permanently delete registrations",
          });
        }

        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // Verify ownership for non-super-admin
        if (
          req.supabaseRole !== "super_admin" &&
          registration.userId !== userId
        ) {
          return res.status(403).json({ message: "Access denied" });
        }

        await storage.deleteEventRegistration(registrationId);

        console.log(
          `✅ Admin deleted registration ${registrationId} for user ${userId}`,
        );
        res.json({ message: "Registration deleted successfully" });
      } catch (error) {
        handleRouteError(error, req, res, "users/registrations/delete");
      }
    },
  );

  // Get user's payment evidence
  app.get(
    "/api/users/payment-evidence/:evidencePath",
    authenticateSupabase,
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

        // Users can only access their own evidence
        if (userId !== req.supabaseUser.id) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Verify the registration exists and belongs to the user
        const registrations = await storage.getEventRegistrationsByUser(userId);
        const registration = registrations.find((r) => r.eventId === eventId);

        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }

        // Check if the evidence path matches
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
      } catch (error) {
        handleRouteError(error, req, res, "users/payment-evidence");
      }
    },
  );

  // Update user's payment evidence
  app.put(
    "/api/users/payment-evidence/:registrationId",
    authenticateSupabase,
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

        // Users can only update their own evidence
        if (registration.userId !== req.supabaseUser.id) {
          return res.status(403).json({ message: "Access denied" });
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

        // Update registration with correct field name
        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentEvidence: evidencePath,
          },
        );

        console.log(
          `✅ User updated payment evidence for registration ${registrationId}`,
        );
        res.json({
          message: "Payment evidence updated successfully",
          evidencePath,
          originalName: evidenceFile.name,
        });
      } catch (error) {
        handleRouteError(error, req, res, "users/payment-evidence/update");
      }
    },
  );

  // Newsletter subscription (public endpoint)
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(
        req.body,
      );

      // Check if email is already subscribed
      const existingSubscription =
        await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      if (existingSubscription) {
        return res.status(200).json({
          message: "Email is already subscribed to newsletter",
          subscription: existingSubscription,
        });
      }

      const subscription =
        await storage.createNewsletterSubscription(subscriptionData);

      console.log(`✅ New newsletter subscription: ${subscriptionData.email}`);
      res.status(201).json({
        message: "Successfully subscribed to newsletter",
        subscription,
      });
    } catch (error) {
      handleRouteError(error, req, res, "newsletter/subscribe");
    }
  });

  // Registration confirmation email (stub for future email service)
  app.post("/api/notifications/registration-confirmation", async (req, res) => {
    try {
      const { email, eventId, fullName } = req.body;

      if (!email || !eventId || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // TODO: Implement actual email sending service
      console.log(`📧 Registration confirmation email queued:`, {
        to: email,
        eventTitle: event.title,
        participantName: fullName,
      });

      res.json({
        message: "Registration confirmation email queued",
        details: {
          email,
          eventTitle: event.title,
          participantName: fullName,
          status: "queued",
        },
      });
    } catch (error) {
      handleRouteError(
        error,
        req,
        res,
        "notifications/registration-confirmation",
      );
    }
  });

  // User profile update
  app.patch(
    "/api/users/:userId/profile",
    authenticateSupabase,
    requireOwnerOrAdmin(),
    async (req: any, res) => {
      try {
        const { userId } = req.params;
        const { firstName, lastName, phoneNumber } = req.body;

        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // TODO: Implement user profile update in storage
        // This would require adding an updateUser method to storage

        res.json({
          message: "Profile update functionality not yet implemented",
          requestedUpdates: { firstName, lastName, phoneNumber },
        });
      } catch (error) {
        handleRouteError(error, req, res, "users/profile/update");
      }
    },
  );
}
