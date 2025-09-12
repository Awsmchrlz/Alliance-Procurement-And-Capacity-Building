import { createClient } from "@supabase/supabase-js";
import {
  User,
  UserResponse,
  InsertUser,
  Event,
  InsertEvent,
  EventRegistration,
  InsertEventRegistration,
  NewsletterSubscription,
  InsertNewsletterSubscription,
} from "@shared/schema";

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
  gender: string | null;
  created_at: string;
}

export const storage = {
  async generateRegistrationNumber(): Promise<string> {
    try {
      // Use database sequence function to generate unique registration number
      const { data, error } = await supabase.rpc(
        "generate_registration_number",
      );

      if (error) {
        console.error("Error generating registration number:", error);
        throw error;
      }

      return data || "0001";
    } catch (error: any) {
      console.error("Error generating registration number:", error);
      // Fallback to timestamp-based number if database function fails
      const timestamp = Date.now().toString().slice(-4);
      return timestamp.padStart(4, "0");
    }
  },
  async getUser(id: string): Promise<UserResponse | undefined> {
    try {
      // Fetch from public.users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, phone_number, gender, created_at")
        .eq("id", id)
        .single();
      if (userError || !userData) {
        console.error(
          "Error fetching user from users table:",
          userError?.message,
        );
        return undefined;
      }

      // Fetch email and role from auth.users
      const { data: authData, error: authError } =
        await supabase.auth.admin.getUserById(id);
      if (authError || !authData.user) {
        console.error("Error fetching auth user:", authError?.message);
        return undefined;
      }

      return {
        id: userData.id,
        email: authData.user.email || "",
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        gender: userData.gender,
        role: authData.user.user_metadata?.role || "ordinary_user",
        createdAt: userData.created_at,
      };
    } catch (error: any) {
      console.error("Error in getUser:", error.message);
      return undefined;
    }
  },

  async getUserByEmail(email: string): Promise<UserResponse | undefined> {
    try {
      // Fetch auth user by email
      const { data: authUsers, error: authError } =
        await supabase.auth.admin.listUsers();
      if (authError) {
        console.error("Error fetching auth users:", authError.message);
        return undefined;
      }
      const authUser = authUsers.users.find((u) => u.email === email);
      if (!authUser) {
        return undefined;
      }

      // Fetch from public.users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, phone_number, gender, created_at")
        .eq("id", authUser.id)
        .single();
      if (userError || !userData) {
        console.error(
          "Error fetching user by email from users table:",
          userError?.message,
        );
        return undefined;
      }

      return {
        id: userData.id,
        email: authUser.email || "",
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        gender: userData.gender,
        role: authUser.user_metadata?.role || "ordinary_user",
        createdAt: userData.created_at,
      };
    } catch (error: any) {
      console.error("Error in getUserByEmail:", error.message);
      return undefined;
    }
  },

  async createUser(user: InsertUser): Promise<UserResponse> {
    console.log("🚀 Starting user creation process...");
    console.log("📝 User data:", {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    // Validate required fields
    if (!user.email || !user.password || !user.firstName || !user.lastName) {
      const missingFields = [];
      if (!user.email) missingFields.push('email');
      if (!user.password) missingFields.push('password');
      if (!user.firstName) missingFields.push('firstName');
      if (!user.lastName) missingFields.push('lastName');
      throw new Error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error(`❌ Invalid email format: ${user.email}`);
    }

    // Password validation
    if (user.password.length < 6) {
      throw new Error(`❌ Password must be at least 6 characters long`);
    }

    // Check if this is the first user (should be super_admin)
    console.log("🔍 Checking if this is the first user...");
    const allUsers = await this.getAllUsers();
    const isFirstUser = allUsers.length === 0;
    const assignedRole = isFirstUser ? "super_admin" : (user.role || "ordinary_user");

    console.log(`👤 User will be assigned role: ${assignedRole} (first user: ${isFirstUser})`);

    let authUserId: string | null = null;

    try {
      // Step 1: Check if user already exists in auth
      console.log("🔍 Checking for existing user in auth system...");
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingUsers.users.find(u => u.email === user.email);
      
      if (existingAuthUser) {
        throw new Error(`❌ User with email ${user.email} already exists in authentication system`);
      }

      // Step 2: Create user in Supabase Auth
      console.log("📝 Creating Supabase auth user...");
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Skip email confirmation
          phone_confirm: true, // Skip phone confirmation if applicable
          user_metadata: {
            role: assignedRole,
            first_name: user.firstName,
            last_name: user.lastName,
            phone_number: user.phoneNumber,
            gender: user.gender,
          }
        });
      
      if (authError) {
        console.error("❌ Failed to create Supabase auth user:");
        console.error(`   Error Code: ${authError.status || 'unknown'}`);
        console.error(`   Error Message: ${authError.message}`);
        
        if (authError.message.includes('duplicate') || authError.message.includes('already')) {
          throw new Error(`❌ User with email ${user.email} already exists`);
        } else if (authError.message.includes('password')) {
          throw new Error(`❌ Password validation failed: ${authError.message}`);
        } else if (authError.message.includes('email')) {
          throw new Error(`❌ Email validation failed: ${authError.message}`);
        }
        
        throw new Error(`❌ Auth user creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("❌ Auth user creation succeeded but returned no user data");
      }

      authUserId = authData.user.id;
      console.log(`✅ Supabase auth user created successfully`);
      console.log(`   User ID: ${authUserId}`);
      console.log(`   Email: ${authData.user.email}`);

      // Ensure email is confirmed if it wasn't set during creation
      if (!authData.user.email_confirmed_at) {
        console.log("📧 Manually confirming email address...");
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authUserId,
          { email_confirm: true }
        );
        if (confirmError) {
          console.warn("⚠️ Failed to confirm email, but continuing:", confirmError.message);
        } else {
          console.log("✅ Email confirmed successfully");
        }
      }

      // Step 3: Check if user profile already exists
      console.log("🔍 Checking for existing user profile...");
      const { data: existingProfile } = await supabase
        .from("users")
        .select('id')
        .eq('id', authUserId)
        .single();
        
      if (existingProfile) {
        console.log(`ℹ️ User profile with ID ${authUserId} already exists, skipping profile creation`);
        // Return the existing user data instead of throwing an error
        const { data: existingUserData } = await supabase
          .from("users")
          .select('*')
          .eq('id', authUserId)
          .single();
        
        return {
          id: existingUserData.id,
          firstName: existingUserData.first_name,
          lastName: existingUserData.last_name,
          email: user.email, // Use the email from the input since it's not stored in users table
          phoneNumber: existingUserData.phone_number,
          gender: existingUserData.gender,
          role: assignedRole,
          createdAt: existingUserData.created_at,
        };
      }

      // Step 4: Create user record in public.users table
      console.log("📝 Creating user profile record in database...");
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert({
          id: authUserId,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          gender: user.gender,
        })
        .select()
        .single();

      if (userError) {
        console.error("❌ Failed to create user profile record:");
        console.error(`   Error Code: ${userError.code || 'unknown'}`);
        console.error(`   Error Message: ${userError.message}`);
        console.error(`   Error Details: ${userError.details || 'none'}`);
        console.error(`   Error Hint: ${userError.hint || 'none'}`);
        
        let errorMessage = "Failed to create user profile";
        
        if (userError.code === '23505') {
          errorMessage = `❌ User profile already exists for ID ${authUserId}`;
        } else if (userError.code === '23503') {
          errorMessage = `❌ Foreign key violation - auth user ${authUserId} may not exist`;
        } else if (userError.code === '42501') {
          errorMessage = `❌ Permission denied - check database permissions`;
        } else if (userError.message.includes('duplicate')) {
          errorMessage = `❌ Duplicate user profile detected`;
        }
        
        // Rollback: Delete the auth user since database insert failed
        console.log("🔄 Rolling back auth user creation due to profile creation failure...");
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
          if (deleteError) {
            console.error("❌ Failed to rollback auth user:", deleteError.message);
            errorMessage += ` (Warning: Auth user ${authUserId} may still exist and need manual cleanup)`;
          } else {
            console.log("✅ Auth user rollback successful");
          }
        } catch (rollbackError) {
          console.error("❌ Rollback operation failed:", rollbackError);
          errorMessage += ` (Warning: Auth user ${authUserId} may still exist and need manual cleanup)`;
        }
        
        throw new Error(`${errorMessage}: ${userError.message}`);
      }

      if (!userData) {
        console.error("❌ User profile creation succeeded but returned no data");
        // Rollback auth user
        console.log("🔄 Rolling back auth user due to missing profile data...");
        try {
          await supabase.auth.admin.deleteUser(authUserId);
          console.log("✅ Auth user rollback successful");
        } catch (rollbackError) {
          console.error("❌ Rollback failed:", rollbackError);
        }
        throw new Error("❌ User profile creation succeeded but returned no data");
      }

      console.log(`✅ User profile record created successfully`);
      console.log(`   Profile ID: ${userData.id}`);
      console.log(`   Name: ${userData.first_name} ${userData.last_name}`);

      // Step 5: Verify complete user setup
      console.log("🔍 Verifying complete user setup...");
      const { data: verifyAuth } = await supabase.auth.admin.getUserById(authUserId);
      const { data: verifyProfile } = await supabase
        .from("users")
        .select('*')
        .eq('id', authUserId)
        .single();

      if (!verifyAuth.user || !verifyProfile) {
        throw new Error("❌ User verification failed - incomplete user setup detected");
      }

      const userResponse: UserResponse = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: user.email,
        phoneNumber: userData.phone_number,
        gender: userData.gender,
        role: assignedRole,
        createdAt: userData.created_at,
      };

      console.log("🎉 User creation completed successfully!");
      console.log("📊 Final user details:", {
        id: userResponse.id,
        email: userResponse.email,
        role: userResponse.role,
        name: `${userResponse.firstName} ${userResponse.lastName}`,
        createdAt: userResponse.createdAt
      });

      return userResponse;
    } catch (error: any) {
      console.error("💥 User creation process failed:");
      console.error(`   Error: ${error.message}`);
      
      // Emergency rollback if we have an auth user ID
      if (authUserId) {
        console.log("🚨 Emergency rollback: attempting to delete auth user...");
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(authUserId);
          if (deleteError) {
            console.error("❌ Emergency rollback failed:", deleteError.message);
            console.error(`⚠️  Manual cleanup required for auth user ID: ${authUserId}`);
          } else {
            console.log("✅ Emergency rollback completed successfully");
          }
        } catch (rollbackError) {
          console.error("❌ Emergency rollback operation failed:", rollbackError);
          console.error(`⚠️  Manual cleanup required for auth user ID: ${authUserId}`);
        }
      }
      
      // Re-throw with enhanced error message
      if (error.message && error.message.startsWith('❌')) {
        throw error; // Already formatted
      } else {
        throw new Error(`❌ User creation failed: ${error.message || 'Unknown error'}`);
      }
    }
  },

  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, phone_number, gender, created_at");
      if (userError) {
        console.error("Error fetching all users:", userError.message);
        throw new Error(`Failed to fetch users: ${userError.message}`);
      }

      const users = await Promise.all(
        userData.map(async (u: UserRow) => {
          const { data: authData, error: authError } =
            await supabase.auth.admin.getUserById(u.id);
          if (authError) {
            console.error(
              `Error fetching auth user ${u.id}:`,
              authError.message,
            );
            return undefined;
          }
          return {
            id: u.id,
            email: authData.user.email || "",
            firstName: u.first_name,
            lastName: u.last_name,
            phoneNumber: u.phone_number,
            gender: u.gender,
            role: authData.user.user_metadata?.role || "ordinary_user",
            createdAt: u.created_at ? new Date(u.created_at) : null,
          };
        }),
      );

      return users.filter((u): u is UserResponse => u !== undefined);
    } catch (error: any) {
      console.error("Error in getAllUsers:", error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async getEvent(id: string): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
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
      };
    } catch (error: any) {
      console.error("Error in getEvent:", error.message);
      return undefined;
    }
  },

  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date");
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
        createdAt: e.created_at,
      }));
    } catch (error: any) {
      console.error("Error in getAllEvents:", error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  },

  async createEvent(event: InsertEvent): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
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
        })
        .select()
        .single();
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
      };
    } catch (error: any) {
      console.error("Error in createEvent:", error.message);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },

  async updateEvent(
    id: string,
    updates: Partial<Event>,
  ): Promise<Event | undefined> {
    try {
      const { data, error } = await supabase
        .from("events")
        .update({
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
        })
        .eq("id", id)
        .select()
        .single();
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
      };
    } catch (error: any) {
      console.error("Error in updateEvent:", error.message);
      return undefined;
    }
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
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

  async getEventRegistration(
    id: string,
  ): Promise<EventRegistration | undefined> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error fetching event registration:", error.message);
        return undefined;
      }
      return {
        id: data.id,
        registrationNumber: data.registration_number,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,
        registeredAt: data.registered_at,

        country: data.country,
        organization: data.organization,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        paymentMethod: data.payment_method,
        currency: data.currency,
        pricePaid: data.price_paid,
        delegateType: data.delegate_type,
      };
    } catch (error: any) {
      console.error("Error in getEventRegistration:", error.message);
      return undefined;
    }
  },

  async getEventRegistrationsByUser(
    userId: string,
  ): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", userId);
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

        country: r.country,
        organization: r.organization,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        paymentMethod: r.payment_method,
        currency: r.currency,
        pricePaid: r.price_paid,
        delegateType: r.delegate_type,
        registeredAt: r.registered_at,
      }));
    } catch (error: any) {
      console.error("Error in getEventRegistrationsByUser:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async getEventRegistrationsByEvent(
    eventId: string,
  ): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId);
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
        country: r.country,
        organization: r.organization,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        paymentMethod: r.payment_method,
        currency: r.currency,
        pricePaid: r.price_paid,
        delegateType: r.delegate_type,
        registeredAt: r.registered_at,
      }));
    } catch (error: any) {
      console.error("Error in getEventRegistrationsByEvent:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async getAllEventRegistrations(): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*");
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
        registeredAt: r.registered_at,
        gender: r.gender,
        country: r.country,
        organization: r.organization,
        organizationType: r.organization_type,
        position: r.position,
        notes: r.notes,
        hasPaid: r.has_paid,
        paymentEvidence: r.payment_evidence,
        paymentMethod: r.payment_method,
        currency: r.currency,
        pricePaid: r.price_paid,
        delegateType: r.delegate_type,
      }));
    } catch (error: any) {
      console.error("Error in getAllEventRegistrations:", error.message);
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  },

  async createEventRegistration(
    registration: InsertEventRegistration,
  ): Promise<EventRegistration> {
    try {
      // Generate registration number
      const registrationNumber = await this.generateRegistrationNumber();

      const { data, error } = await supabase
        .from("event_registrations")
        .insert({
          registration_number: registrationNumber,
          event_id: registration.eventId,
          user_id: registration.userId,
          payment_status: registration.paymentStatus || "pending",

          country: registration.country,
          organization: registration.organization,
          position: registration.position,
          notes: registration.notes,
          has_paid: registration.hasPaid || false,
          payment_evidence: registration.paymentEvidence,
          payment_method: registration.paymentMethod,
          currency: registration.currency,
          price_paid: registration.pricePaid,
          delegate_type: registration.delegateType,
        })
        .select()
        .single();
      if (error) {
        console.error("Error creating event registration:", error.message);
        throw new Error(`Failed to create registration: ${error.message}`);
      }
      await supabase
        .rpc("increment_attendees", { event_id: registration.eventId })
        .then(({ error: rpcError }) => {
          if (rpcError)
            console.error("Error incrementing attendees:", rpcError.message);
        });
      return {
        id: data.id,
        registrationNumber: data.registration_number,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,

        country: data.country,
        organization: data.organization,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        paymentMethod: data.payment_method,
        currency: data.currency,
        pricePaid: data.price_paid,
        delegateType: data.delegate_type,
        registeredAt: data.registered_at,
      };
    } catch (error: any) {
      console.error("Error in createEventRegistration:", error.message);
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  },

  async updateEventRegistration(
    id: string,
    updates: Partial<EventRegistration>,
  ): Promise<EventRegistration | undefined> {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .update({
          payment_status: updates.paymentStatus,

          country: updates.country,
          organization: updates.organization,
          position: updates.position,
          notes: updates.notes,
          has_paid: updates.hasPaid,
          payment_evidence: updates.paymentEvidence,
          payment_method: updates.paymentMethod,
          currency: updates.currency,
          price_paid: updates.pricePaid,
          delegate_type: updates.delegateType,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("Error updating event registration:", error.message);
        return undefined;
      }
      return {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        paymentStatus: data.payment_status,

        country: data.country,
        organization: data.organization,
        position: data.position,
        notes: data.notes,
        hasPaid: data.has_paid,
        paymentEvidence: data.payment_evidence,
        paymentMethod: data.payment_method,
        currency: data.currency,
        pricePaid: data.price_paid,
        delegateType: data.delegate_type,
        registrationNumber: data.registration_number,
        registeredAt: data.registered_at,
      };
    } catch (error: any) {
      console.error("Error in updateEventRegistration:", error.message);
      return undefined;
    }
  },

  async cancelEventRegistration(id: string): Promise<void> {
    try {
      const { data: regData, error: regError } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("id", id)
        .single();
      if (regError) {
        console.error(
          "Error fetching registration for cancellation:",
          regError.message,
        );
        throw new Error(`Failed to fetch registration: ${regError.message}`);
      }

      const { error: updateError } = await supabase
        .from("event_registrations")
        .update({
          payment_status: "cancelled",
          has_paid: false,
        })
        .eq("id", id);

      if (updateError) {
        console.error(
          "Error cancelling event registration:",
          updateError.message,
        );
        throw new Error(
          `Failed to cancel registration: ${updateError.message}`,
        );
      }

      // Decrement attendees count
      await supabase
        .rpc("decrement_attendees", { event_id: regData.event_id })
        .then(({ error }) => {
          if (error)
            console.error("Error decrementing attendees:", error.message);
        });
    } catch (error: any) {
      console.error("Error in cancelEventRegistration:", error.message);
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
  },

  async deleteEventRegistration(id: string): Promise<void> {
    try {
      const { data: regData, error: regError } = await supabase
        .from("event_registrations")
        .select("event_id, payment_evidence")
        .eq("id", id)
        .single();
      if (regError) {
        console.error(
          "Error fetching registration for deletion:",
          regError.message,
        );
        throw new Error(`Failed to fetch registration: ${regError.message}`);
      }

      if (regData.payment_evidence) {
        const { error: storageError } = await supabase.storage
          .from("registrations")
          .remove([regData.payment_evidence]);
        if (storageError) {
          console.error(
            "Error deleting payment evidence:",
            storageError.message,
          );
          throw new Error(
            `Failed to delete payment evidence: ${storageError.message}`,
          );
        }
      }

      const { error: deleteError } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", id);
      if (deleteError) {
        console.error(
          "Error deleting event registration:",
          deleteError.message,
        );
        throw new Error(
          `Failed to delete registration: ${deleteError.message}`,
        );
      }

      await supabase
        .rpc("decrement_attendees", { event_id: regData.event_id })
        .then(({ error }) => {
          if (error)
            console.error("Error decrementing attendees:", error.message);
        });
    } catch (error: any) {
      console.error("Error in deleteEventRegistration:", error.message);
      throw new Error(`Failed to delete registration: ${error.message}`);
    }
  },

  async createNewsletterSubscription(
    subscription: InsertNewsletterSubscription,
  ): Promise<NewsletterSubscription> {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email: subscription.email,
          name: subscription.name,
        })
        .select()
        .single();
      if (error) {
        console.error("Error creating newsletter subscription:", error.message);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at,
      };
    } catch (error: any) {
      console.error("Error in createNewsletterSubscription:", error.message);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  },

  async getNewsletterSubscriptionByEmail(
    email: string,
  ): Promise<NewsletterSubscription | undefined> {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .select("*")
        .eq("email", email)
        .single();
      if (error) {
        console.error("Error fetching newsletter subscription:", error.message);
        return undefined;
      }
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subscribedAt: data.subscribed_at,
      };
    } catch (error: any) {
      console.error(
        "Error in getNewsletterSubscriptionByEmail:",
        error.message,
      );
      return undefined;
    }
  },

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .select("*");
      if (error) {
        console.error(
          "Error fetching all newsletter subscriptions:",
          error.message,
        );
        throw new Error(`Failed to fetch subscriptions: ${error.message}`);
      }
      return data.map((s) => ({
        id: s.id,
        email: s.email,
        name: s.name,
        subscribedAt: s.subscribed_at,
      }));
    } catch (error: any) {
      console.error("Error in getAllNewsletterSubscriptions:", error.message);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
  },
};
