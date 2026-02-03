# TrixieVerse: Predictive Rank Climbing Platform
## The Next Big Thing - Category Definition Strategy

**Date:** January 27, 2026  
**Status:** Strategic Vision Document  
**Objective:** Build the definitive data-driven esports coaching platform

---

## 1. Core Vision

**TrixieVerse is the Spotify of esports coaching, powered by predictive ML.**

Instead of generic advice ("play safer", "farm better"), TrixieVerse tells you:

> "To climb from Gold to Platinum in 40 hours, master these 3 champions: [List with stats]. Your item build patterns should be [specific recommendations]. Your power spike windows are at [times]. Your weaknesses to fix: [ranked by impact]. Probability of reaching Platinum with this path: 87%."

**The insight:** Most players don't know *what to practice*. They grind inefficiently. TrixieVerse solves this with a personalized **Climbing Blueprint** — a probabilistic roadmap from current rank to target rank, based on:

- Historical win rates of champions at their rank
- Item build success rates by matchup
- Power spike timing analysis
- Lane matchup exploitability
- Role-specific skill gaps (identified via match analysis)
- Time-to-climb predictions

---

## 2. Product Tiers (What We Sell)

### Tier 1: Climbing Blueprint (Free)
- Player inputs current rank + target rank + main role
- System generates one-time climbing roadmap
- "Master 3 champions, here's your path"
- Hooks players into platform

### Tier 2: Adaptive Coach Pro ($9.99/month)
- Real-time blueprint updates as you play
- Daily matchup recommendations
- Item build suggestions based on enemy team
- Ranked matchup difficulty scores
- Coach personality responds to your progress ("You're 2 hours ahead of projected schedule!")
- Achievement system (streaks, climbing milestones)

### Tier 3: Team Climbing ($29.99/month/member, 5 minimum)
- Analyze 5v5 team compositions
- Counter-strategy recommendations
- Team composition optimizer ("Your team is weak to teamfighting, avoid it")
- Scrim analysis + replay insights
- Real-time coach in discord
- Team rank climbing blueprint (predict group climb timeline)

### Tier 4: Creator Program (Revenue Share)
- Top coaches earn 50% of subscriptions from players who use their coach profile
- Coach marketplace (players choose coach personalities)
- Coaching content monetization

---

## 3. Technical Architecture (The Moat)

### Data Pipeline
```
Match Data (Riot API) 
    ↓
Data Warehouse (PostgreSQL + TimescaleDB for time-series)
    ↓
Feature Engineering (Champion pools, win rates, build patterns, power spikes)
    ↓
ML Models (Predictive rank climbing probability, optimal champion selection)
    ↓
Real-time Inference (Generate blueprints on demand)
    ↓
Coach Personalization (Generate responses + recommendations)
    ↓
Frontend (Climbing map visualization, blueprint progress tracking)
```

### Critical ML Models to Build

1. **Champion Win Rate Predictor**
   - Input: Current rank, target rank, champion, role
   - Output: Win rate probability for this path
   - Training: 10M+ historical matches

2. **Optimal Champion Pool Recommender**
   - Input: Player stats, current rank, target rank
   - Output: Top 3 champions with highest climb probability
   - Constraint: Minimize practice time

3. **Power Spike Identifier**
   - Input: Champion, role, item build
   - Output: Exact game time when champion becomes "clickable"
   - Use: Tactical decision-making

4. **Item Build Optimizer**
   - Input: Champion, enemy team composition, player role
   - Output: Recommended item build + win rate probability
   - Training: Real player builds + outcomes

5. **Matchup Difficulty Scorer**
   - Input: Your champion vs enemy champion
   - Output: Difficulty score (1-10) + win rate
   - Use: Lane warnings + play recommendations

6. **Climb Time Predictor**
   - Input: Blueprint + player historical performance
   - Output: Hours to reach target rank + confidence interval
   - Use: Motivation + progress tracking

### Data Requirements
- **Match data:** 50M+ Wild Rift matches (scrape/buy via Riot partnership)
- **Player progression:** 1M+ player rank journeys over time
- **Build success tracking:** Item build success rates by tier/role/matchup
- **Video analysis** (Phase 2): Replay footage → playstyle classification

---

## 4. Competitive Advantages

### Why This Wins

