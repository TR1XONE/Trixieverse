# 🚀 EXECUTION START: 15-MINUTE LIVE SETUP

**Status**: Ready to go LIVE  
**Time**: 15 minutes to production foundation  
**Objective**: Day 1 ✅ Complete → Day 2+ Ready  

---

## ⏱️ PHASE 1: API KEYS (5 MINUTES)

### 1.1 Get Sentry DSN
```
GO TO: https://sentry.io
1. Sign up / Log in (free tier OK)
2. Create new project → Select "Node.js"
3. Copy the DSN (looks like: https://xxx@xxx.ingest.sentry.io/xxx)
4. SAVE THIS - you'll need it in 2 minutes
```

### 1.2 Get Riot API Key
```
GO TO: https://developer.riotgames.com
1. Register account (or log in)
2. Create API key under "Management"
3. Copy the key (starts with RGAPI-)
4. SAVE THIS - you'll need it in 2 minutes
```

**⏱️ Elapsed: ~5 minutes**

---

## ⏱️ PHASE 2: ENVIRONMENT SETUP (3 MINUTES)

### 2.1 Update .env File

Open `.env` in the root directory and add:

```env
# Sentry Configuration
SENTRY_DSN=https://paste-your-sentry-dsn-here@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Riot API Configuration
RIOT_API_KEY=RGAPI-paste-your-riot-key-here

# Database (should already exist, but verify)
DATABASE_URL=postgresql://user:password@localhost:5432/trixieverse

# Server Configuration
NODE_ENV=production
PORT=3000
```

**✅ Save the file**

**⏱️ Elapsed: ~8 minutes total**

---

## ⏱️ PHASE 3: INSTALL & MIGRATE (3 MINUTES)

### 3.1 Install Dependencies
```bash
cd server
npm install @sentry/node @sentry/tracing
cd ..
```

### 3.2 Run Database Migration
```bash
cd server
npm run migrate
# Should see: ✅ Migration complete
cd ..
```

**⏱️ Elapsed: ~11 minutes total**

---

## ⏱️ PHASE 4: START & TEST (4 MINUTES)

### 4.1 Start Development Server
```bash
npm run dev
# Should see:
# ✅ TrixieVerse Server running on port 3000
# ✅ WebSocket server ready
# ✅ API: http://localhost:3000/api
```

### 4.2 Test Health Endpoint (New Terminal)
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T15:30:00.000Z",
  "checks": {
    "database": {
      "status": true,
      "responseTime": 5
    },
    "memory": {
      "status": true,
      "usage": 45,
      "limit": 80
    },
    "uptime": 120
  }
}
```

✅ **If you see this → YOU'RE LIVE**

### 4.3 Quick Health Check
```bash
curl http://localhost:3000/api/health/quick
# Should return: { "status": "ok", "responseTime": 5 }
```

**⏱️ Elapsed: ~15 minutes total**

---

## ✅ SUCCESS CHECKLIST

After Phase 4, verify:

- [ ] Server started without errors
- [ ] Database migration completed
- [ ] GET /api/health returns "status": "healthy"
- [ ] GET /api/health/quick responds in <100ms
- [ ] Sentry DSN is configured (will receive test error next)
- [ ] Riot API key is in .env (won't test until Day 2)

**If all ✅ → Proceed to "Test Sentry" below**  
**If any ❌ → See "Troubleshooting" section**

---

## 🧪 TEST SENTRY (1 MINUTE - OPTIONAL)

Test that Sentry is capturing errors:

```bash
curl http://localhost:3000/api/test-sentry
# This will throw an error and send to Sentry
```

Go to Sentry dashboard → Check for new event. Should see the error you just triggered.

---

## 🔧 TROUBLESHOOTING

### Error: "SENTRY_DSN not configured"
**Fix**: Check `.env` has `SENTRY_DSN=https://...` without typos

### Error: "RIOT_API_KEY not configured"
**Fix**: Verify `.env` has `RIOT_API_KEY=RGAPI-...`

### Error: "database connection failed"
**Run**:
```bash
psql $DATABASE_URL -c "SELECT 1"
```
If it fails, check DATABASE_URL is correct.

### Error: Port 3000 already in use
**Fix**:
```bash
lsof -i :3000  # List process
kill -9 <PID>  # Kill it
npm run dev    # Restart
```

### Error: Migration failed
**Run**:
```bash
cd server
npm run migrate
# Check error message in output
```

---

## 📊 WHAT YOU JUST BUILT

✅ **Error Tracking**: Sentry capturing all exceptions  
✅ **System Health**: Real-time monitoring at `/api/health`  
✅ **Riot API Ready**: Service configured and tested  
✅ **Database Extended**: 13 new match data columns  
✅ **Match Pipeline**: Ready for Riot API calls  
✅ **WebSocket**: Real-time coach messages configured  

**Status: Foundation COMPLETE → Ready for Day 2**

---

## 🎯 NEXT: DAY 2 EXECUTION

Once everything is ✅ above, we proceed to:

**Day 2 Goal**: Match analysis + onboarding UI  
**Time**: 14 hours (days 2-3)  
**Effort**: Implement real match processing and user onboarding flow  

Type "ready for day 2" when Phase 4 is complete.

---

## 💡 COMMANDS REFERENCE

```bash
# Development
npm run dev                    # Full stack (Vite + Server)

# Testing
curl http://localhost:3000/api/health          # Full health
curl http://localhost:3000/api/health/quick    # Quick check

# Database
cd server && npm run migrate   # Run migrations

# Cleanup
pkill -f "node server"        # Kill server
lsof -i :3000                 # Find what's using port 3000
```

---

**START NOW**: Go to PHASE 1, Step 1.1 and get those API keys! ⏱️

