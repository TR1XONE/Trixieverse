# TrixieVerse Week 1 Detailed Task Breakdown
## The Critical Foundation Week

**Objective:** Establish production readiness + enable real data flow  
**Timeline:** 7 days (120 hours total work)  
**Team Capacity Assumed:** 1 full-time developer  
**Daily Standup Time:** 15 minutes (track blockers)

---

## 📋 TASK TRACKING

Use this format to track daily progress:
```
Daily Summary Template:
Date: [DATE]
Completed: [✅ TASK 1, ✅ TASK 2]
Blocked: [❌ BLOCKER IF ANY]
In Progress: [🔄 TASK 3]
Confidence: [% LIKELY TO FINISH ON TIME]
```

---

## DAY 1: SENTRY + BACKUPS + RIOT API FOUNDATION
**Effort: 12 hours | Complexity: Medium**

### Task 1.1: Sentry Backend Integration ⏱️ 3 hours
**Goal:** All backend errors are captured and sent to Sentry

**Step 1: Install Sentry (30 min)**
```bash
cd server
npm install @sentry/node @sentry/tracing
npm install --save-dev @sentry/cli
```

**Step 2: Create `server/utils/sentry.ts` (1 hour)**
```typescript
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export default Sentry;
```

**Step 3: Update `server/index.ts` (30 min)**

Add at the very top:
```typescript
import { initializeSentry } from './utils/sentry';
import * as Sentry from '@sentry/node';

// Initialize FIRST, before anything else
initializeSentry();

// Then existing code...
const app: Express = express();
const server = http.createServer(app);

// Add Sentry request handler FIRST
app.use(Sentry.Handlers.requestHandler());

// ... existing middleware ...

// Add Sentry error handler LAST
app.use(Sentry.Handlers.errorHandler());

// Custom error handler AFTER Sentry
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    errorId: Sentry.captureException(err),
  });
});
```

**Step 4: Test It (1 hour)**
```typescript
// Add test route to server/index.ts
app.get('/api/test-sentry', (req: Request, res: Response) => {
  throw new Error('This is a test error from Sentry');
});

// Test: curl http://localhost:3000/api/test-sentry
// Check: Sentry dashboard should show the error
```

**Acceptance Criteria:**
- [ ] Sentry account created (https://sentry.io - free tier)
- [ ] SENTRY_DSN added to .env
- [ ] Test error appears in Sentry dashboard
- [ ] All unhandled exceptions captured

---

### Task 1.2: Sentry Frontend Integration ⏱️ 1.5 hours
**Goal:** React app errors are captured

**Step 1: Install Sentry React (20 min)**
```bash
cd src
npm install @sentry/react
```

**Step 2: Update `src/main.tsx` (30 min)**
```typescript
import * as Sentry from "@sentry/react";
import App from './App';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const SentryApp = Sentry.withProfiler(App);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryApp />
  </React.StrictMode>,
);
```

**Step 3: Add to `.env` (20 min)**
```
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Acceptance Criteria:**
- [ ] React errors appear in Sentry
- [ ] Session replays capture user actions
- [ ] No console errors about missing DSN

---

### Task 1.3: Sentry Mobile Integration ⏱️ 1.5 hours
**Goal:** Mobile app crashes are captured

**Step 1: Install Sentry React Native (20 min)**
```bash
cd mobile
npm install @sentry/react-native
npx expo install expo-splash-screen
```

**Step 2: Update `mobile/App.tsx` (30 min)**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation: Sentry.useNavigationContainerRef(),
    }),
  ],
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});

const SentryApp = Sentry.withProfiler(App);

export default SentryApp;
```

**Step 3: Add to `.env` (20 min)**
```
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Acceptance Criteria:**
- [ ] Mobile crashes appear in Sentry
- [ ] DSN configured in .env
- [ ] No build errors after adding Sentry

---

### Task 1.4: Database Backup Automation ⏱️ 4 hours
**Goal:** Daily automated backups with restore capability

**If Using Railway (EASIEST - 30 min):**

1. Go to Railway dashboard
2. Select your project → Postgres plugin
3. Click "Backups" tab
4. Enable automatic daily backups
5. Test: Click "Create backup" manually
6. Test restore: From backup, click "Restore"

**If Self-Hosted PostgreSQL (4 hours):**

**Step 1: Create backup script `scripts/backup-db.sh` (1 hour)**
```bash
#!/bin/bash

# Database backup script for PostgreSQL
# Run daily via cron

# Configuration
BACKUP_DIR="/backups/postgres"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-trixieverse}"
BACKUP_RETENTION_DAYS=30
S3_BUCKET="s3://trixieverse-backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup filename with timestamp
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/trixieverse_${BACKUP_DATE}.sql.gz"

