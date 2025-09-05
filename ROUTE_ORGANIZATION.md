# Route Organization Documentation

## Overview

The Alliance Procurement & Capacity Building application has been restructured to use a clean, modular route organization pattern. All routes have been separated into logical modules for better maintainability and easier management.

## Route Module Structure

```
server/routes/
├── middleware.ts     # Shared authentication and authorization middleware
├── auth.ts          # Authentication routes
├── admin.ts         # Administrative routes
├── user.ts          # User-specific routes
└── events.ts        # Public event routes
```

## Module Details

### 1. Middleware Module (`server/routes/middleware.ts`)

Contains all shared middleware and utilities:

**Exports:**
- `Roles` - Role constants (SuperAdmin, Finance, EventManager, Ordinary)
- `authenticateSupabase` - JWT token verification middleware
- `requireRoles(roles)` - Role-based authorization middleware
- `requireSuperAdmin` - Super admin only middleware
- `requireAdmin` - Any admin role middleware
- `requireFinance` - Finance permissions middleware
- `requireEventManager` - Event management permissions middleware
- `requireOwnerOrAdmin()` - Resource ownership or admin access middleware
- `handleRouteError()` - Standardized error handling utility

### 2. Authentication Routes (`server/routes/auth.ts`)

Handles user authentication and account management:

**Endpoints:**
- `POST /api/auth/register` - Public user registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (token invalidation)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `PATCH /api/auth/change-password` - Change password (authenticated users)

### 3. Admin Routes (`server/routes/admin.ts`)

Administrative functions for user and system management:

**User Management:**
- `POST /api/admin/users/register` - Create new user (Super Admin only)
- `GET /api/admin/users` - List all users with stats (Super Admin only)
- `PATCH /api/admin/users/:userId/role` - Update user role (Super Admin only)

**Event Management:**
- `GET /api/admin/events` - List events with detailed stats (All admin roles)
- `POST /api/admin/events` - Create new event (Event Manager+)
- `PATCH /api/admin/events/:eventId` - Update event (Event Manager+)
- `DELETE /api/admin/events/:eventId` - Delete event (Super Admin only)

**Registration Management:**
- `GET /api/admin/registrations` - List all registrations with filters (All admin roles)
- `POST /api/admin/events/register` - Register user for event (Event Manager+)
- `PATCH /api/admin/registrations/:registrationId` - Update payment status (Finance+)

**Payment Evidence:**
- `GET /api/admin/payment-evidence/:evidencePath` - View payment evidence (Finance+)
- `PUT /api/admin/payment-evidence/:registrationId` - Update payment evidence (Finance+)

**Communication:**
- `GET /api/admin/newsletter-subscriptions` - List newsletter subscribers (Super Admin only)
- `POST /api/admin/email-blast` - Send email blast (Super Admin only)

### 4. User Routes (`server/routes/user.ts`)

User-specific operations and self-service functions:

**Event Registration:**
- `POST /api/events/register` - Register for event (authenticated users)

**User Dashboard:**
- `GET /api/users/:userId/registrations` - Get user's registrations
- `PATCH /api/users/:userId/registrations/:registrationId/cancel` - Cancel registration
- `DELETE /api/users/:userId/registrations/:registrationId` - Delete registration (Admin only)

**Payment Evidence (User Access):**
- `GET /api/users/payment-evidence/:evidencePath` - View own payment evidence
- `PUT /api/users/payment-evidence/:registrationId` - Update own payment evidence

**Profile Management:**
- `PATCH /api/users/:userId/profile` - Update user profile

**Newsletter:**
- `POST /api/newsletter/subscribe` - Subscribe to newsletter (public)

**Notifications:**
- `POST /api/notifications/registration-confirmation` - Send registration confirmation

### 5. Event Routes (`server/routes/events.ts`)

Public event information and discovery:

**Event Discovery:**
- `GET /api/events` - List all public events
- `GET /api/events/upcoming` - List upcoming events with availability
- `GET /api/events/past` - List past events
- `GET /api/events/category/:category` - Filter events by tag/category
- `GET /api/events/search` - Search events with filters

**Event Details:**
- `GET /api/events/:eventId` - Get specific event with registration stats

## Main Routes File

The main `server/routes.ts` file now acts as a coordinator:

```typescript
import { registerAuthRoutes } from "./routes/auth";
import { registerAdminRoutes } from "./routes/admin";
import { registerUserRoutes } from "./routes/user";
import { registerEventRoutes } from "./routes/events";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure file upload middleware
  app.use(fileUpload(options));
  
  // Register all route modules
  registerAuthRoutes(app);
  registerAdminRoutes(app);
  registerUserRoutes(app);
  registerEventRoutes(app);
  
  return createServer(app);
}
```

## Security & Authorization

### Role-Based Access Control

The system uses four role levels:
1. **Super Admin** - Full system access
2. **Finance Person** - Payment and financial operations
3. **Event Manager** - Event creation and management
4. **Ordinary User** - Basic user functions

### Route Protection

Routes are protected using middleware:
```typescript
// Super admin only
app.get('/api/admin/users', authenticateSupabase, requireSuperAdmin, handler);

// Finance permissions
app.patch('/api/admin/registrations/:id', authenticateSupabase, requireFinance, handler);

// Owner or admin access
app.get('/api/users/:userId/registrations', authenticateSupabase, requireOwnerOrAdmin(), handler);
```

## Error Handling

Standardized error handling using `handleRouteError()` utility:
- Consistent error response format
- Automatic error logging
- Environment-specific error details
- HTTP status code mapping

## Benefits of This Organization

1. **Maintainability** - Logical separation of concerns
2. **Security** - Centralized authentication and authorization
3. **Testability** - Modular structure enables focused testing
4. **Scalability** - Easy to add new modules or extend existing ones
5. **Code Reuse** - Shared middleware and utilities
6. **Documentation** - Clear API structure and responsibilities

## Usage Examples

### Adding a New Route

1. Determine which module it belongs to (or create a new one)
2. Add the route handler to the appropriate module
3. Use shared middleware for authentication and authorization
4. Use `handleRouteError()` for consistent error handling

### Extending Permissions

1. Add new role to `Roles` enum in middleware
2. Create specific middleware function if needed
3. Apply to routes as required

## Development Notes

- All routes use TypeScript for type safety
- Supabase integration for authentication and data storage
- File upload support for payment evidence
- Consistent logging and error reporting
- Environment-specific configurations