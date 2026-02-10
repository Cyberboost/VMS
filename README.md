# Fleet Admin Console

A modern, production-ready Fleet Management web application built with Next.js 14+, TypeScript, and PostgreSQL. This application provides a centralized dashboard for managing vehicles, drivers, incidents, surplus requests, and reporting.

![Fleet Admin Console](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

- **Dashboard**: Real-time KPIs, charts, and activity feed
- **Vehicle Management**: Complete CRUD operations with detailed tracking
- **Driver Management**: CDL tracking, status monitoring, and incident history
- **Incident Tracking**: Comprehensive incident reporting and analysis
- **Surplus Management**: Workflow-based vehicle surplus requests
- **Reports**: Fleet analytics and budget justification
- **Role-Based Access Control (RBAC)**: 5 user roles with granular permissions
- **AI-Ready**: Placeholder for AI copilot integration
- **Modern UI**: Clean GovTech-inspired design with shadcn/ui components

## 📋 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: NextAuth (Auth.js)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Icons**: Lucide React

## 🔑 User Roles & Permissions

| Role             | Permissions                                                         |
| ---------------- | ------------------------------------------------------------------- |
| **Admin**        | Full access to all features                                         |
| **FleetManager** | Manage vehicles, drivers, incidents, surplus, and reports           |
| **Supervisor**   | Approve surplus requests, view reports, edit limited vehicle fields |
| **Driver**       | View assigned vehicle, submit incident requests                     |
| **Viewer**       | Read-only access to all modules                                     |

## 🗄️ Data Models

- **Vehicle**: VIN, make, model, status, odometer, DOT dates, replacement tracking
- **Driver**: CDL information, contact details, status, incident history
- **Incident**: Date, description, severity, vehicle/driver linkage
- **SurplusRequest**: Vehicle condition, approval workflow, status tracking
- **AuditLog**: Complete audit trail of all changes
- **User**: Authentication and role management

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Cyberboost/VMS.git
   cd VMS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fleet_db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Generate a secure secret:

   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed demo data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Email             | Password    | Role         |
| ----------------- | ----------- | ------------ |
| admin@fleet.gov   | password123 | Admin        |
| manager@fleet.gov | password123 | FleetManager |
| viewer@fleet.gov  | password123 | Viewer       |

## 📦 Project Structure

```
├── app/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── page.tsx           # Dashboard home
│   │   ├── vehicles/          # Vehicle management
│   │   ├── drivers/           # Driver management
│   │   ├── incidents/         # Incident tracking
│   │   ├── surplus/           # Surplus requests
│   │   └── reports/           # Reports & analytics
│   ├── api/auth/              # NextAuth API routes
│   ├── auth/signin/           # Sign-in page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── layout/                # Layout components
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── ui/                    # Reusable UI components
│   └── copilot-panel.tsx      # AI copilot placeholder
├── lib/
│   ├── actions/               # Server actions
│   │   ├── vehicle-actions.ts
│   │   ├── driver-actions.ts
│   │   ├── incident-actions.ts
│   │   └── surplus-actions.ts
│   ├── auth.ts                # NextAuth configuration
│   ├── db.ts                  # Prisma client
│   ├── rbac.ts                # Role-based access control
│   ├── validators.ts          # Zod schemas
│   └── utils.ts               # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── middleware.ts              # Route protection
└── package.json
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   Add these in Vercel dashboard:

   ```
   DATABASE_URL=your-postgres-connection-string
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Set up Vercel Postgres** (Optional)
   - Add Vercel Postgres from the Storage tab
   - Connection string will be automatically added

5. **Deploy**

   ```bash
   vercel deploy
   ```

6. **Run migrations on production**
   ```bash
   # Using Vercel CLI
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 📊 Database Management

### Common Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes without migration
npm run db:push

# Seed database
npm run db:seed

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## 🤖 AI Copilot Integration

The application includes an AI copilot placeholder that can be integrated with OpenAI or other AI services.

### To Enable AI Features:

1. **Add OpenAI API key to `.env`**

   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

2. **Create AI service layer**

   ```typescript
   // lib/ai-service.ts
   import OpenAI from 'openai'

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   })

   export async function askFleetCopilot(question: string) {
     // Implementation
   }
   ```

3. **Update CopilotPanel to use real AI**
   Replace the mock response with actual API calls

## 🧪 Testing

```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

## 🔒 Security

- Passwords are hashed using bcryptjs
- NextAuth handles session management with JWT
- RBAC enforced at both UI and API levels
- SQL injection protection via Prisma
- CSRF protection via NextAuth
- Environment variables for sensitive data

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com)

---

**Built for modern government fleet management** 🚗 🏛️
