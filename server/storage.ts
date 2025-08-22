import { type User, type InsertUser, type Event, type InsertEvent, type EventRegistration, type InsertEventRegistration, type NewsletterSubscription, type InsertNewsletterSubscription, users, events, eventRegistrations, newsletterSubscriptions } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Event Registrations
  getEventRegistration(id: string): Promise<EventRegistration | undefined>;
  getEventRegistrationsByUser(userId: string): Promise<EventRegistration[]>;
  getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]>;
  getAllEventRegistrations(): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined>;

  // Newsletter
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    
    // Initialize with sample data if needed
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    try {
      // Check if events exist, if not create sample events
      const existingEvents = await this.db.select().from(events).limit(1);
      if (existingEvents.length === 0) {
        await this.createSampleEvents();
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  private async createSampleEvents() {
    const sampleEvents: InsertEvent[] = [
      {
        title: "International Procurement & Financial Management Summit",
        description: "A comprehensive 3-day summit bringing together procurement professionals, financial managers, and supply chain experts from across Southern Africa. Features keynote speakers, workshops, and networking opportunities.",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-17"),
        location: "Lusaka, Zambia",
        price: "299.00",
        maxAttendees: 100,
        imageUrl: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858601/groupPhoto3_vvwwcr.jpg",
        tags: ["Procurement", "Supply Chain", "Financial Management"],
        featured: true,
      },
      {
        title: "Compliance & Audit Workshop",
        description: "Advanced training on procurement compliance and audit procedures.",
        startDate: new Date("2024-03-22"),
        endDate: new Date("2024-03-22"),
        location: "Lusaka, Zambia",
        price: "150.00",
        maxAttendees: 50,
        tags: ["Compliance", "Audit"],
      },
      {
        title: "Tender Management Masterclass",
        description: "Comprehensive guide to tender evaluation and management processes.",
        startDate: new Date("2024-04-05"),
        endDate: new Date("2024-04-05"),
        location: "Lusaka, Zambia",
        price: "200.00",
        maxAttendees: 75,
        tags: ["Tender Management", "Evaluation"],
      },
    ];

    for (const eventData of sampleEvents) {
      await this.createEvent(eventData);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.db.select().from(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating user role:", error);
      return undefined;
    }
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    try {
      const result = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting event:", error);
      return undefined;
    }
  }

  async getAllEvents(): Promise<Event[]> {
    try {
      return await this.db.select().from(events).orderBy(events.startDate);
    } catch (error) {
      console.error("Error getting all events:", error);
      return [];
    }
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    try {
      const result = await this.db.insert(events).values(insertEvent).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    try {
      const result = await this.db
        .update(events)
        .set(updates)
        .where(eq(events.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating event:", error);
      return undefined;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await this.db.delete(events).where(eq(events.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  // Event Registrations
  async getEventRegistration(id: string): Promise<EventRegistration | undefined> {
    try {
      const result = await this.db.select().from(eventRegistrations).where(eq(eventRegistrations.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting event registration:", error);
      return undefined;
    }
  }

  async getEventRegistrationsByUser(userId: string): Promise<EventRegistration[]> {
    try {
      return await this.db.select().from(eventRegistrations).where(eq(eventRegistrations.userId, userId));
    } catch (error) {
      console.error("Error getting registrations by user:", error);
      return [];
    }
  }

  async getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    try {
      return await this.db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
    } catch (error) {
      console.error("Error getting registrations by event:", error);
      return [];
    }
  }

  async getAllEventRegistrations(): Promise<EventRegistration[]> {
    try {
      return await this.db.select().from(eventRegistrations);
    } catch (error) {
      console.error("Error getting all registrations:", error);
      return [];
    }
  }

  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    try {
      const result = await this.db.insert(eventRegistrations).values(insertRegistration).returning();
      
      // Update event attendee count
      await this.db
        .update(events)
        .set({ currentAttendees: sql`${events.currentAttendees} + 1` })
        .where(eq(events.id, insertRegistration.eventId));
      
      return result[0];
    } catch (error) {
      console.error("Error creating event registration:", error);
      throw error;
    }
  }

  async updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined> {
    try {
      const result = await this.db
        .update(eventRegistrations)
        .set(updates)
        .where(eq(eventRegistrations.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating event registration:", error);
      return undefined;
    }
  }

  // Newsletter
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    try {
      const result = await this.db.insert(newsletterSubscriptions).values(insertSubscription).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating newsletter subscription:", error);
      throw error;
    }
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    try {
      const result = await this.db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting newsletter subscription:", error);
      return undefined;
    }
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      return await this.db.select().from(newsletterSubscriptions);
    } catch (error) {
      console.error("Error getting all newsletter subscriptions:", error);
      return [];
    }
  }
}

// Use MemStorage for now, but keep DatabaseStorage ready for when database is properly configured
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private eventRegistrations: Map<string, EventRegistration>;
  private newsletterSubscriptions: Map<string, NewsletterSubscription>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.newsletterSubscriptions = new Map();
    this.createSampleEvents();
    this.createSampleSubscriptions();
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      phoneNumber: insertUser.phoneNumber || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    const updatedUser = { ...user, role };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      id,
      location: insertEvent.location || null,
      maxAttendees: insertEvent.maxAttendees || null,
      imageUrl: insertEvent.imageUrl || null,
      tags: insertEvent.tags || null,
      featured: insertEvent.featured || null,
      currentAttendees: 0,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async getAllEventRegistrations(): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values());
  }

  async getEventRegistration(id: string): Promise<EventRegistration | undefined> {
    return this.eventRegistrations.get(id);
  }

  async getEventRegistrationsByUser(userId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(reg => reg.userId === userId);
  }

  async getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values()).filter(reg => reg.eventId === eventId);
  }

  async createEventRegistration(insertRegistration: InsertEventRegistration): Promise<EventRegistration> {
    const id = randomUUID();
    const registration: EventRegistration = {
      ...insertRegistration,
      id,
      paymentStatus: insertRegistration.paymentStatus || "pending",
      registeredAt: new Date(),
    };
    this.eventRegistrations.set(id, registration);
    
    const event = await this.getEvent(insertRegistration.eventId);
    if (event) {
      await this.updateEvent(event.id, { currentAttendees: (event.currentAttendees || 0) + 1 });
    }
    
    return registration;
  }

  async updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined> {
    const registration = this.eventRegistrations.get(id);
    if (!registration) return undefined;
    const updatedRegistration = { ...registration, ...updates };
    this.eventRegistrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      subscribedAt: new Date(),
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    return Array.from(this.newsletterSubscriptions.values()).find(sub => sub.email === email);
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values());
  }

  private createSampleEvents() {
    const sampleEvents: InsertEvent[] = [
      {
        title: "International Procurement & Financial Management Summit",
        description: "A comprehensive 3-day summit bringing together procurement professionals, financial managers, and supply chain experts from across Southern Africa. Features keynote speakers, workshops, and networking opportunities.",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-17"),
        location: "Lusaka, Zambia",
        price: "299.00",
        maxAttendees: 100,
        imageUrl: "https://res.cloudinary.com/duu5rnmeu/image/upload/v1755858601/groupPhoto3_vvwwcr.jpg",
        tags: ["Procurement", "Supply Chain", "Financial Management"],
        featured: true,
      },
      {
        title: "Compliance & Audit Workshop",
        description: "Advanced training on procurement compliance and audit procedures.",
        startDate: new Date("2024-04-10"),
        endDate: new Date("2024-04-12"),
        location: "Cape Town, South Africa",
        price: "199.00",
        maxAttendees: 50,
        tags: ["Compliance", "Audit"],
      },
      {
        title: "Tender Management Masterclass",
        description: "Learn advanced tender management and evaluation techniques.",
        startDate: new Date("2024-05-20"),
        endDate: new Date("2024-05-21"),
        location: "Harare, Zimbabwe",
        price: "249.00",
        maxAttendees: 75,
        tags: ["Tender Management", "Evaluation"],
      },
    ];

    sampleEvents.forEach(eventData => {
      this.createEvent(eventData);
    });
  }

  private createSampleSubscriptions() {
    const sampleSubscriptions: InsertNewsletterSubscription[] = [
      {
        email: "john.smith@example.com",
        name: "John Smith",
      },
      {
        email: "sarah.johnson@company.com",
        name: "Sarah Johnson",
      },
      {
        email: "michael.brown@procurement.org",
        name: "Michael Brown",
      },
      {
        email: "lisa.wilson@training.co.za",
        name: "Lisa Wilson",
      },
      {
        email: "david.lee@supply.zm",
        name: "David Lee",
      },
    ];

    sampleSubscriptions.forEach(subscriptionData => {
      this.createNewsletterSubscription(subscriptionData);
    });
  }
}

// Comment out database storage until Supabase is properly connected
// export const storage = new DatabaseStorage();
export const storage = new MemStorage();
