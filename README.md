# Alliance Procurement & Capacity Building Platform

A comprehensive event management and capacity building platform built with React, Express, and Supabase.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker installed
- Docker Hub account (for pushing images)
- Supabase project set up

### 1. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- Supabase URL and keys
- Database connection string
- Email service API key (Brevo or SendGrid)
- Session secret

### 2. Build Docker Image

```bash
docker build -t your-dockerhub-username/apcb-platform:latest .
```

### 3. Run Locally

```bash
docker run -p 5001:5001 --env-file .env your-dockerhub-username/apcb-platform:latest
```

Or use docker-compose:

```bash
docker-compose up
```

### 4. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push your-dockerhub-username/apcb-platform:latest
```

## 📦 Features

- **Event Management**: Create and manage training events
- **User Registration**: Multi-step registration with payment tracking
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **Document Management**: Upload and share documents with users
- **Sponsorship & Exhibition**: Manage event sponsors and exhibitors
- **Email Notifications**: Automated email campaigns and notifications
- **Payment Tracking**: Track payments with evidence upload
- **Soft Delete**: All deletions are soft deletes (data preserved)

## 🗄️ Database Setup

Run migrations in your Supabase SQL editor:

```sql
-- 1. Run the main schema
-- (Located in database-schema.sql)

-- 2. Add soft delete columns
-- (Located in db/migrations/add-soft-delete.sql)

-- 3. Add documents table
-- (Located in db/migrations/add-documents-table.sql)
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `BREVO_API_KEY` | Brevo email service API key | Yes* |
| `SENDGRID_API_KEY` | SendGrid API key (alternative) | Yes* |
| `SESSION_SECRET` | Random string for session encryption | Yes |
| `NODE_ENV` | Environment (production/development) | Yes |
| `PORT` | Application port (default: 5001) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `ADMIN_EMAIL` | Admin email for notifications | Yes |

*Either BREVO_API_KEY or SENDGRID_API_KEY is required

## 🏗️ Architecture

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/          # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── email-service.ts # Email functionality
├── shared/          # Shared types and schemas
├── db/              # Database migrations
└── Dockerfile       # Docker configuration
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run check
```

## 📝 API Endpoints

### Public
- `GET /api/events` - List all events
- `GET /api/documents` - List all documents
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/sponsorships/register` - Sponsorship application
- `POST /api/exhibitions/register` - Exhibition application

### Protected (Authenticated)
- `POST /api/events/register` - Register for event
- `GET /api/user/registrations` - User's registrations

### Admin Only
- `GET /api/admin/users` - List all users
- `GET /api/admin/registrations` - List all registrations
- `POST /api/admin/documents` - Upload document
- `DELETE /api/admin/documents/:id` - Delete document
- `PATCH /api/admin/registrations/:id` - Update registration
- `DELETE /api/admin/users/:id` - Soft delete user

## 🚢 Deployment

### Using GitHub Actions

The project includes a CI/CD pipeline that automatically:
1. Builds and tests the application
2. Creates a Docker image
3. Pushes to Docker Hub
4. Runs security scans

Configure these secrets in GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

### Manual Deployment

```bash
# Build
docker build -t your-username/apcb-platform:latest .

# Push
docker push your-username/apcb-platform:latest

# Deploy on server
docker pull your-username/apcb-platform:latest
docker run -d -p 5001:5001 --env-file .env --name apcb your-username/apcb-platform:latest
```

## 📊 Admin Features

- User management with role-based access control
- Event registration tracking
- Payment status management
- Document upload and management
- Email campaigns to user groups
- Analytics dashboard
- Sponsorship and exhibition management

## 🔒 Security

- JWT-based authentication via Supabase
- Role-based access control (Super Admin, Finance, Event Manager, User)
- Secure password hashing
- CORS protection
- Environment variable configuration
- Soft delete for data preservation

## 📄 License

Proprietary - Alliance Procurement & Capacity Building Ltd.

## 🤝 Support

For support, email: globaltrainingalliance@gmail.com
