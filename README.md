# Alliance Procurement and Capacity Building Platform

A comprehensive event management and registration platform for the Alliance Procurement and Capacity Building organization.

## 🚀 Features

- **Event Management**: Create, manage, and track events
- **User Registration**: Secure user authentication and registration
- **Event Registration**: Allow users to register for events with payment tracking
- **Sponsorship Management**: Handle sponsorship applications and approvals
- **Exhibition Management**: Manage exhibition booth registrations
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects
- **Payment Tracking**: Track payment status and evidence
- **Email Notifications**: Automated email notifications for various events
- **Role-Based Access Control**: Super Admin, Finance, Event Manager, and User roles

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Deployment**: Docker, Docker Hub

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)
- Supabase account
- Resend account (for emails)

## 🔧 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/apcb-platform.git
   cd apcb-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t apcb-platform .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:3000

## 🐳 Docker Hub

The application is automatically built and pushed to Docker Hub via GitHub Actions.

### Pull from Docker Hub
```bash
docker pull yourusername/apcb-platform:latest
```

### Run from Docker Hub
```bash
docker run -d \
  -p 3000:3000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  --name apcb-app \
  yourusername/apcb-platform:latest
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated builds and deployments:

- **Trigger**: Push to main/master/develop branches or version tags
- **Build**: Multi-platform Docker images (amd64, arm64)
- **Push**: Automatically pushed to Docker Hub
- **Security**: Trivy vulnerability scanning
- **Tags**: Automatic versioning based on git tags

### Setting up GitHub Actions

1. Add secrets to your GitHub repository:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token

2. Push to main branch or create a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 📁 Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── email-service.ts   # Email functionality
├── shared/                # Shared types and schemas
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── Dockerfile             # Production Docker image
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Dependencies and scripts
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 3000) | No |

## 👥 User Roles

1. **Super Admin**: Full access to all features including user management
2. **Finance Person**: Manage payments and financial aspects
3. **Event Manager**: Create and manage events
4. **Ordinary User**: Register for events and view information

## 🚀 Deployment

### Production Deployment

#### Option 1: Docker
```bash
docker pull yourusername/apcb-platform:latest
docker run -d -p 3000:3000 --env-file .env apcb-platform:latest
```

#### Option 2: Docker Compose
```bash
docker-compose -f docker-compose.yml up -d
```

#### Option 3: Kubernetes
```bash
# Quick deploy
kubectl apply -f k8s/apcb-deployment.yaml

# Or use the deployment script
./k8s/deploy.sh production

# Or use kustomize for environment-specific configs
kubectl apply -k k8s/overlays/production/
```

See [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment instructions.

### Supabase Configuration

1. **Database Setup**:
   - Run `database-schema.sql` in Supabase SQL editor
   - Set up Row Level Security (RLS) policies

2. **Storage Buckets**:
   - Create `payment-evidence` bucket (public read, authenticated write)

3. **Authentication**:
   - Configure email templates
   - Add redirect URLs for password reset

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/find-user` - Find user by email/phone

### Event Endpoints
- `GET /api/events` - Get all events
- `POST /api/events/register` - Register for event
- `GET /api/admin/events` - Admin: Get all events
- `POST /api/admin/events` - Admin: Create event

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user (Super Admin only)
- `GET /api/admin/registrations` - Get all registrations
- `DELETE /api/admin/registrations/:id` - Delete registration (Super Admin only)
- `GET /api/admin/sponsorships` - Get all sponsorships
- `DELETE /api/admin/sponsorships/:id` - Delete sponsorship (Super Admin only)
- `GET /api/admin/exhibitions` - Get all exhibitions
- `DELETE /api/admin/exhibitions/:id` - Delete exhibition (Super Admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📧 Support

For support, email support@apcb.org or create an issue in the repository.

## 🔗 Links

- [Docker Hub](https://hub.docker.com/r/yourusername/apcb-platform)
- [Documentation](https://docs.apcb.org)
- [Website](https://apcb.org)

---

**Version**: 2.0.0  
**Last Updated**: January 2025
