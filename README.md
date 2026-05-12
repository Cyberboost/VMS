# Vanage: Operational Trust Platform

A production-ready enterprise SaaS platform for managing regulated fleet and infrastructure assets with verifiable operational trust. Built for government, utility, municipal, and infrastructure organizations.

![Vanage](https://img.shields.io/badge/Vanage-2.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwind-css)

## 🎯 Product Vision

**Vanage makes regulated fleet and infrastructure operations verifiable, compliant, and predictive.**

Core positioning: **Trusted operational intelligence for regulated assets.**

## ✨ Key Features

### Phase 1: Core Operational Platform
- **Fleet Registry**: Complete asset management with detailed tracking
- **Asset Profiles**: Comprehensive vehicle and equipment information
- **Maintenance Records**: Service history and work order management
- **Work Orders**: Full lifecycle management from creation to completion
- **Inspections**: Digital inspection workflows with checklist support
- **Compliance Documents**: Centralized document management and tracking
- **Reporting Dashboard**: Real-time KPIs and operational analytics
- **Role-Based Access Control**: 9 user roles with granular permissions
- **Audit Timeline**: Complete audit trail of all system changes

### Phase 2: Trust Layer (MVP Foundation)
- **Immutable Event Ledger**: Cryptographic verification of critical operations
- **Asset Trust Score**: Composite metric based on:
  - Maintenance completeness
  - Inspection history
  - Compliance status
  - Open defects
  - Incident history
  - Verified ledger events
  - Parts provenance
  - Downtime risk
- **Verification System**: Event hashing and signature support
- **Blockchain-Ready Architecture**: Designed for future anchoring without disruption

## 🏗️ Architecture

### Operational Data Storage
- **PostgreSQL**: All operational data
- **Cloud Object Storage**: Files and attachments
- **Event Ledger Table**: Hashes and verification records

### Trust Layer Design
Critical events generate:
- Event hash (SHA-256)
- Timestamp
- User ID/signature
- Asset ID
- Event type
- Verification record

### Immutable Event Types
- Inspection completed
- Work order closed
- Part installed
- Brake replacement
- Oil change
- Vendor approval
- Compliance document uploaded
- Asset transferred
- Asset retired
- Certification renewed
- Safety check passed

## 📋 Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth (Auth.js)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Azure-ready

## 🔑 User Roles & Permissions

| Role                   | Permissions                                                      |
| ---------------------- | ---------------------------------------------------------------- |
| **Super Admin**        | Full system access across all organizations                      |
| **Organization Admin** | Full access within organization                                  |
| **Fleet Manager**      | Manage vehicles, drivers, work orders, maintenance               |
| **Maintenance Manager**| Work orders, parts, vendor management                            |
| **Mechanic/Technician**| Execute work orders, log maintenance activities                  |
| **Driver/Operator**    | View assigned assets, submit inspection requests                 |
| **Compliance Officer** | Manage compliance documents, review audit trails                 |
| **Auditor**            | Read-only access to all records and immutable ledger             |
| **Executive Viewer**   | Dashboard and high-level analytics                               |

## 🗄️ Core Data Models

- **Organization**: Multi-tenant support
- **User**: Authentication and role management
- **Role**: Permission-based access control
- **Asset/Vehicle**: Fleet and equipment registry
- **WorkOrder**: Maintenance work tracking
- **MaintenanceRecord**: Service history
- **Inspection**: Digital inspection workflows
- **InspectionChecklist**: Customizable inspection items
- **ComplianceDocument**: Document management
- **Vendor**: Approved vendor registry
- **Part**: Parts inventory
- **PartInstallation**: Parts provenance tracking
- **AuditEvent**: Complete audit trail
- **ImmutableLedgerEvent**: Cryptographically verified events
- **AssetTrustScore**: Composite trust metrics
- **Notification**: Alert system
- **Report**: Analytics and reporting

## 🚀 Getting Started

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
   DATABASE_URL="postgresql://user:password@localhost:5432/vanage_db"
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

| Email                   | Password    | Role                   |
| ----------------------- | ----------- | ---------------------- |
| admin@fleet.gov         | password123 | Super Admin            |
| orgadmin@fleet.gov      | password123 | Organization Admin     |
| fleetmanager@fleet.gov  | password123 | Fleet Manager          |
| compliance1@fleet.gov   | password123 | Compliance Officer     |
| readonly1@fleet.gov     | password123 | Auditor                |

## 📊 Key Dashboards

### 1. Executive Dashboard
- Total assets
- Active vehicles
- Average trust score
- Overdue maintenance
- Compliance risk
- Verified events count
- Downtime cost analysis

### 2. Fleet Manager Dashboard
- Open work orders
- Upcoming inspections
- Assets needing service
- Vendor activity
- Maintenance cost trends
- Asset trust scores

### 3. Compliance Dashboard
- Missing documents
- Expired certifications
- Inspection failures
- Audit trail export
- Immutable verification status
- Risk metrics

## 🎯 Asset Trust Score

The signature feature of Vanage is the **Asset Trust Score**, a composite metric (0-100) based on:

1. **Maintenance Completeness** (20%)
   - On-time service completion
   - Overdue maintenance count
   - Service interval adherence

2. **Inspection History** (20%)
   - Inspection pass rate
   - Critical defects resolved
   - Inspection frequency

3. **Compliance Status** (20%)
   - Current compliance standing
   - Expired documents
   - Regulatory violations

4. **Incident History** (15%)
   - Incident frequency
   - Severity distribution
   - At-fault incidents

5. **Verified Ledger Events** (15%)
   - Immutable event count
   - Verification status
   - Event completeness

6. **Parts Provenance** (5%)
   - OEM parts percentage
   - Parts traceability
   - Installation records

7. **Downtime Risk** (5%)
   - Projected availability
   - Historical uptime
   - Critical component status

## 🔒 Security Features

- Passwords hashed using bcryptjs
- NextAuth session management with JWT
- RBAC enforced at UI and API levels
- SQL injection protection via Prisma
- CSRF protection via NextAuth
- Environment variables for sensitive data
- Audit logging for all critical actions
- Immutable event ledger with cryptographic verification

## 🌐 Deployment

### Azure Deployment (Recommended)

1. **Deploy to Azure App Service**
   - Configure PostgreSQL database
   - Set environment variables
   - Enable automatic deployments from GitHub

2. **Database Setup**
   ```bash
   # Run migrations on production
   npx prisma migrate deploy

   # Seed initial data (optional)
   npx prisma db seed
   ```

### Alternative: Vercel Deployment

1. **Import to Vercel**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

2. **Add PostgreSQL**
   - Use Vercel Postgres or external provider
   - Update DATABASE_URL

## 📝 Sample Use Cases

### Municipal Fleet Management
- Track service vans, bucket trucks, emergency vehicles
- Verify DOT compliance and inspections
- Manage work orders for fleet maintenance
- Generate audit-ready compliance reports

### Electric Utility Operations
- Monitor bucket trucks and service vehicles
- Track generator and trailer assets
- Manage preventive maintenance schedules
- Verify safety inspections and certifications

### Government Infrastructure
- Asset lifecycle management
- Compliance tracking for regulated equipment
- Immutable audit trails for accountability
- Cost analysis and budget justification

## 🛠️ Development

```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

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

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database ORM from [Prisma](https://www.prisma.io/)

---

**Built for modern government and infrastructure operations** 🏛️ 🚗 ⚡
