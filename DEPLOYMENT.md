# Deployment Guide for Fleet Admin Console

This guide provides detailed instructions for deploying the Fleet Admin Console to production.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Code pushed to GitHub
3. **PostgreSQL Database** - Either:
   - Vercel Postgres (recommended)
   - External PostgreSQL instance (e.g., AWS RDS, Supabase, Neon)

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will automatically detect Next.js configuration

### Step 2: Set Up Database

#### Using Vercel Postgres:

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database** → **Postgres**
3. Follow the prompts to create your database
4. Environment variables will be automatically added

#### Using External PostgreSQL:

Manually add the environment variable:
```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
```

### Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

```bash
DATABASE_URL=your-postgres-connection-string
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 4: Run Database Migrations

After deployment, run migrations using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Step 5: Deploy

```bash
vercel --prod
```

Or simply push to your GitHub repository - Vercel will automatically deploy.

## Option 2: Deploy to Other Platforms

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

### AWS Amplify

1. Connect repository
2. Set build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
3. Add environment variables
4. Deploy

### Docker Deployment

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t fleet-admin .
docker run -p 3000:3000 --env-file .env fleet-admin
```

## Post-Deployment Steps

### 1. Database Setup

If you haven't already, run migrations and seed data:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-connection-string"

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

### 2. Test the Application

1. Navigate to your deployed URL
2. Try logging in with demo credentials:
   - `admin@fleet.gov` / `password123`
   - `manager@fleet.gov` / `password123`
   - `viewer@fleet.gov` / `password123`
3. Test all major features:
   - Dashboard loads properly
   - Vehicle list displays
   - Can view vehicle details
   - Other modules accessible

### 3. Create Production Users

**Important**: Change default passwords immediately!

```bash
# Access your production database
npx prisma studio

# Or use a SQL client
```

Update user passwords or create new users with secure passwords.

### 4. Configure Custom Domain (Optional)

In Vercel:
1. Go to project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to match your domain

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | Yes | `your-secret-key` |
| `NEXTAUTH_URL` | Production URL | Yes | `https://fleet.example.com` |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) | No | `sk-...` |

## Troubleshooting

### Build Failures

**Issue**: Build fails with Prisma errors
```bash
# Solution: Ensure DATABASE_URL is set during build
# Vercel: Check Storage tab for database connection
# Add to build command: npx prisma generate
```

**Issue**: TypeScript errors
```bash
# Solution: Run type check locally
npm run build
# Fix any type errors before deploying
```

### Runtime Errors

**Issue**: Cannot connect to database
```bash
# Check DATABASE_URL is correct
# Ensure database allows connections from Vercel IPs
# For external databases, whitelist 0.0.0.0/0 or Vercel's IP ranges
```

**Issue**: Authentication not working
```bash
# Verify NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches your domain
# Clear browser cookies and try again
```

### Performance Issues

**Issue**: Slow page loads
```bash
# Enable database connection pooling
# Use Prisma Accelerate for query caching
# Implement proper indexing on database
```

## Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:
1. Go to project settings → Analytics
2. Enable Web Analytics
3. Monitor page performance and errors

### Database Backups

**Vercel Postgres**:
- Automatic backups included
- Access via Vercel dashboard

**External Database**:
- Set up automated backups
- Test restore procedures regularly

### Updating the Application

1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel automatically deploys
5. Monitor deployment logs

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set secure NEXTAUTH_SECRET
- [ ] Configure CORS if needed
- [ ] Enable rate limiting (Vercel Pro feature)
- [ ] Regular dependency updates
- [ ] Database connection over SSL
- [ ] Implement proper logging
- [ ] Set up error monitoring (e.g., Sentry)

## Cost Estimates

### Vercel
- **Hobby**: Free (limited to personal projects)
- **Pro**: $20/month (includes Postgres)
- **Enterprise**: Custom pricing

### Database Options
- **Vercel Postgres**: Included with Pro plan
- **Supabase**: Free tier available, $25/month for Pro
- **Neon**: Free tier available, $19/month for Launch
- **AWS RDS**: Variable, ~$15-50/month for small instances

## Support

For issues and questions:
- Check GitHub Issues
- Review deployment logs in Vercel
- Consult Next.js documentation
- Review Prisma documentation

---

**Need Help?** Open an issue on the GitHub repository or contact your system administrator.
