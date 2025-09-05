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

// Create optimized Supabase client with connection pooling
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Disable session persistence to save memory
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      Connection: "keep-alive",
      "Keep-Alive": "timeout=5, max=1000",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2, // Limit realtime events
    },
  },
});

// Connection pool for database queries
let connectionPool: any = null;
const MAX_CONNECTIONS = 5; // Limit concurrent connections

const getConnection = async () => {
  if (!connectionPool) {
    // Initialize minimal connection pool
    connectionPool = supabase;
  }
  return connectionPool;
};

interface UserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  created_at: string;
}

// Cache for frequently accessed data (with TTL)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any, ttl: number = CACHE_TTL) => {
  // Limit cache size to prevent memory leaks
  if (cache.size >= 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key);
    }
  }
}, 60000); // Clean every minute

export const storage = {
  async generateRegistrationNumber(): Promise<string> {
    try {
      const cacheKey = "registration_count";
      let count = getCached(cacheKey);

      if (count === null) {
        const { count: dbCount, error } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.error("Error getting registration count:", error);
          throw error;
        }

        count = dbCount || 0;
        setCache(cacheKey, count, 30000); // Cache for 30 seconds
      }

      const nextNumber = count + 1;
      return nextNumber.toString().padStart(4, "0");
    } catch (error: any) {
      console.error("Error generating registration number:", error);
      throw error;
    }
  },

  async createUser(userData: InsertUser): Promise<UserResponse> {
    try {
      const connection = await getConnection();

      // Create user in Supabase Auth with minimal metadata
      const { data: authData, error: authError } =
        await connection.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            role: userData.role || "ordinary_user",
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        });

      if (authError) {
        console.error("Supabase Auth error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user in Supabase Auth");
      }

      // Insert minimal user data
      const { data: dbUserData, error: dbError } = await connection
        .from("users")
        .insert({
          id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: userData.phoneNumber || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        // Cleanup auth user if database insert fails
        await connection.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }

      // Clear relevant caches
      cache.delete("all_users");

      return {
        id: authData.user.id,
        email: authData.user.email!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || null,
        role: (authData.user.user_metadata?.role as string) || "ordinary_user",
        createdAt: dbUserData.created_at,
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    try {
      const cacheKey = `user_${email}`;
      let cachedUser = getCached(cacheKey);

      if (cachedUser) {
        return cachedUser;
      }

      const connection = await getConnection();
      const { data: authData, error: authError } =
        await connection.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (authError) {
        console.error("Error fetching users from Supabase Auth:", authError);
        throw authError;
      }

      const authUser = authData.users.find((user) => user.email === email);
      if (!authUser) {
        return null;
      }

      // Get additional user data from database
      const { data: dbData, error: dbError } = await connection
        .from("users")
        .select("first_name, last_name, phone_number, created_at")
        .eq("id", authUser.id)
        .single();

      if (dbError && dbError.code !== "PGRST116") {
        console.error("Database query error:", dbError);
        throw dbError;
      }

      const user: UserResponse = {
        id: authUser.id,
        email: authUser.email!,
        firstName:
          dbData?.first_name || authUser.user_metadata?.first_name || "",
        lastName: dbData?.last_name || authUser.user_metadata?.last_name || "",
        phoneNumber: dbData?.phone_number || null,
        role: (authUser.user_metadata?.role as string) || "ordinary_user",
        createdAt: dbData?.created_at || authUser.created_at,
      };

      setCache(cacheKey, user);
      return user;
    } catch (error: any) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },

  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const cacheKey = "all_users";
      let cachedUsers = getCached(cacheKey);

      if (cachedUsers) {
        return cachedUsers;
      }

      const connection = await getConnection();

      // Use pagination to avoid loading too much data at once
      const { data: authData, error: authError } =
        await connection.auth.admin.listUsers({
          page: 1,
          perPage: 100, // Limit to 100 users at a time
        });

      if (authError) {
        console.error("Error fetching users from Supabase Auth:", authError);
        throw authError;
      }

      // Get user data from database in batches
      const userIds = authData.users.map((user) => user.id);
      const { data: dbData, error: dbError } = await connection
        .from("users")
        .select("id, first_name, last_name, phone_number, created_at")
        .in("id", userIds);

      if (dbError) {
        console.error("Database query error:", dbError);
        throw dbError;
      }

      // Create user map for efficient lookup
      const dbUserMap = new Map(dbData?.map((user) => [user.id, user]) || []);

      const users: UserResponse[] = authData.users.map((authUser) => {
        const dbUser = dbUserMap.get(authUser.id);
        return {
          id: authUser.id,
          email: authUser.email!,
          firstName:
            dbUser?.first_name || authUser.user_metadata?.first_name || "",
          lastName:
            dbUser?.last_name || authUser.user_metadata?.last_name || "",
          phoneNumber: dbUser?.phone_number || null,
          role: (authUser.user_metadata?.role as string) || "ordinary_user",
          createdAt: dbUser?.created_at || authUser.created_at,
        };
      });

      setCache(cacheKey, users, 60000); // Cache for 1 minute
      return users;
    } catch (error: any) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const connection = await getConnection();

      const { error } = await connection.auth.admin.updateUserById(userId, {
        user_metadata: { role },
      });

      if (error) {
        console.error("Error updating user role:", error);
        throw error;
      }

      // Clear relevant caches
      cache.delete("all_users");
      for (const [key] of cache.entries()) {
        if (key.startsWith("user_")) {
          cache.delete(key);
        }
      }
    } catch (error: any) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  // Cleanup method to be called on shutdown
  cleanup(): void {
    cache.clear();
    connectionPool = null;
  },
};

// Cleanup on process exit
process.on("exit", () => {
  storage.cleanup();
});
