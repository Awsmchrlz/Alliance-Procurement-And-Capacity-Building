import { createClient } from "@supabase/supabase-js";
import { User, InsertUser, Event, InsertEvent, EventRegistration, InsertEventRegistration, NewsletterSubscription, InsertNewsletterSubscription } from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and service role key must be provided");
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface UserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  created_at: string;
}

export const storage = {
  async getUser(id: string): Promise<User | undefined> {
    try {
      // Fetch from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone_number, created_at')
        .eq('id', id)
        .single();
      if (userError || !userData) {
        console.error("Error fetching user from users table:", userError?.message);
        return undefined;
      }

      // Fetch email and role from auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);
      if (authError || !authData.user) {
        console.error("Error fetching auth user:", authError?.message);
        return undefined;
      }

      return {
        id: userData.id,
        email: authData.user.email || '',
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: authData.user.user_metadata?.role || 'ordinary_user',
        createdAt: userData.created_at,
      };
    } catch (error: any) {
      console.error("Error in getUser:", error.message);
      return undefined;
    }
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Fetch auth user by email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error("Error fetching auth users:", authError.message);
        return undefined;
      }
      const authUser = authUsers.users.find(u => u.email === email);
      if (!authUser) {
        return undefined;
      }

      // Fetch from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone_number, created_at')
        .eq('id', authUser.id)
        .single();
      if (userError || !userData) {
        console.error("Error fetching user by email from users table:", userError?.message);
        return undefined;
      }

      return {
        id: userData.id,
        email: authUser.email || '',
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: authUser.user_metadata?.role || 'ordinary_user',
        createdAt: userData.created_at,
      };
    } catch (error: any) {
      console.error("Error in getUserByEmail:", error.message);
      return undefined;
    }
  },

  async createUser(user: InsertUser): Promise<User> {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { role: user.role || 'ordinary_user', first_name: user.firstName, last_name: user.lastName, phone_number: user.phoneNumber }
      });
      if (authError) {
        console.error("Error creating auth user:", authError.message);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber
        })
        .select('id, first_name, last_name, phone_number, created_at')
        .single();
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
        role: user.role || 'ordinary_user',
        createdAt: data.created_at,
      };
    } catch (error: any) {
      console.error("Error in createUser:", error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone_number, created_at');
      if (userError) {
        console.error("Error fetching all users:", userError.message);
        throw new Error(`Failed to fetch users: ${userError.message}`);
      }

      const users = await Promise.all(
        userData.map(async (u: UserRow) => {
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(u.id);
          if (authError) {
            console.error(`Error fetching auth user ${u.id}:`, authError.message);
            return undefined;
          }
          return {
            id: u.id,
            email: authData.user.email || '',
            firstName: u.first_name,
            lastName: u.last_name,
            phoneNumber: u.phone_number,
            role: authData.user.user_metadata?.role || 'ordinary_user',
            createdAt: u.created_at,
          };
        })
      );

      return users.filter((u): u is User => u !== undefined);
    } catch (error: any) {
      console.error("Error in getAllUsers:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async getEvent(id: string): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) {
        console.error("Error fetching event:", error.message);
        return undefined;
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
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in getEvent:", error.message);
      return undefined;
    }
  },

  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase.from('events').select('*').order('start_date');
      if (error) {
        console.error("Error fetching all events:", error.message);
        throw new Error(`Failed to fetch events: ${error.message}`);
      }
      return data.map(e => ({
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
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }));
    } catch (error: any) {
      console.error("Error in getAllEvents:", error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  },

  async createEvent(event: InsertEvent): Promise<Event> {
    try {
      const { data, error } = await supabase.from('events').insert({
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        end_date: event.endDate,
        location: event.location,
        price: event.price,
        max_attendees: event.maxAttendees,
        image_url: event.imageUrl,
        tags: event.tags,
        featured: event.featured,
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
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in createEvent:", error.message);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase.from('events').update({
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
        featured: updates.featured,
      }).eq('id', id).select().single();
      if (error) {
        console.error("Error updating event:", error.message);
        return undefined;
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
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in updateEvent:", error.message);
      return undefined;
    }
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        console.error("Error deleting event:", error.message);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("Error in deleteEvent:", error.message);
      return false;
    }
  },

  async getEventRegistration(id: string): Promise<EventRegistration | undefined> {
    try {
      const { data, error } = await supabase.from('event_registrations').select('*').eq('id', id).single();
      if (error) {
        console.error("Error fetching event registration:", error.message);
        return undefined;
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
        registeredAt: data.registered_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in getEventRegistration:", error.message);
      return undefined;
    }
  },

  async getEventRegistrationsByUser(userId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase.from('event_registrations').select('*').eq('user_id', userId);
      if (error) {
        console.error("Error fetching user registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map(r => ({
        id: r.id,
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
        registeredAt: r.registered_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (error: any) {
      console.error("Error in getEventRegistrationsByUser:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async getEventRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase.from('event_registrations').select('*').eq('event_id', eventId);
      if (error) {
        console.error("Error fetching event registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map(r => ({
        id: r.id,
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
        registeredAt: r.registered_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (error: any) {
      console.error("Error in getEventRegistrationsByEvent:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async getAllEventRegistrations(): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase.from('event_registrations').select('*');
      if (error) {
        console.error("Error fetching all registrations:", error.message);
        throw new Error(`Failed to fetch registrations: ${error.message}`);
      }
      return data.map(r => ({
        id: r.id,
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
        registeredAt: r.registered_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (error: any) {
      console.error("Error in getAllEventRegistrations:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    try {
      const { data, error } = await supabase.from('event_registrations').insert({
        event_id: registration.eventId,
        user_id: registration.userId,
        payment_status: registration.paymentStatus || 'pending',
        title: registration.title,
        gender: registration.gender,
        country: registration.country,
        organization: registration.organization,
        organization_type: registration.organizationType,
        position: registration.position,
        notes: registration.notes,
        has_paid: registration.hasPaid || false,
        payment_evidence: registration.paymentEvidence,
      }).select().single();
      if (error) {
        console.error("Error creating event registration:", error.message);
        throw new Error(`Failed to create registration: ${error.message}`);
      }
      await supabase.rpc('increment_attendees', { event_id: registration.eventId }).then(({ error: rpcError }) => {
        if (rpcError) console.error("Error incrementing attendees:", rpcError.message);
      });
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
        registeredAt: data.registered_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in createEventRegistration:", error.message);
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  },

  async updateEventRegistration(id: string, updates: Partial<EventRegistration>): Promise<EventRegistration | undefined> {
    try {
      const { data, error } = await supabase.from('event_registrations').update({
        payment_status: updates.paymentStatus,
        title: updates.title,
        gender: updates.gender,
        country: updates.country,
        organization: updates.organization,
        organization_type: updates.organizationType,
        position: updates.position,
        notes: updates.notes,
        has_paid: updates.hasPaid,
        payment_evidence: updates.paymentEvidence,
      }).eq('id', id).select().single();
      if (error) {
        console.error("Error updating event registration:", error.message);
        return undefined;
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
        registeredAt: data.registered_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error: any) {
      console.error("Error in updateEventRegistration:", error.message);
      return undefined;
    }
  },

  async deleteEventRegistration(id: string): Promise<void> {
    try {
      const { data: regData, error: regError } = await supabase.from('event_registrations').select('event_id, payment_evidence').eq('id', id).single();
      if (regError) {
        console.error("Error fetching registration for deletion:", regError.message);
        throw new Error(`Failed to fetch registration: ${regError.message}`);
      }

      if (regData.payment_evidence) {
        const { error: storageError } = await supabase.storage.from('registrations').remove([regData.payment_evidence]);
        if (storageError) {
          console.error("Error deleting payment evidence:", storageError.message);
          throw new Error(`Failed to delete payment evidence: ${storageError.message}`);
        }
      }

      const { error: deleteError } = await supabase.from('event_registrations').delete().eq('id', id);
      if (deleteError) {
        console.error("Error deleting event registration:", deleteError.message);
        throw new Error(`Failed to delete registration: ${deleteError.message}`);
      }

      await supabase.rpc('decrement_attendees', { event_id: regData.event_id }).then(({ error }) => {
        if (error) console.error("Error decrementing attendees:", error.message);
      });
    } catch (error: any) {
      console.error("Error in deleteEventRegistration:", error.message);
      throw new Error(`Failed to delete registration: ${error.message}`);
    }
  },

  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    try {
      const { data, error } = await supabase.from('newsletter_subscriptions').insert({
        email: subscription.email,
        name: subscription.name,
      }).select().single();
      if (error) {
        console.error("Error creating newsletter subscription:", error.message);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at,
        createdAt: data.created_at,
      };
    } catch (error: any) {
      console.error("Error in createNewsletterSubscription:", error.message);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    try {
      const { data, error } = await supabase.from('newsletter_subscriptions').select('*').eq('email', email).single();
      if (error) {
        console.error("Error fetching newsletter subscription:", error.message);
        return undefined;
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at,
        createdAt: data.created_at,
      };
    } catch (error: any) {
      console.error("Error in getNewsletterSubscriptionByEmail:", error.message);
      return undefined;
    }
  },

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const { data, error } = await supabase.from('newsletter_subscriptions').select('*');
      if (error) {
        console.error("Error fetching all newsletter subscriptions:", error.message);
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }
      return data.map(s => ({
        id: s.id,
        email: s.email,
        name: s.name,
        subscribedAt: s.subscribed_at,
        createdAt: s.created_at,
      }));
    } catch (error: any) {
      console.error("Error in getAllNewsletterSubscriptions:", error.message);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
  },
};