1. **Defensibility**
   - Moat = Data + ML models
   - Harder to copy than coaching content
   - Network effect: More players → Better data → Better predictions
   - First-mover advantage in predictive esports coaching

2. **Differentiation from Competitors**
   - Blitz.gg: Shows stats, doesn't predict optimal paths
   - Op.gg: Match history analysis, not forward-looking
   - Traditional coaching: Generic advice, not personalized data science
   - **TrixieVerse:** "Here's your exact blueprint to climb"

3. **Retention**
   - Players keep coming back to check if they're "on track"
   - Competitive motivation (probability of success)
   - Progress tracking against predictions
   - Coach personality creates emotional connection

4. **Virality**
   - "I climbed from Gold to Plat in 38 hours using TrixieVerse Blueprint"
   - Streamer integration: Show climbing blueprint on stream
   - Shareable progress (TikTok/Twitter moments)
   - Leaderboards by climb speed

---

## 5. Phased Execution Plan

### Phase 1: Data & Foundation (Weeks 1-4)
**Goal:** Build data pipeline + first ML models

**Deliverables:**
- [ ] Connect Riot API at scale (fetch 10K+ matches daily)
- [ ] PostgreSQL data warehouse with match history indexed for fast queries
- [ ] Feature engineering pipeline (champion win rates, build patterns, power spikes)
- [ ] First ML model: Champion Win Rate Predictor (scikit-learn)
- [ ] Internal blueprint generator (CLI tool for testing)
- [ ] Dashboard to monitor data quality

**Tech Stack:**
- Python + scikit-learn for ML (separate service)
- PostgreSQL + TimescaleDB for time-series data
- Kafka for real-time data pipeline (optional, start with batch)
- Node.js polling service to fetch matches

**Effort:** 2-3 engineers, 4 weeks

**Success Metrics:**
- ✅ 1M+ match records in database
- ✅ Champion win rate predictor accuracy >85%
- ✅ Blueprint generation <500ms

---

### Phase 2: MVP Platform (Weeks 5-8)
**Goal:** Get climbing blueprint to players

**Deliverables:**
- [ ] Blueprint input form (rank + target + role)
- [ ] Climbing roadmap visualization (interactive map)
- [ ] Coach personality integrated (responds to blueprint)
- [ ] Progress tracking (player records match outcomes)
- [ ] Real-time probability updates
- [ ] Basic analytics (which blueprints convert, win rates)

**Frontend Changes:**
- New page: `/climbing-blueprint`
- Input form → API call → Streaming response with roadmap
- Progress tracker showing alignment with predictions
- Visual: Champion portraits, win % bars, time estimates

**Backend:**
- POST `/api/blueprint/generate` → Returns climbing roadmap
- GET `/api/blueprint/{playerId}` → Fetch player's current blueprint
- POST `/api/blueprint/{playerId}/update` → Sync match data
- Webhook from Riot API → Update blueprints in real-time

**Effort:** 2 engineers, 4 weeks (1 frontend, 1 backend)

**Success Metrics:**
- ✅ 1,000 blueprints generated (MVP players)
- ✅ >70% of users reaching predicted milestones
- ✅ <2 second blueprint load time

---

### Phase 3: Tier 2 Monetization (Weeks 9-12)
**Goal:** Convert to paid subscriptions

**Deliverables:**
- [ ] Pro coach mode with daily recommendations
- [ ] Real-time matchup difficulty scores
- [ ] Item build optimizer (show 3 top builds for current game)
- [ ] Achievement system (climbing streaks, milestones)
- [ ] Coach personality expanded (more contextual responses)
- [ ] Payment processing (Stripe)
- [ ] Subscription management

**New Features:**
- Daily login → "Today's challenge: Play [champion] into [matchup]"
- In-game recommendations (if partnered with overlay)
- Streak system (consecutive wins with recommended champion)
- Probability confidence score ("87% chance to reach target")

**Effort:** 3 engineers, 4 weeks (1 ML/features, 1 frontend, 1 backend)

**Success Metrics:**
- ✅ $5K MRR (500 paying users at $10/month)
- ✅ >40% of trial users convert to paid
- ✅ >8 daily active recommendations per user

---

### Phase 4: Team Mode + Creator Program (Weeks 13-16)
**Goal:** Team climbing + revenue share model

