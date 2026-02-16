# TrixieVerse Deployment Guide

This guide provides comprehensive instructions for deploying TrixieVerse to various hosting platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Deployment Platforms](#deployment-platforms)
4. [Environment Configuration](#environment-configuration)
5. [Database Migration](#database-migration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Local Development

### Prerequisites

Ensure you have installed:
- Node.js v22.13.0 or higher
- pnpm v10.4.1 or higher
- MySQL/TiDB database server

### Setup

```bash
# Clone repository
git clone https://github.com/TR1XONE/Trixieverse.git
cd Trixieverse

# Install dependencies
pnpm install

# Configure environment (copy and edit)
cp .env.example .env.local

# Initialize database
pnpm run db:push

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:3000` with hot module replacement (HMR) enabled.

## Production Build

### Build Process

```bash
# Build frontend and backend
pnpm run build
```

This command performs two steps:

1. **Vite Build**: Compiles React frontend to `dist/public/`
2. **esbuild**: Bundles Express server to `dist/index.js`

### Build Output

```
dist/
├── index.js                    # Compiled server (21.6 KB)
├── public/                     # Frontend assets
│   ├── index.html             # HTML entry point
│   └── assets/                # JavaScript and CSS bundles
└── ...
```

### Verify Build

```bash
# Check for TypeScript errors
pnpm run check

# Start production server
NODE_ENV=production node dist/index.js
```

## Deployment Platforms

### Railway

Railway is the recommended platform for TrixieVerse due to its seamless GitHub integration and PostgreSQL support.

#### Steps

1. **Connect GitHub Repository**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `TR1XONE/Trixieverse`

2. **Add PostgreSQL Database**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Configure Environment Variables**
   - Go to your app service → "Variables"
   - Add the following:
     ```
     NODE_ENV=production
     JWT_SECRET=<secure-random-string>
     VITE_APP_ID=<your-app-id>
     OAUTH_SERVER_URL=https://api.manus.im
     VITE_OAUTH_PORTAL_URL=https://manus.im/login
     ```

4. **Deploy**
   - Railway automatically deploys when you push to `main`
   - Monitor deployment in the "Deployments" tab

#### Custom Domain

1. Go to "Settings" → "Domains"
2. Add your custom domain or use Railway's auto-generated domain
3. Configure DNS records as instructed

### Vercel

Vercel is optimized for frontend deployment but can host the full stack.

#### Steps

1. **Connect GitHub**
   - Go to https://vercel.com
   - Click "New Project" → "Import Git Repository"
   - Select `TR1XONE/Trixieverse`

2. **Configure Build Settings**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Set Environment Variables**
   - Add all variables from `.env.local` in Project Settings

4. **Deploy**
   - Vercel automatically deploys on push to `main`

### Render

Render offers simple deployment with automatic SSL.

#### Steps

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: trixieverse
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Production

3. **Add Database**
   - Create PostgreSQL database
   - Copy connection string to `DATABASE_URL`

4. **Set Environment Variables**
   - Add all required variables in "Environment"

### Docker Deployment

For containerized deployments, create a `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start server
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t trixieverse .
docker run -p 3000:3000 -e DATABASE_URL="..." trixieverse
```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL/PostgreSQL connection string | `mysql://user:pass@host:3306/db` |
| `NODE_ENV` | Environment (development/production) | `production` |
| `JWT_SECRET` | Session signing secret (min 32 chars) | `openssl rand -base64 32` |
| `VITE_APP_ID` | Manus OAuth application ID | `your-app-id` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `OAUTH_SERVER_URL` | OAuth server URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal | `https://manus.im/login` |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend API key | (optional) |
| `VITE_APP_TITLE` | Application title | `TrixieVerse` |
| `VITE_APP_LOGO` | Application logo URL | (optional) |

### Generate JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -InputObject (1..32) -Count 32 | ForEach-Object { [char]$_ } | Join-String)))
```

## Database Migration

### Initial Setup

On first deployment, initialize the database:

```bash
pnpm run db:push
```

This command:
1. Generates migration files from `drizzle/schema.ts`
2. Applies migrations to the database
3. Creates all required tables and indexes

### Schema Updates

When updating the database schema:

```bash
# Edit drizzle/schema.ts
# Then run:
pnpm run db:push
```

### Rollback

To rollback a migration (use with caution):

```bash
# Check migration history
pnpm run db:check

# Rollback specific migration
pnpm run db:drop
```

## Monitoring & Maintenance

### Health Checks

Monitor application health by checking:

```bash
# Check server is running
curl https://your-domain.com/

# Check API is responding
curl https://your-domain.com/api/trpc/auth.me
```

### Logs

View application logs:

**Railway**: Go to "Logs" tab in deployment
**Vercel**: Go to "Deployments" → "Logs"
**Render**: Go to "Logs" tab

### Performance Monitoring

Monitor key metrics:
- **Response Time**: Target < 200ms
- **Error Rate**: Target < 0.1%
- **Database Connections**: Monitor pool usage
- **Memory Usage**: Target < 512MB

### Backup Strategy

Implement regular database backups:

```bash
# MySQL backup
mysqldump -u user -p database > backup.sql

# PostgreSQL backup
pg_dump database_url > backup.sql
```

### Scaling Considerations

As traffic grows, consider:

1. **Database Optimization**
   - Add indexes for frequently queried columns
   - Implement query caching
   - Consider read replicas for high traffic

2. **Application Scaling**
   - Horizontal scaling with load balancer
   - Implement caching layer (Redis)
   - Optimize bundle size

3. **CDN Integration**
   - Serve static assets from CDN
   - Cache API responses
   - Reduce latency for global users

## Troubleshooting

### Application Won't Start

```bash
# Check for errors
NODE_ENV=production node dist/index.js

# Verify database connection
mysql -u user -p -h host -D database

# Check port availability
lsof -i :3000
```

### Database Connection Issues

```bash
# Test connection string
mysql -u user -p -h host -D database < /dev/null

# Verify environment variable
echo $DATABASE_URL
```

### Build Failures

```bash
# Clear cache
rm -rf node_modules dist/ pnpm-lock.yaml

# Reinstall and rebuild
pnpm install
pnpm run build
```

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=512 dist/index.js

# Profile application
node --prof dist/index.js
```

## Security Checklist

- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Enable HTTPS/SSL on production domain
- [ ] Configure CORS for allowed origins
- [ ] Set up rate limiting for API endpoints
- [ ] Enable database backups
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated (`pnpm update`)
- [ ] Use environment variables for all secrets
- [ ] Implement request validation (Zod schemas)
- [ ] Set up error logging and monitoring

## Support & Resources

- **GitHub Issues**: https://github.com/TR1XONE/Trixieverse/issues
- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs

---

**Last Updated**: February 2026  
**Maintained By**: Manus AI
