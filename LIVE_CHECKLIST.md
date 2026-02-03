# 🚀 LIVE EXECUTION CHECKLIST - DO THIS NOW

## PHASE 1: Get API Keys (5 minutes)

### ACTION 1: Get Sentry DSN
```
🔗 OPEN: https://sentry.io
1. Click "Sign Up" (free tier is fine)
2. After signup, create new project → Select "Node.js"
3. You'll see a page with your DSN
4. COPY this: https://xxxx@xxxx.ingest.sentry.io/xxxxx
5. Come back and paste below
```

**Once you have it, paste here:**
```
SENTRY_DSN = _________________________________
```

### ACTION 2: Get Riot API Key
```
🔗 OPEN: https://developer.riotgames.com
1. Create/Login to Riot Games account
2. Go to "API Management" dashboard
3. Create a new API key
4. COPY this: RGAPI-xxxxxxxxxxxxxxxxxxxx
5. Come back and paste below
```

**Once you have it, paste here:**
```
RIOT_API_KEY = _________________________________
```

---

## PHASE 2: Update .env (2 minutes)

**You already have `.env` created. Just update these 2 lines:**

### ACTION 3: Edit .env
```bash
# Open: .env file in root directory
# Find line: SENTRY_DSN=
# Replace with your DSN from ACTION 1

# Find line: RIOT_API_KEY=
# Replace with your key from ACTION 2

# SAVE the file
```

**Test it:**
```bash
# Windows PowerShell
cat .env | Select-String "SENTRY_DSN|RIOT_API_KEY"

# Should show both filled in (not empty)
```

✅ **When both values are filled → Continue to PHASE 3**

---

## PHASE 3: Install & Migrate (3 minutes)

### ACTION 4: Install Sentry packages
```bash
cd server
npm install @sentry/node @sentry/tracing
cd ..
# Takes ~30 seconds
```

### ACTION 5: Run database migration
```bash
cd server
npm run migrate
# Should see: ✅ success message
cd ..
```

✅ **Both complete → Continue to PHASE 4**

---

## PHASE 4: Start & Verify (3 minutes)

### ACTION 6: Start the server
```bash
npm run dev
```

**You should see:**
```
✅ TrixieVerse Server running on port 3000
✅ WebSocket server ready
✅ API: http://localhost:3000/api
```

**⏱️ Leave this running, open a NEW terminal for next step**

### ACTION 7: Test health endpoint
```bash
# New terminal window/tab:
curl http://localhost:3000/api/health
```

**You should see:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": true, "responseTime": 5 },
    "memory": { "status": true, "usage": 45, "limit": 80 },
    "uptime": 120
  }
}
```

✅ **If you see `"status": "healthy" → SUCCESS!**

---

## 🎯 FINAL CHECKLIST

Before saying "Day 1 Complete", verify:

- [ ] Sentry DSN is in `.env` (not empty)
- [ ] Riot API key is in `.env` (not empty)
- [ ] `npm install` for Sentry completed
- [ ] `npm run migrate` completed successfully
- [ ] `npm run dev` server is running
- [ ] `curl http://localhost:3000/api/health` shows `"status": "healthy"`
- [ ] No errors in terminal output

---

## 🔴 IF SOMETHING FAILS

**Server won't start?**
```bash
# Check port 3000 is free:
lsof -i :3000
kill -9 <PID>  # Kill the process
npm run dev    # Try again
```

**Health check fails?**
```bash
# Check database is running:
psql -U postgres -c "SELECT 1"
# If fails, start PostgreSQL
```

**Migration fails?**
```bash
# Check database exists:
psql -U postgres -l | grep trixieverse
# If not found, database isn't set up
```

---

## 📞 WHAT TO TELL ME

**Once you complete each phase, tell me:**

✅ "**ACTION 1 & 2 DONE**: Got both API keys"  
✅ "**ACTION 3 DONE**: .env updated"  
✅ "**ACTION 4 & 5 DONE**: Dependencies installed, migration ran"  
✅ "**ACTION 6 & 7 DONE**: Server running, health check passing"  

Then we move to **DAY 2 IMMEDIATELY**.

---

## ⏰ TIME ESTIMATE

- API keys: **5 minutes**
- .env update: **2 minutes**
- Install & migrate: **3 minutes**
- Start & test: **3 minutes**

**Total: ~15 minutes to full Day 1 live**

---

## 🚀 START NOW

Go to **PHASE 1, ACTION 1** and get the Sentry DSN!

**Report back when ready. Don't move to next phase until previous is ✅**