**Deliverables:**
- [ ] Team creation + management
- [ ] 5v5 composition analyzer
- [ ] Team climbing blueprint (group rank target)
- [ ] Creator dashboard (track coach subscriptions)
- [ ] Coach marketplace
- [ ] Revenue split tracking

**Network Effect Trigger:**
- Top 100 Grandmaster players invited to be "coaches"
- Their fans pay to use their coach personality
- Platform takes 50%, coach takes 50%

**Effort:** 4 engineers, 4 weeks

**Success Metrics:**
- ✅ 50 teams signed up
- ✅ 10 creators generating revenue
- ✅ $2K revenue split to top creators (proof of model)

---

### Phase 5: Scale + Competitive Moat (Weeks 17-24)
**Goal:** Expand data pipeline, improve ML accuracy, prepare for cross-game expansion

**Deliverables:**
- [ ] Advanced ML models (deep learning for playstyle classification)
- [ ] Video analysis pipeline (from replays → tactical insights)
- [ ] Competitive leaderboards (fastest climbers, best blueprints)
- [ ] Analytics API (for streamers + content creators)
- [ ] Team tournament bracket builder + prediction engine
- [ ] Preparation for League PC expansion

**Effort:** 5-6 engineers, 8 weeks

**Success Metrics:**
- ✅ $50K MRR (5,000 paying users)
- ✅ 100+ creators in program (generating 30% of MRR)
- ✅ ML model accuracy >90%
- ✅ 100K monthly active users

---

## 6. Revenue Projections

### Year 1 (Conservative)

| Quarter | Users | Conversion | ARPU | MRR | Notes |
|---------|-------|-----------|------|-----|-------|
| Q1 | 50K | 2% | $5 | $5K | MVP phase, word of mouth |
| Q2 | 150K | 5% | $7.50 | $56K | Tier 2 launch, creator program |
| Q3 | 400K | 8% | $10 | $320K | Team mode live, streamer adoption |
| Q4 | 800K | 10% | $12 | $960K | Holiday spike, creator network |

**Year 1 Total Revenue:** ~$1.3M  
**Operating Costs:** ~$400K (servers, infrastructure, payments)  
**Year 1 Profit:** ~$900K (conservative)

### Year 2+
- Cross-game expansion (League PC) → 3x user base
- Creator program revenue share → 40% of MRR
- B2B partnerships (team orgs, academies) → $50K/team/year
- Coaching certification program → $200/coach

**Year 2 Revenue Projection:** $8-12M  
**Year 3:** $30-50M (if execution is flawless)

---

## 7. Market Opportunity

### TAM (Total Addressable Market)

- **Wild Rift players globally:** 50M monthly active
- **Willing to pay for coaching:** 10% = 5M
- **TAM in coaching/improvement tools:** $500M/year (conservative)

### Competitive Landscape

- **Blitz.gg:** Stats aggregation, ~2M users, acquired by Meta ($500M+)
- **Op.gg:** Match history analysis, Korea-focused
- **Traditional esports coaching:** Fragmented, $100-500/hour
- **TrixieVerse opportunity:** Predictive layer + marketplace = new category

### Why We Win

1. **Science > Content** - We're not another coaching content platform
2. **Personalization** - Each player gets their own optimal blueprint
3. **Defensible** - Data + ML moat prevents copy
4. **Network effect** - More players = better data = better predictions
5. **Monetization** - Multiple revenue streams (subscription + creator share)

---

## 8. Technical Requirements (Deep Dive)

### Data Infrastructure
```
Wild Rift API
    ↓
Python Data Ingestion Service (asyncio)
    ↓
PostgreSQL + TimescaleDB (match_history, player_stats, champion_performance)
    ↓
Redis Cache (for real-time blueprint generation)
    ↓
ML Service (Python/PyTorch)
    ↓
Backend API (Node.js/Express)
    ↓
Frontend (React 19)
```