# Create backup
echo "Starting backup of $DB_NAME..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
  
  # Upload to S3 if configured
  if command -v aws &> /dev/null && [ ! -z "$S3_BUCKET" ]; then
    aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/"
    echo "Backup uploaded to S3"
  fi
  
  # Delete old backups (retention policy)
  find "$BACKUP_DIR" -name "trixieverse_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
  echo "Old backups deleted"
else
  echo "Backup failed!"
  exit 1
fi
```

**Step 2: Setup cron job (30 min)**
```bash
# Edit cron jobs
crontab -e

# Add this line to run backup daily at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

**Step 3: Create restore script `scripts/restore-db.sh` (1 hour)**
```bash
#!/bin/bash

# Database restore script

BACKUP_FILE="$1"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-trixieverse}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore-db.sh <backup-file>"
  echo "Example: restore-db.sh /backups/postgres/trixieverse_20260127_020000.sql.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from $BACKUP_FILE..."

# Drop existing database
echo "Dropping existing database..."
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 && \
PGPASSWORD="$DB_PASSWORD" dropdb \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  "$DB_NAME"

# Create new database
echo "Creating new database..."
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  "$DB_NAME"

# Restore from backup
echo "Restoring data from backup..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password

if [ $? -eq 0 ]; then
  echo "Restore completed successfully!"
else
  echo "Restore failed!"
  exit 1
fi
```

**Step 4: Test backup/restore (1.5 hours)**
```bash
# Manual backup
./scripts/backup-db.sh

# List backups
ls -lh /backups/postgres/

# Test restore (on test database first!)
# 1. Create test database: createdb trixieverse_test
# 2. Restore to test: ./scripts/restore-db.sh /backups/postgres/latest-backup.sql.gz
# 3. Verify: psql -d trixieverse_test -c "SELECT COUNT(*) FROM users;"
# 4. Drop test: dropdb trixieverse_test
```

**Acceptance Criteria:**
- [ ] Backup created today (manual run successful)
- [ ] Backup file is gzipped and under 100MB
- [ ] Cron job will run automatically tomorrow
- [ ] Restore script tested on copy of database
- [ ] Restore takes < 5 minutes
- [ ] After restore, database integrity verified

---

