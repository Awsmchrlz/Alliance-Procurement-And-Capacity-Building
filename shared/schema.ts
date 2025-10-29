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

// Define role types
export type RoleValue =
  | "super_admin"
  | "finance_person"
  | "event_manager"
  | "ordinary_user";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull(), // Allow shared company emails
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(), // Phone number is now required and unique
  gender: text("gender"),
  role: text("role").notNull().default("ordinary_user"), // super_admin, finance_person, event_manager, ordinary_user
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
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
  country: text("country"),
  organization: text("organization"),
  position: text("position"),
  notes: text("notes"),
  hasPaid: boolean("has_paid").default(false),
  paymentEvidence: text("payment_evidence"), // URL to uploaded file
  paymentMethod: text("payment_method"), // mobile, bank, cash, group_payment, org_paid
  currency: text("currency"), // ZMW, USD
  pricePaid: decimal("price_paid", { precision: 10, scale: 2 }),
  delegateType: text("delegate_type"), // private, public, international
  dinnerGalaAttendance: boolean("dinner_gala_attendance").default(false), // Whether attending dinner gala
  // Add-on packages available for all delegate types
  accommodationPackage: boolean("accommodation_package").default(false), // Accommodation package
  victoriaFallsPackage: boolean("victoria_falls_package").default(false), // Victoria Falls adventure package
  boatCruisePackage: boolean("boat_cruise_package").default(false), // Boat cruise package
  // Group payment fields
  groupSize: integer("group_size").default(1),
  groupPaymentAmount: decimal("group_payment_amount", {
    precision: 10,
    scale: 2,
  }),
  groupPaymentCurrency: text("group_payment_currency"), // ZMW, USD
  organizationReference: text("organization_reference"), // Reference for group/org payments
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const sponsorships = pgTable("sponsorships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  website: text("website"),
  companyAddress: text("company_address"),
  sponsorshipLevel: text("sponsorship_level").notNull(), // platinum, gold, silver, bronze
  logo_url: text("logo_url"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, approved, rejected, paid
  paymentStatus: text("payment_status").default("pending"), // pending, paid, cancelled
  paymentEvidence: text("payment_evidence"),
  paymentMethod: text("payment_method"), // mobile, bank, cash
  specialRequirements: text("special_requirements"),
  marketingMaterials: text("marketing_materials"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
});

export const exhibitions = pgTable("exhibitions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  website: text("website"),
  companyAddress: text("company_address"),
  boothSize: text("booth_size").default("standard"), // standard, premium, custom
  amount: decimal("amount", { precision: 10, scale: 2 })
    .notNull()
    .default("7000.00"),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"), // pending, approved, rejected, paid
  paymentStatus: text("payment_status").default("pending"), // pending, paid, cancelled
  paymentEvidence: text("payment_evidence"),
  productsServices: text("products_services"),
  boothRequirements: text("booth_requirements"),
  electricalRequirements: boolean("electrical_requirements").default(false),
  internetRequirements: boolean("internet_requirements").default(false),
  notes: text("notes"),
  logo_url: text("logo_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
  })
  .refine(
    (data) => {
      // Ensure phone number is provided
      return data.phoneNumber && data.phoneNumber.trim().length > 0;
    },
    {
      message: "Phone number is required",
      path: ["phoneNumber"],
    },
  );

// Login schema that accepts either email or phone
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  currentAttendees: true,
});

export const insertEventRegistrationSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  country: z.string(),
  organization: z.string(),
  position: z.string(),
  notes: z.string().optional().nullable(),
  hasPaid: z.boolean().optional().default(false),
  paymentStatus: z
    .enum(["pending", "paid", "cancelled"])
    .optional()
    .default("pending"),
  paymentMethod: z
    .enum(["mobile", "bank", "cash", "group_payment", "org_paid"])
    .optional()
    .nullable(),
  currency: z.string().optional().nullable(),
  pricePaid: z.number().optional().nullable(),
  paymentEvidence: z.string().optional().nullable(),
  delegateType: z
    .enum(["private", "public", "international"])
    .optional()
    .nullable(),
  dinnerGalaAttendance: z.boolean().optional().default(false),
  // Add-on packages available for all delegate types
  accommodationPackage: z.boolean().optional().default(false),
  victoriaFallsPackage: z.boolean().optional().default(false),
  boatCruisePackage: z.boolean().optional().default(false),
  // Group payment fields
  groupSize: z.number().optional(),
  groupPaymentAmount: z.number().optional().nullable(),
  groupPaymentCurrency: z.enum(["ZMW", "USD"]).optional().nullable(),
  organizationReference: z.string().optional().nullable(),
});

export const insertNewsletterSubscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
});

export const insertSponsorshipSchema = z.object({
  eventId: z.string(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  website: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  sponsorshipLevel: z.enum(["platinum", "gold", "silver", "bronze"]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  specialRequirements: z.string().optional().nullable(),
  marketingMaterials: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const insertExhibitionSchema = z.object({
  eventId: z.string(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  website: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  boothSize: z.enum(["standard", "premium", "custom"]).default("standard"),
  amount: z.number().default(7000),
  currency: z.string().default("USD"),
  productsServices: z.string().optional().nullable(),
  boothRequirements: z.string().optional().nullable(),
  electricalRequirements: z.boolean().default(false),
  internetRequirements: z.boolean().default(false),
  notes: z.string().optional().nullable(),
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
export type LoginRequest = z.infer<typeof loginSchema>;
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
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;
export type Exhibition = typeof exhibitions.$inferSelect;
