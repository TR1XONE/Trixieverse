-- TrixieVerse Production Database Schema
-- PostgreSQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Player Accounts (Wild Rift)
CREATE TABLE IF NOT EXISTS player_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_name VARCHAR(100) NOT NULL,
  tag VARCHAR(10) NOT NULL,
  riot_puuid VARCHAR(255),
  riot_summoner_id VARCHAR(255),
  current_rank VARCHAR(50),
  current_rp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  win_rate FLOAT DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_name, tag)
);

-- Coach Personality Settings
CREATE TABLE IF NOT EXISTS coach_personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  personality_type VARCHAR(50) NOT NULL, -- 'sage', 'blaze', 'echo', 'nova'
  accent VARCHAR(50) NOT NULL, -- 'neutral', 'swedish', 'british', 'casual'
  response_style VARCHAR(50) NOT NULL, -- 'supportive', 'competitive', 'analytical', 'funny'
  message_length VARCHAR(50) DEFAULT 'medium', -- 'short', 'medium', 'long'
  celebration_level INTEGER DEFAULT 5, -- 1-10
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Coach Memory System
CREATE TABLE IF NOT EXISTS coach_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_account_id UUID NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL, -- 'epic_play', 'clutch_moment', 'mistake', 'learning', 'funny'
  champion_name VARCHAR(100),
  enemy_champion VARCHAR(100),
  description TEXT,
  kda VARCHAR(20), -- e.g., "12/2/8"
  importance_score FLOAT DEFAULT 50, -- 0-100
  coach_reaction TEXT,
  match_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coach Relationship Tracking
CREATE TABLE IF NOT EXISTS coach_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_stage VARCHAR(50) DEFAULT 'stranger', -- 'stranger', 'acquaintance', 'friend', 'best_friend', 'legend'
  relationship_score FLOAT DEFAULT 0, -- 0-100
  total_interactions INTEGER DEFAULT 0,
  trust_level FLOAT DEFAULT 0, -- 0-100
  personal_jokes INTEGER DEFAULT 0,
  inside_jokes TEXT[], -- Array of inside jokes
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_account_id UUID NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  riot_match_id VARCHAR(255),
  champion_name VARCHAR(100),
  role VARCHAR(50), -- 'baron', 'jungle', 'mid', 'adc', 'support'
  result VARCHAR(10) NOT NULL, -- 'win', 'loss'
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  kda VARCHAR(20),
  gold_earned INTEGER DEFAULT 0,
  damage_dealt BIGINT DEFAULT 0,
  damage_taken BIGINT DEFAULT 0,
  cs INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  match_timestamp TIMESTAMP NOT NULL,
  analyzed BOOLEAN DEFAULT false,
  analysis_data JSONB,
  flow_state_score FLOAT DEFAULT 0, -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Profile (5D Radar)
CREATE TABLE IF NOT EXISTS skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_account_id UUID NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  mechanics_score FLOAT DEFAULT 50, -- 0-100
  macro_play_score FLOAT DEFAULT 50,
  decision_making_score FLOAT DEFAULT 50,
  consistency_score FLOAT DEFAULT 50,
  clutch_factor_score FLOAT DEFAULT 50,
  overall_rating FLOAT DEFAULT 50,
  trend VARCHAR(20) DEFAULT 'stable', -- 'improving', 'stable', 'declining'
  matches_analyzed INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, player_account_id)
);

-- Champion Statistics
CREATE TABLE IF NOT EXISTS champion_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_account_id UUID NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  champion_name VARCHAR(100) NOT NULL,
  tier VARCHAR(10), -- 'S+', 'S', 'A', 'B', 'C'
  mastery_level INTEGER DEFAULT 0,
  win_rate FLOAT DEFAULT 0,
  pick_rate FLOAT DEFAULT 0,
  match_count INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  average_kda FLOAT DEFAULT 0,
  last_played TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, player_account_id, champion_name)
);

-- Goals & Progression
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'rank', 'champion', 'skill', 'streak'
  title VARCHAR(255),
  description TEXT,
  target_value VARCHAR(100),
  current_value VARCHAR(100),
  progress_percentage FLOAT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements & Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'skill', 'milestone', 'community', 'seasonal'
  title VARCHAR(255),
  description TEXT,
  rarity VARCHAR(20), -- 'common', 'rare', 'epic', 'legendary'
  icon_url VARCHAR(500),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (for tracking active sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Rate Limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255),
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  window_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_player_accounts_user_id ON player_accounts(user_id);
CREATE INDEX idx_player_accounts_riot_puuid ON player_accounts(riot_puuid);
CREATE INDEX idx_coach_memories_user_id ON coach_memories(user_id);
CREATE INDEX idx_coach_memories_player_account_id ON coach_memories(player_account_id);
CREATE INDEX idx_coach_memories_memory_type ON coach_memories(memory_type);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_player_account_id ON matches(player_account_id);
CREATE INDEX idx_matches_match_timestamp ON matches(match_timestamp);
CREATE INDEX idx_skill_profiles_user_id ON skill_profiles(user_id);
CREATE INDEX idx_champion_stats_user_id ON champion_stats(user_id);
CREATE INDEX idx_champion_stats_champion_name ON champion_stats(champion_name);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX idx_rate_limits_endpoint ON rate_limits(endpoint);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_personalities_updated_at BEFORE UPDATE ON coach_personalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_relationships_updated_at BEFORE UPDATE ON coach_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_profiles_updated_at BEFORE UPDATE ON skill_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_champion_stats_updated_at BEFORE UPDATE ON champion_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
