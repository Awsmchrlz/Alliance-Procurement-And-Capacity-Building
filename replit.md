# Alliance Procurement and Capacity Building Limited Website

## Overview

This is a professional website for Alliance Procurement and Capacity Building Limited (APCB Ltd), a Zambian-owned private company specializing in procurement and supply chain management training, consultancy, and capacity building services. The application provides a comprehensive platform for professionals to discover training events, register for courses, and access procurement expertise across Southern Africa.

The website features a modern, responsive design with a blue and yellow color scheme that reflects the company's professional branding. It includes user authentication, event management, newsletter subscriptions, and both user and admin dashboards for managing training programs and registrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, implementing a modern single-page application (SPA) architecture. The application uses Wouter for client-side routing and TanStack Query for server state management. The UI is constructed with shadcn/ui components built on Radix UI primitives, providing accessibility and consistent design patterns.

**Key Frontend Decisions:**
- **React + TypeScript**: Chosen for type safety and component-based architecture
- **Wouter**: Lightweight routing solution preferred over React Router for smaller bundle size
- **TanStack Query**: Handles server state, caching, and background updates efficiently
- **shadcn/ui + Radix UI**: Provides accessible, customizable components with consistent design
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent styling

### Backend Architecture
The backend follows a RESTful API architecture using Express.js with TypeScript. The server implements JWT-based authentication with role-based access control (user/admin roles). The application uses an in-memory storage layer with an interface design that allows easy migration to a database implementation.

**Key Backend Decisions:**
- **Express.js**: Lightweight, flexible web framework for Node.js
- **JWT Authentication**: Stateless authentication for scalability
- **Interface-based Storage**: Abstraction layer allowing easy database migration
- **Middleware Pattern**: Organized request processing with authentication and authorization layers
- **Role-based Access Control**: Separate permissions for users and administrators

### Data Storage Solutions
The application currently uses an in-memory storage implementation but is architected with Drizzle ORM for PostgreSQL integration. The schema defines users, events, event registrations, and newsletter subscriptions with proper relationships and constraints.

**Database Design Decisions:**
- **PostgreSQL**: Chosen for reliability, ACID compliance, and advanced features
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **Schema-first Design**: Shared schema definitions between frontend and backend
- **UUID Primary Keys**: Globally unique identifiers for distributed systems

### Authentication and Authorization
The system implements JWT-based authentication with secure password hashing using bcryptjs. Role-based access control distinguishes between regular users and administrators, with protected routes and API endpoints.

**Security Features:**
- **bcryptjs**: Secure password hashing with salt
- **JWT Tokens**: Stateless authentication tokens
- **Protected Routes**: Client-side route protection based on authentication status
- **Middleware Guards**: Server-side endpoint protection with role verification

### Styling and Theming
The application implements a comprehensive design system with dark/light theme support. Custom CSS variables enable consistent theming across components, with the brand colors (blue and yellow) integrated throughout the design system.

**Design System Decisions:**
- **CSS Custom Properties**: Dynamic theming with CSS variables
- **Dark/Light Mode**: User preference-based theme switching
- **Brand Color Integration**: Custom blue and yellow color palette
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## External Dependencies

### UI and Component Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **shadcn/ui**: Pre-built component library based on Radix UI
- **lucide-react**: Modern icon library with consistent design
- **class-variance-authority**: Type-safe component variant management
- **tailwindcss**: Utility-first CSS framework

### Database and ORM
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-kit**: Database migration and introspection tools

### Authentication and Security
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and verification
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant form handling with minimal re-renders

### Development and Build Tools
- **vite**: Fast build tool with HMR support
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development

### Date and Utility Libraries
- **date-fns**: Modern date utility library
- **clsx**: Conditional className utility
- **wouter**: Minimalist routing for React