### Database Schema Additions
```sql
-- Champion performance by tier
CREATE TABLE champion_tier_performance (
  champion_id INT,
  role VARCHAR(20),
  current_tier VARCHAR(20),
  target_tier VARCHAR(20),
  win_rate DECIMAL(5,2),
  play_rate DECIMAL(5,2),
  ban_rate DECIMAL(5,2),
  estimated_climb_hours FLOAT,
  sample_size INT,
  updated_at TIMESTAMP
);

-- Player blueprints
CREATE TABLE player_blueprints (
  player_id UUID,
  current_tier VARCHAR(20),
  target_tier VARCHAR(20),
  recommended_champions JSONB, -- [{ champion_id, confidence, climb_prob }]
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  progress_pct DECIMAL(5,2)
);

-- Champion matchups
CREATE TABLE champion_matchups (
  champion_id INT,
  enemy_champion_id INT,
  role VARCHAR(20),
  tier VARCHAR(20),
  win_rate DECIMAL(5,2),
  difficulty_score INT,
  power_spike_times JSONB -- { early: 7, mid: 15, late: 25 }
);

-- Item builds by matchup
CREATE TABLE optimal_item_builds (
  champion_id INT,
  role VARCHAR(20),
  enemy_team JSONB, -- [champ_ids]
  tier VARCHAR(20),
  item_sequence JSONB,
  win_rate DECIMAL(5,2),
  sample_size INT
);
```

### ML Models (Scikit-learn/PyTorch)

**Model 1: Champion Pool Recommender**
```python
# Input: player_rank, role, play_style (aggressive/passive)
# Output: [champion_1, champion_2, champion_3] with probabilities
# Training: 10M matches at similar rank
model = RandomForestClassifier(n_estimators=100)
# Features: champion win rate, learning curve, playstyle alignment
```

**Model 2: Climb Time Predictor**
```python
# Input: blueprint, player historical win rate
# Output: hours to climb, confidence interval
# Regression model trained on actual climb paths
model = GradientBoostingRegressor()
```

**Model 3: Power Spike Predictor**
```python
# Input: champion, item build
# Output: timestamp when champion becomes viable
# Training: extract from 1M replays
```

### Backend ML Integration
```typescript
// server/services/blueprintService.ts
async function generateBlueprint(userId: string, targetTier: string) {
  const playerStats = await getPlayerStats(userId);
  const blueprint = await mlService.predict({
    currentTier: playerStats.tier,
    targetTier,
    role: playerStats.role,
  });
  // Returns: { champions, itemBuilds, powerSpikes, estimatedHours, confidence }
}
```

---

## 9. Go-to-Market Strategy

### Launch Sequence

**Month 1: Closed Beta (500 players)**
- Grandmaster + high-level streamers
- Get testimonials: "Climbed to Platinum 2x faster"
- Refine ML models based on feedback
- Create case studies

**Month 2: Public MVP (10K players)**
- Free blueprint generator (no paywall)
- "Try before you commit" mindset
- Social sharing incentives
- Organic growth + word of mouth

**Month 3: Tier 2 Launch ($9.99/month)**
- Pro coach mode
- Daily recommendations
- Achievement system
- Conversion target: 5% of free users

**Month 4: Streamer Program**
- Pay top 50 streamers $500 to showcase TrixieVerse
- Live climbs using blueprints
- Affiliate links (creators earn commission)

**Month 5: Team Mode + Creator Program**
- Grandmaster coaches earn revenue share
- First 10 coaches launch with 1M+ followers combined
- Proof of creator monetization model

### Marketing Angles

1. **"Stop wasting ranked grinding time"** - Efficiency narrative
2. **"Your personalized climbing roadmap"** - Science narrative
3. **"Coaches earning real money"** - Creator economy narrative
4. **Streamer highlights** - Social proof via gameplay

---

## 10. Critical Success Factors

### Must-Haves

1. **ML Accuracy >85%** - If predictions are wrong, trust erodes immediately
2. **<500ms Blueprint Generation** - Real-time expectations
3. **Actual Climb Validation** - Players must hit predicted probabilities
4. **Creator Profitability** - First 10 coaches must earn $500+/month
5. **Retention** - Players check blueprint after each ranked game (>40% weekly active)

### Metrics to Track

- **Blueprint Accuracy** - % of players who hit predicted tier in predicted time
- **Conversion Rate** - Free → Paid (target >5%)
- **Churn Rate** - Monthly cancellations (target <3%)
- **Creator Revenue** - Top 100 creators earning >$1K/month
- **DAU/MAU** - Daily active users / Monthly active users
- **Climb Speed** - Hours to reach target tier (vs predicted)

---

## 11. 6-Month Execution Timeline