### Task 1.5: Riot API Service Foundation ⏱️ 2.5 hours
**Goal:** Create Riot API wrapper (don't call it yet, just structure)

**Step 1: Create `server/services/riotApiService.ts` (1.5 hours)**
```typescript
/**
 * Riot API Service
 * Handles all communication with Riot's Wild Rift API
 */

import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';

interface RiotSummonerData {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  level: number;
}

interface RiotMatchData {
  metadata: {
    data_version: string;
    match_id: string;
    participants: string[];
  };
  info: {
    game_duration: number;
    game_end_timestamp: number;
    game_mode: string;
    game_name: string;
    game_start_timestamp: number;
    game_type: string;
    game_version: string;
    map_id: number;
    participants: RiotParticipant[];
    platform_id: string;
    queue_id: number;
    tournament_code?: string;
    teams: RiotTeamData[];
  };
}

interface RiotParticipant {
  puuid: string;
  championId: number;
  championName: string;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageTaken: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  killingSprees: number;
  kills: number;
  assists: number;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  neutralMinionsKilled: number;
  nexusKills: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  participantId: number;
  pentaKills: number;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  quadraKills: number;
  riotIdGameTag: string;
  riotIdName: string;
  role: string;
  summonerLevel: number;
  teamEarlySurrendered: boolean;
  teamId: number;
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShielded: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

interface RiotTeamData {
  bans: Array<{ championId: number; pickTurn: number }>;
  objectives: {
    baron: { first: boolean; kills: number };
    champion: { first: boolean; kills: number };
    dragon: { first: boolean; kills: number };
    inhibitor: { first: boolean; kills: number };
    riftHerald: { first: boolean; kills: number };
    tower: { first: boolean; kills: number };
  };
  teamId: number;
  win: boolean;
}

class RiotAPIService {
  private apiKey: string;
  private baseUrl = 'https://wr.api.riotgames.com';
  private client: AxiosInstance;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitMs = 100; // 100ms between requests to respect rate limits

  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('RIOT_API_KEY not configured. Riot API calls will fail.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Riot-Token': this.apiKey,
      },
      timeout: 10000,
    });
  }

  /**
   * Rate limiter - respect Riot's rate limits
   */
  private async respectRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Get summoner by game name and tag
   * GET /api/account/v1/accounts/by-game-name/{gameName}/{tagLine}
   */
  async getSummonerByGameName(
    gameName: string,
    tagLine: string
  ): Promise<{ puuid: string; gameName: string; tagLine: string }> {
    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/account/v1/accounts/by-game-name/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
      );

      return response.data;
    } catch (error: any) {
      logger.error({
        message: 'Failed to get summoner by game name',
        gameName,
        tagLine,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get match IDs by PUUID
   * GET /api/match-history/v1/matches/by-puuid/{puuid}/start/{start}/count/{count}
   */
  async getMatchIdsByPuuid(
    puuid: string,
    start = 0,
    count = 20
  ): Promise<string[]> {
    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/match-history/v1/matches/by-puuid/${puuid}/start/${start}/count/${count}`
      );

      return response.data;
    } catch (error: any) {
      logger.error({
        message: 'Failed to get match IDs',
        puuid,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get match details by match ID
   * GET /api/match-history/v1/matches/{matchId}
   */
  async getMatchById(matchId: string): Promise<RiotMatchData> {
    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/match-history/v1/matches/${matchId}`
      );

      return response.data;
    } catch (error: any) {
      logger.error({
        message: 'Failed to get match details',
        matchId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get summoner rank by PUUID
   * GET /api/ranked/v1/ranked-stats/by-puuid/{puuid}
   */
  async getRankedStatsByPuuid(puuid: string): Promise<any> {
    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/ranked/v1/ranked-stats/by-puuid/${puuid}`
      );

      return response.data;
    } catch (error: any) {
      logger.error({
        message: 'Failed to get ranked stats',
        puuid,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Health check - verify API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple request to verify connectivity
      await this.client.get('/');
      return true;
    } catch (error) {
      logger.error('Riot API health check failed');
      return false;
    }
  }
}

export default new RiotAPIService();
```

**Step 2: Add to .env (20 min)**
```
RIOT_API_KEY=RGAPI-your-key-here
```

**Step 3: Create test endpoint (1 hour)**

Add to `server/index.ts`:
```typescript
app.get('/api/health/riot', async (req: Request, res: Response) => {
  try {
    const isHealthy = await riotApiService.healthCheck();
    res.json({
      status: isHealthy ? 'ok' : 'unavailable',
      service: 'Riot API',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'Riot API',
      error: (error as Error).message,
    });
  }
});
```

**Acceptance Criteria:**
- [ ] Riot API service file created
- [ ] All methods documented
- [ ] RIOT_API_KEY in .env (get from https://developer.riotgames.com)
- [ ] Health check endpoint responds
- [ ] No TypeScript errors

---

## DAY 1 CHECKLIST

- [ ] **Sentry Backend** - Errors captured to dashboard
- [ ] **Sentry Frontend** - React errors visible
- [ ] **Sentry Mobile** - App crashes tracked
- [ ] **Database Backups** - Automated daily backups running
- [ ] **Riot API Service** - Service created with all methods

**Expected Outcome:**
- Error visibility: All future errors captured
- Data safety: Daily backups automated
- Foundation: Ready for data integration tomorrow

**Blocker Check:**
- [ ] Any Sentry DSN issues?
- [ ] Any database backup failures?
- [ ] Any Riot API key problems?

---

## DAY 2: MATCH DATA PIPELINE
**Effort: 14 hours | Complexity: High**

### Task 2.1: Database Schema Updates ⏱️ 2 hours
**Goal:** Add columns for Riot data

**Step 1: Create migration file `server/database/migrations/002_riot_data.ts` (1.5 hours)**

```typescript
import { Database } from '../connection';

export async function migrateUp(db: any) {
  await db.query(`
    -- Add Riot API columns to matches table
    ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS riot_match_id VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS riot_platform_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS champion_id INTEGER,
    ADD COLUMN IF NOT EXISTS team_id INTEGER,
    ADD COLUMN IF NOT EXISTS vision_score FLOAT,
    ADD COLUMN IF NOT EXISTS damage_dealt_to_objectives INTEGER,
    ADD COLUMN IF NOT EXISTS damage_dealt_to_buildings INTEGER,
    ADD COLUMN IF NOT EXISTS first_blood_kill BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_blood_assist BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_tower_kill BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_tower_assist BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS largest_killing_spree INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wards_placed INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wards_killed INTEGER DEFAULT 0;

    -- Add Riot data to player_accounts
    ALTER TABLE player_accounts
    ADD COLUMN IF NOT EXISTS riot_summoner_id VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS riot_platform_id VARCHAR(50);

    -- Create index for Riot match lookups
    CREATE INDEX IF NOT EXISTS idx_matches_riot_match_id ON matches(riot_match_id);
    CREATE INDEX IF NOT EXISTS idx_player_accounts_riot_puuid ON player_accounts(riot_puuid);
    CREATE INDEX IF NOT EXISTS idx_player_accounts_riot_summoner_id ON player_accounts(riot_summoner_id);
  `);
}

export async function migrateDown(db: any) {
  await db.query(`
    ALTER TABLE matches DROP COLUMN IF EXISTS riot_match_id;
    ALTER TABLE matches DROP COLUMN IF EXISTS riot_platform_id;
    ALTER TABLE matches DROP COLUMN IF EXISTS champion_id;
    ALTER TABLE matches DROP COLUMN IF EXISTS team_id;
    ALTER TABLE matches DROP COLUMN IF EXISTS vision_score;
    ALTER TABLE matches DROP COLUMN IF EXISTS damage_dealt_to_objectives;
    ALTER TABLE matches DROP COLUMN IF EXISTS damage_dealt_to_buildings;
    ALTER TABLE matches DROP COLUMN IF EXISTS first_blood_kill;
    ALTER TABLE matches DROP COLUMN IF EXISTS first_blood_assist;
    ALTER TABLE matches DROP COLUMN IF EXISTS first_tower_kill;
    ALTER TABLE matches DROP COLUMN IF EXISTS first_tower_assist;
    ALTER TABLE matches DROP COLUMN IF EXISTS largest_killing_spree;
    ALTER TABLE matches DROP COLUMN IF EXISTS wards_placed;
    ALTER TABLE matches DROP COLUMN IF EXISTS wards_killed;

    ALTER TABLE player_accounts DROP COLUMN IF EXISTS riot_summoner_id;
    ALTER TABLE player_accounts DROP COLUMN IF EXISTS riot_platform_id;

    DROP INDEX IF EXISTS idx_matches_riot_match_id;
    DROP INDEX IF EXISTS idx_player_accounts_riot_puuid;
    DROP INDEX IF EXISTS idx_player_accounts_riot_summoner_id;
  `);
}
```

**Step 2: Run migration (30 min)**
```bash
cd server
npm run migrate # Or add script: ts-node database/migrations.ts
```

**Acceptance Criteria:**
- [ ] Migration runs without errors
- [ ] Columns added to matches table
- [ ] Columns added to player_accounts table
- [ ] Indexes created for performance

---

### Task 2.2: Match Processing Service ⏱️ 4 hours
**Goal:** Convert Riot API data to app format

**Step 1: Create `server/services/matchProcessingService.ts` (3 hours)**

```typescript
/**
 * Match Processing Service
 * Converts Riot API match data to TrixieVerse format
 */

import { Database } from '../database/connection';
import riotApiService from './riotApiService';
import logger from '../utils/logger';

interface ProcessedMatch {
  riot_match_id: string;
  champion_id: number;
  champion_name: string;
  role: string;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  gold_earned: number;
  cs: number;
  duration_seconds: number;
  vision_score: number;
  damage_dealt_to_objectives: number;
  damage_dealt_to_buildings: number;
  first_blood_kill: boolean;
  first_blood_assist: boolean;
  first_tower_kill: boolean;
  first_tower_assist: boolean;
  largest_killing_spree: number;
  wards_placed: number;
  wards_killed: number;
  kda: string;
  match_timestamp: Date;
}

class MatchProcessingService {
  /**
   * Process Riot match data into app format
   */
  static processRiotMatch(riotMatch: any, userPuuid: string): ProcessedMatch | null {
    try {
      // Find the user's participant data
      const userParticipant = riotMatch.info.participants.find(
        (p: any) => p.puuid === userPuuid
      );

      if (!userParticipant) {
        logger.warn('User not found in match participants', { userPuuid });
        return null;
      }

      const kda = `${userParticipant.kills}/${userParticipant.deaths}/${userParticipant.assists}`;
      const totalMinions =
        userParticipant.totalMinionsKilled + userParticipant.neutralMinionsKilled;

      return {
        riot_match_id: riotMatch.metadata.match_id,
        champion_id: userParticipant.championId,
        champion_name: userParticipant.championName,
        role: userParticipant.teamPosition || 'UNKNOWN',
        result: userParticipant.win ? 'win' : 'loss',
        kills: userParticipant.kills,
        deaths: userParticipant.deaths,
        assists: userParticipant.assists,
        gold_earned: userParticipant.goldEarned,
        cs: totalMinions,
        duration_seconds: Math.round(riotMatch.info.game_duration),
        vision_score: userParticipant.visionScore,
        damage_dealt_to_objectives: userParticipant.damageDealtToObjectives,
        damage_dealt_to_buildings: userParticipant.damageDealtToBuildings,
        first_blood_kill: userParticipant.firstBloodKill,
        first_blood_assist: userParticipant.firstBloodAssist,
        first_tower_kill: userParticipant.firstTowerKill,
        first_tower_assist: userParticipant.firstTowerAssist,
        largest_killing_spree: userParticipant.largestKillingSpree,
        wards_placed: userParticipant.wardsPlaced,
        wards_killed: userParticipant.wardsKilled,
        kda,
        match_timestamp: new Date(riotMatch.info.game_end_timestamp),
      };
    } catch (error) {
      logger.error('Failed to process Riot match', { error, userPuuid });
      return null;
    }
  }

  /**
   * Fetch and store matches for a user
   */
  static async fetchAndStoreMatches(
    db: Database,
    userId: string,
    accountId: string,
    limit = 10
  ): Promise<number> {
    try {
      // Get player account details
      const result = await db.query(
        'SELECT riot_puuid FROM player_accounts WHERE id = $1 AND user_id = $2',
        [accountId, userId]
      );

      if (result.rows.length === 0) {
        logger.warn('Player account not found', { userId, accountId });
        return 0;
      }

      const puuid = result.rows[0].riot_puuid;

      // Get match IDs from Riot API
      const matchIds = await riotApiService.getMatchIdsByPuuid(puuid, 0, limit);

      if (!matchIds || matchIds.length === 0) {
        logger.info('No matches found for user', { userId, puuid });
        return 0;
      }

      let insertedCount = 0;

      // Process each match
      for (const matchId of matchIds) {
        try {
          // Check if match already stored
          const existingMatch = await db.query(
            'SELECT id FROM matches WHERE riot_match_id = $1 AND user_id = $2',
            [matchId, userId]
          );

          if (existingMatch.rows.length > 0) {
            logger.debug('Match already stored', { matchId });
            continue;
          }

          // Fetch match details from Riot
          const riotMatch = await riotApiService.getMatchById(matchId);

          // Process match data
          const processedMatch = this.processRiotMatch(riotMatch, puuid);

          if (!processedMatch) {
            logger.warn('Failed to process match', { matchId });
            continue;
          }

          // Store in database
          const insertResult = await db.query(
            `INSERT INTO matches (
              user_id, player_account_id, riot_match_id, champion_name,
              role, result, kills, deaths, assists, gold_earned, cs,
              duration_seconds, vision_score, damage_dealt_to_objectives,
              damage_dealt_to_buildings, first_blood_kill, first_blood_assist,
              first_tower_kill, first_tower_assist, largest_killing_spree,
              wards_placed, wards_killed, kda, match_timestamp
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
              $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
            ) RETURNING id`,
            [
              userId,
              accountId,
              processedMatch.riot_match_id,
              processedMatch.champion_name,
              processedMatch.role,
              processedMatch.result,
              processedMatch.kills,
              processedMatch.deaths,
              processedMatch.assists,
              processedMatch.gold_earned,
              processedMatch.cs,
              processedMatch.duration_seconds,
              processedMatch.vision_score,
              processedMatch.damage_dealt_to_objectives,
              processedMatch.damage_dealt_to_buildings,
              processedMatch.first_blood_kill,
              processedMatch.first_blood_assist,
              processedMatch.first_tower_kill,
              processedMatch.first_tower_assist,
              processedMatch.largest_killing_spree,
              processedMatch.wards_placed,
              processedMatch.wards_killed,
              processedMatch.kda,
              processedMatch.match_timestamp,
            ]
          );

          if (insertResult.rows.length > 0) {
            insertedCount++;
            logger.info('Match stored', { matchId, userId });
          }
        } catch (error) {
          logger.error('Failed to process individual match', { matchId, error });
          continue;
        }
      }

      logger.info('Match fetching completed', { userId, insertedCount, totalMatches: matchIds.length });
      return insertedCount;
    } catch (error) {
      logger.error('Failed to fetch and store matches', { userId, error });
      throw error;
    }
  }
}

export default MatchProcessingService;
```

**Step 2: Create API route `server/routes/matchSyncRoutes.ts` (1 hour)**

```typescript
import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { Database } from '../database/connection';
import matchProcessingService from '../services/matchProcessingService';
import logger from '../utils/logger';

const router = Router();
const db = new Database();

/**
 * POST /api/matches/sync
 * Fetch latest matches from Riot API for authenticated user
 */
router.post('/sync', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { accountId, limit = 10 } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    // Fetch and store matches
    const insertedCount = await matchProcessingService.fetchAndStoreMatches(
      db,
      userId,
      accountId,
      limit
    );

    res.json({
      success: true,
      message: `Synced ${insertedCount} new matches`,
      insertedCount,
    });
  } catch (error) {
    logger.error('Match sync failed', { error });
    res.status(500).json({
      error: 'Failed to sync matches',
      message: (error as Error).message,
    });
  }
});

