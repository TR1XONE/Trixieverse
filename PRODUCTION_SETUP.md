# TrixieVerse - Production Setup Guide

## 🚀 Complete Production Deployment Guide

This guide covers everything needed to deploy TrixieVerse to production.

---

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (recommended)
- Git
- Riot API Key (optional, for real data)

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE USER trixieverse WITH PASSWORD 'your-secure-password';
CREATE DATABASE trixieverse OWNER trixieverse;
GRANT ALL PRIVILEGES ON DATABASE trixieverse TO trixieverse;
```

### Option 2: Docker PostgreSQL

```bash
docker run --name trixieverse-db \
  -e POSTGRES_USER=trixieverse \
  -e POSTGRES_PASSWORD=your-secure-password \
  -e POSTGRES_DB=trixieverse \
  -p 5432:5432 \
  -d postgres:15
```

### Initialize Database Schema

```bash
# Connect to database
psql -U trixieverse -d trixieverse -h localhost

# Run schema
\i server/database/schema.sql
```

---

## 🔐 Environment Setup

Create `.env` file in project root:

```env
# Database
DB_USER=trixieverse
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trixieverse
DB_SSL=false

# JWT
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
REFRESH_SECRET=your-very-long-random-refresh-secret-key-min-32-chars

# Riot API (optional)
RIOT_API_KEY=your-riot-api-key

# Server
NODE_ENV=production
PORT=3000
VITE_API_URL=https://api.trixieverse.com

# Frontend
VITE_APP_NAME=TrixieVerse
VITE_APP_VERSION=1.0.0
```

---

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Build frontend
pnpm build

# Build backend (if needed)
pnpm build:server
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: trixieverse
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: trixieverse
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trixieverse"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    environment:
      DB_USER: trixieverse
      DB_PASSWORD: ${DB_PASSWORD}
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: trixieverse
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_SECRET: ${REFRESH_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## ☁️ Cloud Deployment Options

### Option 1: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Option 3: Vercel + Supabase

```bash
# Deploy frontend to Vercel
vercel deploy

# Use Supabase for PostgreSQL
# 1. Create Supabase project
# 2. Get connection string
# 3. Set DB_HOST to Supabase host
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 chars)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Regular security updates

---

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start "pnpm start" --name trixieverse

# Monitor
pm2 monit

# View logs
pm2 logs trixieverse
```

### Database Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('trixieverse'));

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

---

## 🔄 Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/trixieverse"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U trixieverse -h localhost trixieverse > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

### Restore from Backup

```bash
# Decompress
gunzip backup.sql.gz

# Restore
psql -U trixieverse -d trixieverse < backup.sql
```

---

## 🚀 Performance Optimization

### Database Optimization

```sql
-- Analyze tables
ANALYZE;

-- Vacuum
VACUUM ANALYZE;

-- Create indexes on frequently queried columns
CREATE INDEX idx_matches_user_timestamp ON matches(user_id, match_timestamp DESC);
CREATE INDEX idx_coach_memories_importance ON coach_memories(importance_score DESC);
```

### Application Optimization

- Enable gzip compression
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries
- Implement pagination

---

## 📝 Maintenance

### Regular Tasks

- Daily: Check logs and alerts
- Weekly: Review database performance
- Monthly: Update dependencies
- Quarterly: Security audit
- Annually: Full infrastructure review

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update packages
pnpm update

# Update major versions
pnpm update -i
```

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -U trixieverse -h localhost -d trixieverse -c "SELECT 1"

# Check PostgreSQL service
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql.log
```

### Application Won't Start

```bash
# Check Node version
node --version

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check environment variables
env | grep DB_

# Run in debug mode
DEBUG=* pnpm start
```

### High Memory Usage

```bash
# Check process memory
ps aux | grep node

# Monitor in real-time
top

# Restart application
pm2 restart trixieverse
```

---

## 📞 Support & Resources

- Documentation: https://trixieverse.com/docs
- GitHub Issues: https://github.com/trixieverse/trixieverse/issues
- Discord Community: https://discord.gg/trixieverse
- Email Support: support@trixieverse.com

---

## 🎉 Deployment Checklist

- [ ] Database set up and initialized
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] API keys secured
- [ ] Load balancer configured (if needed)
- [ ] CDN configured (if needed)
- [ ] Health checks configured
- [ ] Logging configured
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on deployment

---

**Ready to launch TrixieVerse to the world! 🚀**
