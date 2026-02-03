# Day 1 Implementation - Setup & Configuration Guide

## Quick Start Checklist

### 1. Environment Variables Setup
Add these to your `.env` file:

```env
# Sentry Configuration
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
SENTRY_ENVIRONMENT=production

# Riot API Configuration
RIOT_API_KEY=RGAPI-your-riot-api-key-here

# Database Configuration (existing)
DATABASE_URL=postgresql://user:password@localhost:5432/trixieverse

# Server Configuration
NODE_ENV=production
PORT=3000
```

### 2. Get Your API Keys

#### Sentry Setup (5 minutes)
1. Go to https://sentry.io
2. Create a free account or login
3. Create a new project → Select "Node.js"
4. Copy your DSN and add to `.env`
5. Verify: Check Sentry dashboard loads

#### Riot API Key (2 minutes)
1. Go to https://developer.riotgames.com
2. Register a Riot account (free)
3. Create an API key
4. Add `RIOT_API_KEY` to `.env`
5. Note: Rate limits = 20 requests / 1 second (production keys are higher)

### 3. Install Dependencies

```bash
cd server
npm install @sentry/node @sentry/tracing

cd ../src
npm install @sentry/react

cd ../mobile
npm install @sentry/react-native
npx expo install expo-splash-screen
```

### 4. Database Migration

```bash
# Run migration to add Riot columns
cd server
npm run migrate  # or: ts-node database/migrations.ts
```

**What gets added:**
- `riot_match_id` - Unique match identifier from Riot
- `champion_id` - Champion ID played
- `vision_score` - Ward placement score
- `damage_dealt_to_objectives` - Objective damage dealt
- `first_blood_*` - First blood achievement flags
- `wards_placed/killed` - Vision control metrics

### 5. Build and Test

```bash
# Build backend
npm run build

# Start server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
# Response should be:
# {
#   "status": "healthy",
#   "timestamp": "2026-01-27T10:30:00.000Z",
#   "checks": {
#     "database": { "status": true, "responseTime": 5 },
#     "memory": { "status": true, "usage": 45, "limit": 80 },
#     "uptime": 120
#   }
# }

# Test quick health
curl http://localhost:3000/api/health/quick
# Response should be:
# { "status": "ok", "responseTime": 5 }
```

## Testing Each Component

### Test Sentry Backend

```bash
# In server directory, run:
curl -X GET http://localhost:3000/api/test-sentry

# Check Sentry dashboard - error should appear
```

### Test Sentry Frontend

```bash
# In src directory, add temporary test endpoint:
# Then navigate to it in the browser
# Check browser console for error, verify in Sentry dashboard
```

### Test Riot API Service

```bash
# Test endpoint (add to server/index.ts temporarily):
app.get('/api/test-riot', async (req: Request, res: Response) => {
  try {
    const isHealthy = await riotApiService.healthCheck();
    res.json({ riotApiStatus: isHealthy });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

# Test it:
curl http://localhost:3000/api/test-riot
# Response: { "riotApiStatus": true } or { "error": "API Key invalid" }
```

### Test Match Sync

```bash
# Requires authenticated user with player account
curl -X POST http://localhost:3000/api/matches/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accountId": "account-uuid",
    "puuid": "riot-puuid-here",
    "limit": 10
  }'

# Response:
# {
#   "success": true,
#   "message": "Synced 10 new matches",
#   "insertedCount": 10,
#   "limit": 10
# }
```

## Troubleshooting

### "SENTRY_DSN not configured"
- Check `.env` has `SENTRY_DSN=https://...`
- Verify key is from https://sentry.io (not a typo)
- Restart server

### "RIOT_API_KEY not configured"
- Get key from https://developer.riotgames.com
- Add to `.env`: `RIOT_API_KEY=RGAPI-...`
- Check for typos - must start with `RGAPI-`
- Restart server

### Database migration fails
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run: `psql $DATABASE_URL -c "SELECT version();"` to test
- Check existing columns: `psql $DATABASE_URL -c "\d matches"`

### Health check returns 503
- Check database connectivity: `npm run db:test`
- Check heap memory usage: `node --max-old-space-size=4096 server.js`
- Restart server

## Expected After Day 1

✅ **Error Tracking:** All exceptions appear in Sentry dashboard  
✅ **Backups:** Daily automated backups configured  
✅ **API Integration:** Riot API service ready  
✅ **Health Monitoring:** System status visible at `/api/health`  
✅ **Match Foundation:** Database schema ready for match data  

## Next Steps (Day 2)

1. Test match syncing with real Riot API calls
2. Implement match analysis
3. Add onboarding UI
4. Set up daily challenges

## Files Created/Modified Today

```
Created:
✅ server/utils/sentry.ts - Sentry initialization
✅ server/services/riotApiService.ts - Riot API wrapper (enhanced)
✅ server/utils/health.ts - System health checks
✅ server/services/matchProcessingService.ts - Riot data processor
✅ server/routes/matchSyncRoutes.ts - Match sync endpoints
✅ server/database/migrations/001_add_riot_columns.ts - Schema migration
✅ WEEK1_DETAILED_BREAKDOWN.md - Complete task breakdown

Modified:
✅ server/index.ts - Added Sentry, health checks, match routes
✅ package.json - Dependencies (needs npm install)

Unchanged (but ready):
- Mobile app screens (already created)
- API service (already created)
- Frontend app (ready for Sentry integration)
```

## Success Metrics

By end of Day 1, you should have:

| Metric | Target | Status |
|--------|--------|--------|
| Sentry events received | > 1 test error | ⏳ Pending |
| Database backup | Daily schedule set | ⏳ Pending |
| Health checks | All passing | ✅ Code ready |
| Riot API service | Connectivity verified | ⏳ Pending |
| Match schema | Columns added | ✅ Migration ready |
| TypeScript errors | 0 | 🔄 Running build... |

---

## Getting Help

1. **Sentry Issues?** https://docs.sentry.io/platforms/node/
2. **Riot API Issues?** https://developer.riotgames.com/apis#wild-rift
3. **Database Issues?** Check PostgreSQL logs: `psql -U postgres -d postgres -c "SELECT pg_current_wal_lsn();"`

Next Step: Run `npm run build` to verify all TypeScript compiles correctly.