export default router;
```

**Step 3: Register route in `server/index.ts` (30 min)**
```typescript
import matchSyncRoutes from './routes/matchSyncRoutes';

app.use('/api/matches', matchSyncRoutes);
```

**Acceptance Criteria:**
- [ ] Match processing service created
- [ ] POST /api/matches/sync endpoint works
- [ ] Test endpoint: Fetch 10 matches successfully
- [ ] Matches stored in database
- [ ] No errors in Sentry

---

### Task 2.3: Health Check Endpoints ⏱️ 3 hours
**Goal:** Monitor system health

**Step 1: Create `server/utils/health.ts` (2 hours)**

```typescript
/**
 * Health Check Service
 * Monitors system health including database, Redis, API connectivity
 */

import { Database } from '../database/connection';
import redis from 'redis';
import riotApiService from '../services/riotApiService';
import logger from './logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: {
    database: { status: boolean; responseTime: number; error?: string };
    redis: { status: boolean; responseTime: number; error?: string };
    riotApi: { status: boolean; responseTime: number; error?: string };
    memory: { status: boolean; usage: number; limit: number };
  };
}

export class HealthCheck {
  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<{ status: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    try {
      const db = new Database();
      await db.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      return { status: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  static async checkRedis(): Promise<{ status: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    try {
      const client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        socket: {timeout: 5000},
      });

      await client.connect();
      await client.ping();
      await client.disconnect();

      const responseTime = Date.now() - startTime;
      return { status: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check Riot API connectivity
   */
  static async checkRiotApi(): Promise<{ status: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    try {
      const isHealthy = await riotApiService.healthCheck();
      const responseTime = Date.now() - startTime;
      return {
        status: isHealthy,
        responseTime,
        error: isHealthy ? undefined : 'Riot API unreachable',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check memory usage
   */
  static checkMemory(): { status: boolean; usage: number; limit: number } {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const isHealthy = heapUsedPercent < 80; // Alert if >80% heap used

    return {
      status: isHealthy,
      usage: Math.round(heapUsedPercent),
      limit: 80,
    };
  }

  /**
   * Comprehensive health check
   */
  static async fullHealthCheck(): Promise<HealthStatus> {
    const [dbCheck, redisCheck, riotCheck, memoryCheck] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkRiotApi(),
      Promise.resolve(this.checkMemory()),
    ]);

    // Determine overall status
    const allChecksPassed = [
      dbCheck.status,
      redisCheck.status,
      riotCheck.status,
      memoryCheck.status,
    ].every((status) => status);

    const criticalChecksPassed = dbCheck.status && memoryCheck.status;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!criticalChecksPassed) {
      overallStatus = 'unhealthy';
    } else if (!allChecksPassed) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      checks: {
        database: dbCheck,
        redis: redisCheck,
        riotApi: riotCheck,
        memory: memoryCheck,
      },
    };
  }
}

export default HealthCheck;
```

**Step 2: Add health endpoints in `server/index.ts` (1 hour)**

```typescript
import HealthCheck from './utils/health';

// Basic health check
app.get('/api/health', async (req: Request, res: Response) => {
  const health = await HealthCheck.fullHealthCheck();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

// Quick health (just database)
app.get('/api/health/quick', async (req: Request, res: Response) => {
  const dbHealth = await HealthCheck.checkDatabase();
  const statusCode = dbHealth.status ? 200 : 503;
  res.status(statusCode).json({
    status: dbHealth.status ? 'ok' : 'down',
    responseTime: dbHealth.responseTime,
  });
});

// Detailed health
app.get('/api/health/detailed', async (req: Request, res: Response) => {
  const health = await HealthCheck.fullHealthCheck();
  res.json(health);
});
```

**Acceptance Criteria:**
- [ ] GET /api/health returns system status
- [ ] GET /api/health/quick returns <100ms
- [ ] GET /api/health/detailed shows all checks
- [ ] Database check works
- [ ] Memory check works
- [ ] Riot API check works

---

## DAY 2 CHECKLIST

- [ ] **Database Migration** - Schema updated with Riot data columns
- [ ] **Match Processing** - Service converts Riot data to app format
- [ ] **Sync Endpoint** - /api/matches/sync fetches real data
- [ ] **Health Checks** - /api/health monitors all systems
- [ ] **Testing** - Manual test: Sync 10 matches, verify in database

**Expected Outcome:**
- Real match data flowing into system
- System health visible
- Ready for personalization tomorrow

---

[CONTINUES FOR DAYS 3-7...]

Due to length, here's the summary of remaining days:

---

## WEEK 1 SUMMARY TIMELINE

| Day | Focus | Effort | Outcome |
|-----|-------|--------|---------|
| 1 | Sentry + Backups + Riot API | 12h | Error tracking, backups, API ready |
| 2 | Match pipeline + Health checks | 14h | Real data flowing, system health visible |
| 3 | Match analysis + Onboarding UI | 13h | Coaches personalized, onboarding wireframe |
| 4 | Onboarding + Async queue | 12h | Users guided through first experience |
| 5 | Daily challenges + Notifications | 12h | Reason to return daily |
| 6 | Streaks + Mobile fixes | 10h | Engagement hooks + mobile ready |
| 7 | Integration testing + Polish | 15h | Everything working together |
| | | **88 hours** | **Production ready foundation** |

---

## COMPLETION CRITERIA FOR WEEK 1

**By end of Friday:**
- ✅ All errors captured in Sentry
- ✅ Daily backups automated
- ✅ Real match data from Riot API
- ✅ Health monitoring in place
- ✅ Onboarding flow complete
- ✅ Daily challenge system working
- ✅ Push notifications configured
- ✅ Streaks system active
- ✅ Mobile app synced with API
- ✅ No critical bugs

**By end of Sunday:**
- ✅ Full integration testing
- ✅ Load tested at 1k concurrent
- ✅ All systems stable
- ✅ Documentation complete
- ✅ **Ready for Week 2: Engagement & Testing**

---

**Next: Continue with Days 3-7 implementation...**