```
PHASE 1: Data & Foundation (Weeks 1-4)
├─ Week 1: Data pipeline + warehouse setup
├─ Week 2: Feature engineering (win rates, builds)
├─ Week 3: ML model training + validation
└─ Week 4: Internal testing + refinement

PHASE 2: MVP Platform (Weeks 5-8)
├─ Week 5-6: Frontend blueprint page + input form
├─ Week 7: Backend API endpoints
└─ Week 8: Integration + closed beta launch (500 users)

PHASE 3: Monetization (Weeks 9-12)
├─ Week 9-10: Tier 2 features (daily recommendations, achievements)
├─ Week 11: Payment processing + subscription system
└─ Week 12: Public launch + marketing blitz

PHASE 4: Growth (Weeks 13-16)
├─ Week 13-14: Team mode + creator dashboard
├─ Week 15: Creator program launch (50 creators)
└─ Week 16: Streamer partnerships + brand partnerships

PHASE 5: Scale (Weeks 17-24)
├─ Week 17-19: Advanced ML models
├─ Week 20-22: Video analysis + deeper insights
├─ Week 23-24: Cross-game preparation + investor deck
```

**Total Timeline to $1M ARR:** 6 months  
**Total Timeline to $50M ARR (with cross-game expansion):** 24 months

---

## 12. Required Team

### Core Team (Weeks 1-8)
- 1x ML Engineer (champion selection, climb prediction)
- 1x Backend Engineer (API, data pipeline)
- 1x Frontend Engineer (blueprint UI)
- 1x Data Engineer (Riot API integration, data warehouse)
- **Total: 4 people, 8 weeks**

### Extended Team (Weeks 9-24)
- +1 Senior ML Engineer (video analysis, advanced models)
- +1 Growth/Product Manager (streamer partnerships, creator program)
- +1 Design/UX (dashboard, visualizations)
- +1 Data Scientist (analytics, insights)
- **Total: 8 people, final phase**

### Costs
- **Phase 1-2 (8 weeks):** $150K salaries + $30K infrastructure = $180K
- **Phase 3-4 (8 weeks):** $280K salaries + $50K infrastructure = $330K
- **Phase 5 (8 weeks):** $450K salaries + $100K infrastructure = $550K
- **Total 6-month cost:** $1.06M

**Break-even:** Month 5-6 (at $50K+ MRR)

---

## 13. Why This Works

### The Thesis

Players don't need *more coaching content*. They need to know:
1. **What to practice** (champion pool)
2. **When they'll improve** (time estimate)
3. **If they're on track** (progress vs prediction)
4. **Why specific mechanics matter** (power spike, matchup)

TrixieVerse answers all 4 with data, not opinion.

### The Defensibility

- **Data moat:** Harder to gather 50M matches than write videos
- **ML moat:** Better predictions = more users = better data = harder to catch up
- **Network effect:** Creator marketplace pulls players in, then creators lock in
- **Switching cost:** Players invested in their blueprint + streak don't leave

### The Virality

- "Climbed from Gold to Platinum in 38 hours using AI blueprint" = TikTok moment
- Shareable progress → friends join platform → better recommendations
- Creator endorsements → organic reach
- Streamer integration → built-in audience

---

## 14. Next Steps

**Immediate (This Week):**
- [ ] Approve core vision + direction
- [ ] Assemble team (at minimum: 1 ML engineer + 1 backend)
- [ ] Start Riot API data ingestion
- [ ] Design database schema for champion performance

**Week 2-4:**
- [ ] Build data pipeline (10M matches ingested)
- [ ] Train first champion recommender model
- [ ] Internal blueprint generation working

**Week 5-8:**
- [ ] Launch MVP with 500 closed beta players
- [ ] Validate accuracy of predictions
- [ ] Refine ML models based on real climb data

**Decision Point (Week 9):**
- [ ] If accuracy >85% and retention >40%: Go for Tier 2 monetization
- [ ] If not: Iterate on model + features

---

## Final Word

TrixieVerse isn't just another coaching platform. It's **predictive esports science**—the Moneyball of gaming.

Players stop grinding blindly. Coaches become profitable creators. TrixieVerse becomes the *infrastructure layer* that the entire esports coaching ecosystem runs on.

**The prize:** Category-defining product that's defensible, viral, and buildable in 6 months.

