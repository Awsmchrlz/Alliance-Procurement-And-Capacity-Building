var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and service role key must be provided");
}
var supabase = createClient(supabaseUrl, supabaseKey);
var storage = {
  async generateRegistrationNumber() {
    try {
      const { count, error } = await supabase.from("event_registrations").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Error getting registration count:", error);
        throw error;
      }
      const nextNumber = (count || 0) + 1;
      return nextNumber.toString().padStart(4, "0");
    } catch (error) {
      console.error("Error generating registration number:", error);
      throw error;
    }
  },
  async getUser(id) {
    try {
      const { data: userData, error: userError } = await supabase.from("users").select("id, first_name, last_name, phone_number, created_at").eq("id", id).single();
      if (userError || !userData) {
        console.error(
          "Error fetching user from users table:",
          userError?.message
        );
        return void 0;
      }
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);
      if (authError || !authData.user) {
        console.error("Error fetching auth user:", authError?.message);
        return void 0;
      }
      return {
        id: userData.id,
        email: authData.user.email || "",
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: authData.user.user_metadata?.role || "ordinary_user",
        createdAt: userData.created_at
      };
    } catch (error) {
      console.error("Error in getUser:", error.message);
      return void 0;
    }
  },
  async getUserByEmail(email) {
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error("Error fetching auth users:", authError.message);
        return void 0;
      }
      const authUser = authUsers.users.find((u) => u.email === email);
      if (!authUser) {
        return void 0;
      }
      const { data: userData, error: userError } = await supabase.from("users").select("id, first_name, last_name, phone_number, created_at").eq("id", authUser.id).single();
      if (userError || !userData) {
        console.error(
          "Error fetching user by email from users table:",
          userError?.message
        );
        return void 0;
      }
      return {
        id: userData.id,
        email: authUser.email || "",
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: authUser.user_metadata?.role || "ordinary_user",
        createdAt: userData.created_at
      };
    } catch (error) {
      console.error("Error in getUserByEmail:", error.message);
      return void 0;
    }
  },
  async createUser(user) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          role: user.role || "ordinary_user",
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber
        }
      });
      if (authError) {
        console.error("Error creating auth user:", authError.message);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
      const { data, error } = await supabase.from("users").insert({
        id: authData.user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber
      }).select("id, first_name, last_name, phone_number, created_at").single();
      if (error) {
        console.error("Error creating user in users table:", error.message);
        throw new Error(`Failed to create user: ${error.message}`);
      }
      return {
        id: data.id,
        email: user.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number,
        role: user.role || "ordinary_user",
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error in createUser:", error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },
  async getAllUsers() {
    try {
      const { data: userData, error: userError } = await supabase.from("users").select("id, first_name, last_name, phone_number, created_at");
      if (userError) {
        console.error("Error fetching all users:", userError.message);
        throw new Error(`Failed to fetch users: ${userError.message}`);
      }
      const users2 = await Promise.all(
        userData.map(async (u) => {
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(u.id);
          if (authError) {
            console.error(
              `Error fetching auth user ${u.id}:`,
              authError.message
            );
            return void 0;
          }
          return {
            id: u.id,
            email: authData.user.email || "",
            firstName: u.first_name,
            lastName: u.last_name,
            phoneNumber: u.phone_number,
            role: authData.user.user_metadata?.role || "ordinary_user",
            createdAt: u.created_at ? new Date(u.created_at) : null
          };
        })
      );
      return users2.filter((u) => u !== void 0);
    } catch (error) {
      console.error("Error in getAllUsers:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },
  async getEvent(id) {
    try {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error) {
        console.error("Error fetching event:", error.message);
        return void 0;
      }
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        location: data.location,
        price: data.price,
        maxAttendees: data.max_attendees,
        currentAttendees: data.current_attendees,
        imageUrl: data.image_url,
        tags: data.tags,
        featured: data.featured,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error in getEvent:", error.message);
      return void 0;
    }
  },
  async getAllEvents() {
    try {
      const { data, error } = await supabase.from("events").select("*").order("start_date");
      if (error) {
        console.error("Error fetching all events:", error.message);
        throw new Error(`Failed to fetch events: ${error.message}`);
      }
      return data.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.start_date,
        endDate: e.end_date,
        location: e.location,
        price: e.price,
        maxAttendees: e.max_attendees,
        currentAttendees: e.current_attendees,
        imageUrl: e.image_url,
        tags: e.tags,
        featured: e.featured,
        createdAt: e.created_at
      }));
    } catch (error) {
      console.error("Error in getAllEvents:", error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  },
  async createEvent(event) {
    try {
      const { data, error } = await supabase.from("events").insert({
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        end_date: event.endDate,
        location: event.location,
        price: event.price,
        max_attendees: event.maxAttendees,
        image_url: event.imageUrl,
        tags: event.tags,
        featured: event.featured
      }).select().single();
      if (error) {
        console.error("Error creating event:", error.message);
        throw new Error(`Failed to create event: ${error.message}`);
      }
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        location: data.location,
        price: data.price,
        maxAttendees: data.max_attendees,
        currentAttendees: data.current_attendees,
        imageUrl: data.image_url,
        tags: data.tags,
        featured: data.featured,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error in createEvent:", error.message);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },
  async updateEvent(id, updates) {
    try {
      const { data, error } = await supabase.from("events").update({
        title: updates.title,
        description: updates.description,
        start_date: updates.startDate,
        end_date: updates.endDate,
        location: updates.location,
        price: updates.price,
        max_attendees: updates.maxAttendees,
        current_attendees: updates.currentAttendees,
        image_url: updates.imageUrl,
        tags: updates.tags,
        featured: updates.featured
      }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating event:", error.message);
        return void 0;
      }
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        location: data.location,
        price: data.price,
        maxAttendees: data.max_attendees,
        currentAttendees: data.current_attendees,
        imageUrl: data.image_url,
        tags: data.tags,
        featured: data.featured,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error in updateEvent:", error.message);
      return void 0;
    }
  },
  async deleteEvent(id) {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        console.error("Error deleting event:", error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error in deleteEvent:", error.message);
      return false;
    }
  },
  async getEventRegistration(id) {
    try {
      const { data, error } = await supabase.from("event_registrations").select("*").eq("id", id).single();
      if (error) {
        console.error("Error fetching event registration:", error.message);
        return void 0;
      }
      return {
        id: data.id,
        registrationNumber: data.registration_number,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,
        title: data.title,
        gender: data.gender,
        country: data.country,
        organization: data.organization,
        organizationType: data.organization_type,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        registeredAt: data.registered_at
      };
    } catch (error) {
      console.error("Error in getEventRegistration:", error.message);
      return void 0;
    }
  },
  async getEventRegistrationsByUser(userId) {
    try {
      const { data, error } = await supabase.from("event_registrations").select("*").eq("user_id", userId);
      if (error) {
        console.error("Error fetching user registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map((r) => ({
        id: r.id,
        registrationNumber: r.registration_number,
        eventId: r.event_id,
        userId: r.user_id,
        paymentStatus: r.payment_status,
        title: r.title,
        gender: r.gender,
        country: r.country,
        organization: r.organization,
        organizationType: r.organization_type,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        registeredAt: r.registered_at
      }));
    } catch (error) {
      console.error("Error in getEventRegistrationsByUser:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },
  async getEventRegistrationsByEvent(eventId) {
    try {
      const { data, error } = await supabase.from("event_registrations").select("*").eq("event_id", eventId);
      if (error) {
        console.error("Error fetching event registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map((r) => ({
        id: r.id,
        registrationNumber: r.registration_number,
        eventId: r.event_id,
        userId: r.user_id,
        paymentStatus: r.payment_status,
        title: r.title,
        gender: r.gender,
        country: r.country,
        organization: r.organization,
        organizationType: r.organization_type,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        registeredAt: r.registered_at
      }));
    } catch (error) {
      console.error("Error in getEventRegistrationsByEvent:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },
  async getAllEventRegistrations() {
    try {
      const { data, error } = await supabase.from("event_registrations").select("*");
      if (error) {
        console.error("Error fetching all registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map((r) => ({
        id: r.id,
        registrationNumber: r.registration_number,
        eventId: r.event_id,
        userId: r.user_id,
        paymentStatus: r.payment_status,
        title: r.title,
        gender: r.gender,
        country: r.country,
        organization: r.organization,
        organizationType: r.organization_type,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        registeredAt: r.registered_at
      }));
    } catch (error) {
      console.error("Error in getAllEventRegistrations:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },
  async createEventRegistration(registration) {
    try {
      const registrationNumber = await this.generateRegistrationNumber();
      const { data, error } = await supabase.from("event_registrations").insert({
        registration_number: registrationNumber,
        event_id: registration.eventId,
        user_id: registration.userId,
        payment_status: registration.paymentStatus || "pending",
        title: registration.title,
        gender: registration.gender,
        country: registration.country,
        organization: registration.organization,
        organization_type: registration.organizationType,
        position: registration.position,
        notes: registration.notes,
        has_paid: registration.hasPaid || false,
        payment_evidence: registration.paymentEvidence
      }).select().single();
      if (error) {
        console.error("Error creating event registration:", error.message);
        throw new Error(`Failed to create registration: ${error.message}`);
      }
      await supabase.rpc("increment_attendees", { event_id: registration.eventId }).then(({ error: rpcError }) => {
        if (rpcError)
          console.error("Error incrementing attendees:", rpcError.message);
      });
      return {
        id: data.id,
        registrationNumber: data.registration_number,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,
        title: data.title,
        gender: data.gender,
        country: data.country,
        organization: data.organization,
        organizationType: data.organization_type,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        registeredAt: data.registered_at
      };
    } catch (error) {
      console.error("Error in createEventRegistration:", error.message);
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  },
  async updateEventRegistration(id, updates) {
    try {
      const { data, error } = await supabase.from("event_registrations").update({
        payment_status: updates.paymentStatus,
        title: updates.title,
        gender: updates.gender,
        country: updates.country,
        organization: updates.organization,
        organization_type: updates.organizationType,
        position: updates.position,
        notes: updates.notes,
        has_paid: updates.hasPaid,
        payment_evidence: updates.paymentEvidence
      }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating event registration:", error.message);
        return void 0;
      }
      return {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,
        title: data.title,
        gender: data.gender,
        country: data.country,
        organization: data.organization,
        organizationType: data.organization_type,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        registrationNumber: data.registration_number,
        registeredAt: data.registered_at
      };
    } catch (error) {
      console.error("Error in updateEventRegistration:", error.message);
      return void 0;
    }
  },
  async cancelEventRegistration(id) {
    try {
      const { data: regData, error: regError } = await supabase.from("event_registrations").select("event_id").eq("id", id).single();
      if (regError) {
        console.error(
          "Error fetching registration for cancellation:",
          regError.message
        );
        throw new Error(`Failed to fetch registration: ${regError.message}`);
      }
      const { error: updateError } = await supabase.from("event_registrations").update({
        payment_status: "cancelled",
        has_paid: false
      }).eq("id", id);
      if (updateError) {
        console.error(
          "Error cancelling event registration:",
          updateError.message
        );
        throw new Error(
          `Failed to cancel registration: ${updateError.message}`
        );
      }
      await supabase.rpc("decrement_attendees", { event_id: regData.event_id }).then(({ error }) => {
        if (error)
          console.error("Error decrementing attendees:", error.message);
      });
    } catch (error) {
      console.error("Error in cancelEventRegistration:", error.message);
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
  },
  async deleteEventRegistration(id) {
    try {
      const { data: regData, error: regError } = await supabase.from("event_registrations").select("event_id, payment_evidence").eq("id", id).single();
      if (regError) {
        console.error(
          "Error fetching registration for deletion:",
          regError.message
        );
        throw new Error(`Failed to fetch registration: ${regError.message}`);
      }
      if (regData.payment_evidence) {
        const { error: storageError } = await supabase.storage.from("registrations").remove([regData.payment_evidence]);
        if (storageError) {
          console.error(
            "Error deleting payment evidence:",
            storageError.message
          );
          throw new Error(
            `Failed to delete payment evidence: ${storageError.message}`
          );
        }
      }
      const { error: deleteError } = await supabase.from("event_registrations").delete().eq("id", id);
      if (deleteError) {
        console.error(
          "Error deleting event registration:",
          deleteError.message
        );
        throw new Error(
          `Failed to delete registration: ${deleteError.message}`
        );
      }
      await supabase.rpc("decrement_attendees", { event_id: regData.event_id }).then(({ error }) => {
        if (error)
          console.error("Error decrementing attendees:", error.message);
      });
    } catch (error) {
      console.error("Error in deleteEventRegistration:", error.message);
      throw new Error(`Failed to delete registration: ${error.message}`);
    }
  },
  async createNewsletterSubscription(subscription) {
    try {
      const { data, error } = await supabase.from("newsletter_subscriptions").insert({
        email: subscription.email,
        name: subscription.name
      }).select().single();
      if (error) {
        console.error("Error creating newsletter subscription:", error.message);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at
      };
    } catch (error) {
      console.error("Error in createNewsletterSubscription:", error.message);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },
  async getNewsletterSubscriptionByEmail(email) {
    try {
      const { data, error } = await supabase.from("newsletter_subscriptions").select("*").eq("email", email).single();
      if (error) {
        console.error("Error fetching newsletter subscription:", error.message);
        return void 0;
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at
      };
    } catch (error) {
      console.error(
        "Error in getNewsletterSubscriptionByEmail:",
        error.message
      );
      return void 0;
    }
  },
  async getAllNewsletterSubscriptions() {
    try {
      const { data, error } = await supabase.from("newsletter_subscriptions").select("*");
      if (error) {
        console.error(
          "Error fetching all newsletter subscriptions:",
          error.message
        );
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }
      return data.map((s) => ({
        id: s.id,
        email: s.email,
        name: s.name,
        subscribedAt: s.subscribed_at
      }));
    } catch (error) {
      console.error("Error in getAllNewsletterSubscriptions:", error.message);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
  }
};

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  decimal,
  integer
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").notNull().default("admin"),
  // user or admin
  createdAt: timestamp("created_at").defaultNow()
});
var events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationNumber: text("registration_number").notNull().unique(),
  // Auto-incrementing registration number
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: varchar("event_id").notNull().references(() => events.id),
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending, paid, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
  // Additional registration fields
  title: text("title"),
  // mr, dr, etc.
  gender: text("gender"),
  country: text("country"),
  organization: text("organization"),
  organizationType: text("organization_type"),
  position: text("position"),
  notes: text("notes"),
  hasPaid: boolean("has_paid").default(false),
  paymentEvidence: text("payment_evidence")
  // URL to uploaded file
});
var newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: timestamp("subscribed_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  currentAttendees: true
});
var insertEventRegistrationSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  title: z.string(),
  gender: z.string(),
  country: z.string(),
  organization: z.string(),
  organizationType: z.string(),
  position: z.string(),
  notes: z.string().optional().nullable(),
  hasPaid: z.boolean().optional().default(false),
  paymentStatus: z.enum(["pending", "paid", "cancelled"]).optional().default("pending"),
  paymentMethod: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  pricePaid: z.number().optional().nullable(),
  paymentEvidence: z.string().optional().nullable()
});
var insertNewsletterSubscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable()
});
var evidenceHistorySchema = z.object({
  id: z.string().uuid(),
  registrationId: z.string().uuid(),
  filePath: z.string(),
  uploadedAt: z.string().datetime()
});
var insertEvidenceHistorySchema = z.object({
  registrationId: z.string().uuid(),
  filePath: z.string()
});

// server/routes.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import fileUpload from "express-fileupload";
var Roles = {
  SuperAdmin: "super_admin",
  Finance: "finance_person",
  EventManager: "event_manager",
  Ordinary: "ordinary_user"
};
var hasAnyRole = (userRole, allowed) => !!userRole && allowed.includes(userRole);
var authenticateSupabase = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : void 0;
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    const supabaseUrl2 = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl2 || !serviceRoleKey) {
      return res.status(500).json({ message: "Supabase server credentials not configured" });
    }
    const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.supabaseUser = data.user;
    req.supabaseRole = data.user.user_metadata?.role || Roles.Ordinary;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
var requireRoles = (allowedRoles) => (req, res, next) => {
  const role = req.supabaseRole;
  if (!hasAnyRole(role, allowedRoles)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.use(
    fileUpload({
      limits: { fileSize: 10 * 1024 * 1024 },
      // 10MB limit
      abortOnLimit: true,
      useTempFiles: true,
      tempFileDir: "/tmp/",
      debug: false
    })
  );
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const allUsers = await storage.getAllUsers();
      const isFirstUser = allUsers.length === 0;
      const user = await storage.createUser({
        ...userData,
        role: isFirstUser ? "super_admin" : userData.role || "ordinary_user"
      });
      res.status(201).json({ user });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.post(
    "/api/admin/users/register",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const { firstName, lastName, email, phoneNumber, password, role } = req.body;
        if (!firstName || !lastName || !email || !password || !role) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          return res.status(500).json({ message: "Server configuration error" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          // Auto-confirm email
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role
          }
        });
        if (authError) {
          console.error("Supabase auth error:", authError);
          return res.status(500).json({ message: "Failed to create user account" });
        }
        if (!authData.user) {
          return res.status(500).json({ message: "Failed to create user" });
        }
        const user = await storage.createUser({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: phoneNumber || null,
          role
        });
        console.log(`\u2705 Admin created user: ${email} with role: ${role}`);
        res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt
          }
        });
      } catch (error) {
        console.error("Admin user registration error:", error);
        res.status(500).json({
          message: "Failed to create user",
          details: error.message
        });
      }
    }
  );
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const supabaseUrl2 = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl2 || !serviceRoleKey) {
        return res.status(500).json({ message: "Supabase server credentials not configured" });
      }
      const supabase2 = createSupabaseClient(supabaseUrl2, serviceRoleKey);
      const { data, error } = await supabase2.auth.signInWithPassword({
        email,
        password
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
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/events", async (_req, res) => {
    try {
      const events2 = await storage.getAllEvents();
      res.json(events2);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.post(
    "/api/events/register",
    authenticateSupabase,
    async (req, res) => {
      try {
        const registrationData = insertEventRegistrationSchema.parse(req.body);
        if (registrationData.userId !== req.supabaseUser.id) {
          return res.status(403).json({ message: "Can only register for yourself" });
        }
        const existingRegistrations = await storage.getEventRegistrationsByUser(
          registrationData.userId
        );
        const alreadyRegistered = existingRegistrations.some(
          (reg) => reg.eventId === registrationData.eventId && reg.paymentStatus !== "cancelled"
        );
        if (alreadyRegistered) {
          return res.status(400).json({ message: "Already registered for this event" });
        }
        const event = await storage.getEvent(registrationData.eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
        if (event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) {
          return res.status(400).json({ message: "Event is full" });
        }
        const registration = await storage.createEventRegistration({
          ...registrationData,
          paymentStatus: "pending",
          hasPaid: false
        });
        res.status(201).json(registration);
      } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ message: "Registration failed" });
      }
    }
  );
  app2.post(
    "/api/admin/events/register",
    authenticateSupabase,
    requireRoles([Roles.EventManager, Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const {
          userId,
          eventId,
          title,
          gender,
          country,
          organization,
          organizationType,
          position,
          notes,
          hasPaid,
          paymentStatus
        } = req.body;
        if (!userId || !eventId || !title || !gender || !country || !organization || !position) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const event = await storage.getEvent(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }
        const existingRegistrations = await storage.getEventRegistrationsByUser(userId);
        const alreadyRegistered = existingRegistrations.some(
          (reg) => reg.eventId === eventId && reg.paymentStatus !== "cancelled"
        );
        if (alreadyRegistered) {
          return res.status(400).json({ message: "User is already registered for this event" });
        }
        if (event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) {
          return res.status(400).json({ message: "Event is full" });
        }
        const registration = await storage.createEventRegistration({
          eventId,
          userId,
          title,
          gender,
          country,
          organization,
          organizationType: organizationType || "Other",
          position,
          notes: notes || null,
          hasPaid: hasPaid || false,
          paymentStatus: paymentStatus || "pending",
          paymentEvidence: null
        });
        console.log(`\u2705 Admin registered user ${userId} for event ${eventId}`);
        res.status(201).json({
          message: "Registration created successfully",
          registration: {
            id: registration.id,
            eventId: registration.eventId,
            userId: registration.userId,
            paymentStatus: registration.paymentStatus,
            registeredAt: registration.registeredAt
          }
        });
      } catch (error) {
        console.error("Admin event registration error:", error);
        res.status(500).json({
          message: "Failed to create registration",
          details: error.message
        });
      }
    }
  );
  app2.post("/api/notifications/registration-confirmation", async (req, res) => {
    try {
      const { email, eventId, fullName } = req.body;
      if (!email || !eventId || !fullName) {
        return res.status(400).json({ message: "Email, eventId, and fullName required" });
      }
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      console.log(`\u{1F4E7} Sending confirmation email to: ${email}`);
      console.log(`   Event ID: ${eventId}`);
      console.log(`   Event Title: ${event.title}`);
      console.log(`   Full Name: ${fullName}`);
      res.json({ success: true, message: "Email queued for sending" });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ message: "Failed to send confirmation" });
    }
  });
  app2.get(
    "/api/users/:userId/registrations",
    authenticateSupabase,
    async (req, res) => {
      try {
        const { userId } = req.params;
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
    }
  );
  app2.patch(
    "/api/users/:userId/registrations/:registrationId/cancel",
    authenticateSupabase,
    async (req, res) => {
      try {
        const { userId, registrationId } = req.params;
        if (req.supabaseRole !== "super_admin" && req.supabaseRole !== "finance_person" && req.supabaseUser.id !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }
        if (req.supabaseRole !== "super_admin" && req.supabaseRole !== "finance_person" && registration.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        if (registration.paymentStatus === "cancelled") {
          return res.status(400).json({ message: "Registration is already cancelled" });
        }
        await storage.cancelEventRegistration(registrationId);
        res.json({ message: "Registration cancelled successfully" });
      } catch (error) {
        console.error("Error cancelling registration:", error);
        res.status(500).json({ message: "Failed to cancel registration" });
      }
    }
  );
  app2.delete(
    "/api/users/:userId/registrations/:registrationId",
    authenticateSupabase,
    requireRoles(["super_admin"]),
    async (req, res) => {
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
    }
  );
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(
        req.body
      );
      const existingSubscription = await storage.getNewsletterSubscriptionByEmail(subscriptionData.email);
      if (existingSubscription) {
        return res.status(200).json({
          message: "Already subscribed",
          subscription: existingSubscription
        });
      }
      const subscription = await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ message: "Subscription failed" });
    }
  });
  app2.get(
    "/api/admin/events",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (_req, res) => {
      try {
        const events2 = await storage.getAllEvents();
        res.json(events2);
      } catch (error) {
        console.error("Error fetching admin events:", error);
        res.status(500).json({ message: "Failed to fetch events" });
      }
    }
  );
  app2.get(
    "/api/admin/users",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (_req, res) => {
      try {
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          return res.status(500).json({ message: "Supabase server credentials not configured" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const allUsers = [];
        const perPage = 1e3;
        let page = 1;
        while (true) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage
          });
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
          allUsers.map(async (u) => {
            const user = await storage.getUser(u.id);
            return user || {
              id: u.id,
              email: u.email || "",
              firstName: u.user_metadata?.first_name || "",
              lastName: u.user_metadata?.last_name || "",
              phoneNumber: u.user_metadata?.phone_number || "",
              role: u.user_metadata?.role || "ordinary_user",
              createdAt: u.created_at
            };
          })
        );
        res.json(mappedUsers);
      } catch (error) {
        console.error("Error fetching admin users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
      }
    }
  );
  app2.get(
    "/api/admin/registrations",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]),
    async (_req, res) => {
      try {
        const registrations = await storage.getAllEventRegistrations();
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = supabaseUrl2 && serviceRoleKey ? createSupabaseClient(supabaseUrl2, serviceRoleKey) : null;
        const registrationsWithDetails = await Promise.all(
          registrations.map(async (registration) => {
            const event = await storage.getEvent(registration.eventId);
            let user = void 0;
            if (supabaseAdmin) {
              try {
                const { data } = await supabaseAdmin.auth.admin.getUserById(
                  registration.userId
                );
                const u = data?.user;
                if (u) {
                  user = {
                    id: u.id,
                    email: u.email,
                    firstName: u.user_metadata?.first_name || "",
                    lastName: u.user_metadata?.last_name || ""
                  };
                }
              } catch {
              }
            }
            return { ...registration, event, user };
          })
        );
        res.json(registrationsWithDetails);
      } catch (error) {
        console.error("Error fetching admin registrations:", error);
        res.status(500).json({ message: "Failed to fetch registrations" });
      }
    }
  );
  app2.patch(
    "/api/admin/registrations/:registrationId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req, res) => {
      try {
        const { registrationId } = req.params;
        const { paymentStatus, hasPaid } = req.body;
        if (!paymentStatus && hasPaid === void 0) {
          return res.status(400).json({ message: "No updates provided" });
        }
        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentStatus,
            hasPaid
          }
        );
        if (!updatedRegistration) {
          return res.status(404).json({ message: "Registration not found" });
        }
        res.json(updatedRegistration);
      } catch (error) {
        console.error("Error updating registration:", error);
        res.status(500).json({ message: "Failed to update registration" });
      }
    }
  );
  app2.patch(
    "/api/admin/users/:userId/role",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!role || ![
          "super_admin",
          "finance_person",
          "event_manager",
          "ordinary_user"
        ].includes(role)) {
          return res.status(400).json({ message: "Invalid role" });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          return res.status(500).json({ message: "Supabase server credentials not configured" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { role }
          }
        );
        if (error) {
          throw error;
        }
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
    }
  );
  app2.get(
    "/api/admin/newsletter-subscriptions",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (_req, res) => {
      try {
        const subscriptions = await storage.getAllNewsletterSubscriptions();
        res.json(subscriptions);
      } catch (error) {
        console.error("Error fetching newsletter subscriptions:", error);
        res.status(500).json({ message: "Failed to fetch subscriptions" });
      }
    }
  );
  app2.post(
    "/api/admin/email-blast",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin]),
    async (req, res) => {
      try {
        const {
          subject,
          message,
          fromName = "Alliance Procurement",
          fromEmail = "no-reply@apcb.com"
        } = req.body;
        if (!subject || !message) {
          return res.status(400).json({ message: "Subject and message are required" });
        }
        const subscriptions = await storage.getAllNewsletterSubscriptions();
        console.log(
          `\u{1F4E7} Sending email blast to ${subscriptions.length} subscribers`
        );
        console.log(`   Subject: ${subject}`);
        console.log(`   From: ${fromName} <${fromEmail}>`);
        res.json({
          message: `Email blast queued for ${subscriptions.length} subscribers`,
          results: {
            sent: subscriptions.length,
            failed: 0,
            total: subscriptions.length
          }
        });
      } catch (error) {
        console.error("Error sending email blast:", error);
        res.status(500).json({ message: "Failed to send email blast" });
      }
    }
  );
  app2.get(
    "/evidence/:userId/:eventId/:fileName",
    authenticateSupabase,
    async (req, res) => {
      try {
        const { userId, eventId, fileName } = req.params;
        const filePath = `evidence/${userId || ""}/${eventId || ""}/${fileName || ""}`;
        const canAccess = req.supabaseUser.id === userId || req.supabaseRole === "super_admin" || req.supabaseRole === "finance_person";
        if (!canAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          return res.status(500).json({ message: "Supabase server credentials not configured" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const bucket = process.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(filePath);
        if (error) {
          console.error("File download error:", error);
          return res.status(404).json({ message: "File not found" });
        }
        if (!data) {
          return res.status(404).json({ message: "File not found" });
        }
        const buffer = Buffer.from(await data.arrayBuffer());
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
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            break;
        }
        res.set({
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=31536000"
          // Cache for 1 year
        });
        res.send(buffer);
      } catch (error) {
        console.error("Error serving evidence file:", error);
        res.status(500).json({ message: "Failed to serve file" });
      }
    }
  );
  app2.get(
    "/api/admin/payment-evidence/:evidencePath",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.Finance]),
    async (req, res) => {
      try {
        const { evidencePath } = req.params;
        const decodedPath = decodeURIComponent(evidencePath);
        console.log(`\u{1F50D} Fetching evidence from path: ${decodedPath}`);
        if (!decodedPath) {
          console.log(`\u274C No evidence path provided`);
          return res.status(400).json({ message: "Evidence path is required" });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          console.error("\u274C Missing Supabase credentials");
          return res.status(500).json({ message: "Server configuration error" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const bucket = process.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        console.log(`\u{1FAA3} Using bucket: ${bucket}`);
        console.log(`\u{1F4C2} File path: ${decodedPath}`);
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(decodedPath || "");
        if (error) {
          console.error(`\u274C Storage download error:`, error);
          const alternativePaths = [
            decodedPath.replace("/storage/v1/object/", ""),
            decodedPath.split("/").slice(-3).join("/"),
            // Last 3 parts
            `evidence/${decodedPath.split("/").slice(-3).join("/")}`
            // Ensure evidence prefix
          ];
          console.log(`\u{1F504} Trying alternative paths:`, alternativePaths);
          for (const altPath of alternativePaths) {
            try {
              console.log(`\u{1F504} Attempting: ${altPath}`);
              const { data: altData, error: altError } = await supabaseAdmin.storage.from(bucket).download(altPath);
              if (!altError && altData) {
                console.log(`\u2705 Success with alternative path: ${altPath}`);
                const buffer2 = Buffer.from(await altData.arrayBuffer());
                const filename2 = altPath.split("/").pop() || "evidence";
                const ext2 = filename2.toLowerCase().split(".").pop() || "";
                let contentType2 = "application/octet-stream";
                if (ext2 === "pdf") contentType2 = "application/pdf";
                else if (["jpg", "jpeg"].includes(ext2 || ""))
                  contentType2 = "image/jpeg";
                else if (ext2 === "png") contentType2 = "image/png";
                res.set({
                  "Content-Type": contentType2,
                  "Content-Disposition": `inline; filename="${filename2}"`,
                  "Cache-Control": "private, max-age=3600"
                });
                return res.send(buffer2);
              }
            } catch (altErr) {
              console.log(`\u274C Alternative path failed: ${altPath}`, altErr);
            }
          }
          return res.status(404).json({
            message: "Evidence file not found in storage",
            details: error.message,
            attemptedPaths: alternativePaths
          });
        }
        if (!data) {
          console.log(`\u274C No data returned from storage`);
          return res.status(404).json({ message: "Evidence file not found" });
        }
        console.log(`\u2705 File downloaded successfully`);
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
          "Cache-Control": "private, max-age=3600"
        });
        res.send(buffer);
      } catch (error) {
        console.error("\u274C Evidence error:", error);
        res.status(500).json({
          message: "Server error while fetching evidence",
          details: error.message
        });
      }
    }
  );
  app2.get(
    "/api/users/payment-evidence/:evidencePath",
    authenticateSupabase,
    async (req, res) => {
      try {
        const { evidencePath } = req.params;
        const decodedPath = decodeURIComponent(evidencePath);
        const userId = req.supabaseUser.id;
        console.log(
          `\u{1F50D} User ${userId} fetching evidence from path: ${decodedPath}`
        );
        if (!decodedPath) {
          console.log(`\u274C No evidence path provided`);
          return res.status(400).json({ message: "Evidence path is required" });
        }
        if (!decodedPath.includes(userId)) {
          console.log(
            `\u274C User ${userId} trying to access evidence not owned by them`
          );
          return res.status(403).json({ message: "Access denied to this evidence" });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          console.error("\u274C Missing Supabase credentials");
          return res.status(500).json({ message: "Server configuration error" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const bucket = process.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        console.log(`\u{1FAA3} Using bucket: ${bucket}`);
        console.log(`\u{1F4C2} File path: ${decodedPath}`);
        const { data, error } = await supabaseAdmin.storage.from(bucket).download(decodedPath || "");
        if (error) {
          console.error(`\u274C Storage download error:`, error);
          return res.status(404).json({
            message: "Evidence file not found in storage",
            details: error.message
          });
        }
        if (!data) {
          console.log(`\u274C No data returned from storage`);
          return res.status(404).json({ message: "Evidence file not found" });
        }
        console.log(`\u2705 File downloaded successfully for user ${userId}`);
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
          "Cache-Control": "private, max-age=3600"
        });
        res.send(buffer);
      } catch (error) {
        console.error("\u274C User evidence error:", error);
        res.status(500).json({
          message: "Server error while fetching evidence",
          details: error.message
        });
      }
    }
  );
  app2.put(
    "/api/users/payment-evidence/:registrationId",
    authenticateSupabase,
    async (_req, res) => {
      return res.status(403).json({ message: "Evidence updates are restricted to finance" });
    }
  );
  app2.put(
    "/api/admin/payment-evidence/:registrationId",
    authenticateSupabase,
    async (req, res) => {
      try {
        const { registrationId } = req.params;
        const { evidenceFile } = req.body;
        if (!evidenceFile) {
          return res.status(400).json({ message: "Evidence file is required" });
        }
        console.log(`\u{1F504} Updating evidence for registration: ${registrationId}`);
        const registration = await storage.getEventRegistration(registrationId);
        if (!registration) {
          return res.status(404).json({ message: "Registration not found" });
        }
        if (registration.paymentStatus === "cancelled") {
          return res.status(400).json({
            message: "Cannot update evidence for cancelled registration"
          });
        }
        const supabaseUrl2 = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl2 || !serviceRoleKey) {
          return res.status(500).json({ message: "Server configuration error" });
        }
        const supabaseAdmin = createSupabaseClient(supabaseUrl2, serviceRoleKey);
        const bucket = process.env.VITE_SUPABASE_EVIDENCE_BUCKET || "registrations";
        const fileExtension = evidenceFile.name.split(".").pop();
        const newFileName = `evidence_${Date.now()}.${fileExtension}`;
        const newFilePath = `evidence/${registration.userId}/${registration.eventId}/${newFileName}`;
        const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(newFilePath, evidenceFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: evidenceFile.type || "application/octet-stream"
        });
        if (uploadError) {
          console.error(`\u274C Upload error:`, uploadError);
          return res.status(500).json({ message: "Failed to upload new evidence file" });
        }
        if (registration.paymentEvidence) {
          try {
            await supabaseAdmin.storage.from(bucket).remove([registration.paymentEvidence]);
            console.log(
              `\u{1F5D1}\uFE0F Deleted old evidence: ${registration.paymentEvidence}`
            );
          } catch (deleteError) {
            console.warn(`\u26A0\uFE0F Failed to delete old evidence:`, deleteError);
          }
        }
        const updatedRegistration = await storage.updateEventRegistration(
          registrationId,
          {
            paymentEvidence: newFilePath
          }
        );
        if (!updatedRegistration) {
          return res.status(500).json({ message: "Failed to update registration" });
        }
        console.log(`\u2705 Evidence updated successfully: ${newFilePath}`);
        res.json({
          message: "Evidence updated successfully",
          registration: updatedRegistration,
          newEvidencePath: newFilePath
        });
      } catch (error) {
        console.error("\u274C Evidence update error:", error);
        res.status(500).json({
          message: "Server error while updating evidence",
          details: error.message
        });
      }
    }
  );
  app2.post(
    "/api/admin/events",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req, res) => {
      try {
        const event = await storage.createEvent(req.body);
        res.status(201).json(event);
      } catch (error) {
        res.status(400).json({ message: "Failed to create event", details: error.message });
      }
    }
  );
  app2.patch(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req, res) => {
      try {
        const updated = await storage.updateEvent(req.params.eventId, req.body);
        if (!updated)
          return res.status(404).json({ message: "Event not found" });
        res.json(updated);
      } catch (error) {
        res.status(400).json({ message: "Failed to update event", details: error.message });
      }
    }
  );
  app2.delete(
    "/api/admin/events/:eventId",
    authenticateSupabase,
    requireRoles([Roles.SuperAdmin, Roles.EventManager]),
    async (req, res) => {
      try {
        const ok = await storage.deleteEvent(req.params.eventId);
        if (!ok) return res.status(404).json({ message: "Event not found" });
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ message: "Failed to delete event", details: error.message });
      }
    }
  );
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const { setupVite: setupVite2 } = await init_vite().then(() => vite_exports);
    await setupVite2(app, server);
  } else {
    const { serveStatic: serveStatic2 } = await init_vite().then(() => vite_exports);
    serveStatic2(app);
  }
  const port = process.env.PORT || 5005;
  server.listen(
    {
      port: Number(port),
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      console.log(`serving on port ${port}`);
    }
  );
})();
