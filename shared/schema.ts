import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").notNull().default("admin"), // user or admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  registrationNumber: text("registration_number").notNull().unique(), // Auto-incrementing registration number
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
  // Additional registration fields
  title: text("title"), // mr, dr, etc.
  gender: text("gender"),
  country: text("country"),
  organization: text("organization"),
  organizationType: text("organization_type"),
  position: text("position"),
  notes: text("notes"),
  hasPaid: boolean("has_paid").default(false),
  paymentEvidence: text("payment_evidence"), // URL to uploaded file
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  currentAttendees: true,
});

export const insertEventRegistrationSchema = z.object({
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
  paymentStatus: z
    .enum(["pending", "paid", "cancelled"])
    .optional()
    .default("pending"),
  paymentMethod: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  pricePaid: z.number().optional().nullable(),
  paymentEvidence: z.string().optional().nullable(),
});

export const insertNewsletterSubscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
});

export const evidenceHistorySchema = z.object({
  id: z.string().uuid(),
  registrationId: z.string().uuid(),
  filePath: z.string(),
  uploadedAt: z.string().datetime(),
});

export const insertEvidenceHistorySchema = z.object({
  registrationId: z.string().uuid(),
  filePath: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserResponse = Omit<User, "password">;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventRegistration = z.infer<
  typeof insertEventRegistrationSchema
>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertNewsletterSubscription = z.infer<
  typeof insertNewsletterSubscriptionSchema
>;
export type NewsletterSubscription =
  typeof newsletterSubscriptions.$inferSelect;
