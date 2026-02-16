import { Client } from 'pg';

export async function up(client: Client): Promise<void> {
  // Champion performance by tier (aggregated statistics)
  await client.query(`
    CREATE TABLE IF NOT EXISTS champion_tier_performance (
      id SERIAL PRIMARY KEY,
      champion_id INT NOT NULL,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      current_tier VARCHAR(20) NOT NULL,
      target_tier VARCHAR(20),
      win_rate DECIMAL(5, 2),
      play_rate DECIMAL(5, 2),
      ban_rate DECIMAL(5, 2),
      estimated_climb_hours FLOAT,
      sample_size INT DEFAULT 0,
      average_kda DECIMAL(3, 2),
      average_cs_per_min DECIMAL(3, 2),
      average_vision_score DECIMAL(4, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_id, role, current_tier, target_tier)
    );
  `);

  // Index for fast lookups
  await client.query(`
    CREATE INDEX idx_champion_tier_lookup ON champion_tier_performance(
      champion_id, role, current_tier, target_tier
    ) WHERE sample_size > 10;
  `);

  // Player blueprints (personalized climbing roadmaps)
  await client.query(`
    CREATE TABLE IF NOT EXISTS player_blueprints (
      id SERIAL PRIMARY KEY,
      player_id UUID NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
      current_tier VARCHAR(20) NOT NULL,
      target_tier VARCHAR(20) NOT NULL,
      main_role VARCHAR(20),
      recommended_champions JSONB NOT NULL DEFAULT '[]',
      -- Structure: [{ champion_id: int, champion_name: str, confidence: float, win_rate: float }]
      recommended_builds JSONB DEFAULT '[]',
      -- Structure: [{ champion_id: int, item_sequence: [...], win_rate: float }]
      power_spike_windows JSONB DEFAULT '{}',
      -- Structure: { champion_id: { early: 7, mid: 15, late: 25 } }
      estimated_climb_hours FLOAT,
      climb_probability DECIMAL(5, 2),
      progress_pct DECIMAL(5, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
      last_synced_at TIMESTAMP,
      status VARCHAR(20) DEFAULT 'active',
      FOREIGN KEY (player_id) REFERENCES player_accounts(id) ON DELETE CASCADE
    );
  `);

  // Index for player blueprints
  await client.query(`
    CREATE INDEX idx_player_blueprints_active ON player_blueprints(player_id, status)
    WHERE status = 'active' AND expires_at > CURRENT_TIMESTAMP;
  `);

  // Champion matchups (1v1 lane interactions)
  await client.query(`
    CREATE TABLE IF NOT EXISTS champion_matchups (
      id SERIAL PRIMARY KEY,
      champion_id INT NOT NULL,
      champion_name VARCHAR(100) NOT NULL,
      enemy_champion_id INT NOT NULL,
      enemy_champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      tier VARCHAR(20) NOT NULL,
      win_rate DECIMAL(5, 2),
      difficulty_score INT CHECK (difficulty_score >= 1 AND difficulty_score <= 10),
      sample_size INT DEFAULT 0,
      average_gold_diff_at_15 INT,
      average_cs_diff_at_15 INT,
      power_spike_times JSONB DEFAULT '{}',
      -- Structure: { early: timestamp, mid: timestamp, late: timestamp }
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_id, enemy_champion_id, role, tier)
    );
  `);

  // Index for matchup lookups
  await client.query(`
    CREATE INDEX idx_champion_matchups ON champion_matchups(
      champion_id, enemy_champion_id, role, tier
    );
  `);

  // Optimal item builds by champion & matchup
  await client.query(`
    CREATE TABLE IF NOT EXISTS optimal_item_builds (
      id SERIAL PRIMARY KEY,
      champion_id INT NOT NULL,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      enemy_team_composition JSONB NOT NULL,
      -- Structure: [{ champion_id: int, role: str }, ...]
      tier VARCHAR(20) NOT NULL,
      item_sequence JSONB NOT NULL,
      -- Structure: [item_id, item_id, item_id, ...]
      win_rate DECIMAL(5, 2),
      sample_size INT DEFAULT 0,
      average_game_duration_seconds INT,
      average_final_cs INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_id, role, tier, enemy_team_composition)
    );
  `);

  // Index for build lookups
  await client.query(`
    CREATE INDEX idx_optimal_builds_lookup ON optimal_item_builds(
      champion_id, role, tier
    ) WHERE sample_size > 5;
  `);

  // Champion learning curve (how long to master)
  await client.query(`
    CREATE TABLE IF NOT EXISTS champion_learning_curve (
      id SERIAL PRIMARY KEY,
      champion_id INT NOT NULL,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      difficulty_level INT CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
      games_to_proficiency INT,
      -- Estimated games needed to reach 50% win rate
      games_to_mastery INT,
      -- Estimated games needed to reach 55%+ win rate
      tier VARCHAR(20) NOT NULL,
      average_win_rate_by_game JSONB DEFAULT '{}',
      -- Structure: { game_1: 40, game_2: 42, game_5: 48, game_10: 50, game_20: 52 }
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_id, role, tier)
    );
  `);

  // Power spike timings extracted from matches
  await client.query(`
    CREATE TABLE IF NOT EXISTS power_spike_timings (
      id SERIAL PRIMARY KEY,
      champion_id INT NOT NULL,
      champion_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL,
      item_sequence JSONB NOT NULL,
      -- Structure: [item_id, item_id, ...]
      spike_time_minutes INT,
      -- When champion becomes "clickable" (gets strong)
      spike_power_level INT CHECK (spike_power_level >= 1 AND spike_power_level <= 10),
      -- How strong they are at spike (subjective 1-10)
      sample_size INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(champion_id, role, item_sequence)
    );
  `);

  // ML model versions and metadata
  await client.query(`
    CREATE TABLE IF NOT EXISTS ml_model_versions (
      id SERIAL PRIMARY KEY,
      model_name VARCHAR(100) NOT NULL,
      -- E.g., 'champion_recommender', 'climb_time_predictor'
      version VARCHAR(50) NOT NULL,
      model_path VARCHAR(500) NOT NULL,
      accuracy DECIMAL(5, 3),
      -- Validation accuracy (0-1)
      training_samples INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT FALSE,
      deployed_at TIMESTAMP,
      UNIQUE(model_name, version)
    );
  `);

  // Data quality metrics
  await client.query(`
    CREATE TABLE IF NOT EXISTS data_quality_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      metric_value DECIMAL(10, 2),
      sample_size INT,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      context JSONB DEFAULT '{}'
    );
  `);

  // Index for recent metrics
  await client.query(`
    CREATE INDEX idx_data_quality_recent ON data_quality_metrics(
      metric_name, recorded_at DESC
    );
  `);

  console.log('✅ Migration 002: Predictive ranking schema created successfully');
}

export async function down(client: Client): Promise<void> {
  await client.query('DROP TABLE IF EXISTS data_quality_metrics;');
  await client.query('DROP TABLE IF EXISTS ml_model_versions;');
  await client.query('DROP TABLE IF EXISTS power_spike_timings;');
  await client.query('DROP TABLE IF EXISTS champion_learning_curve;');
  await client.query('DROP TABLE IF EXISTS optimal_item_builds;');
  await client.query('DROP TABLE IF EXISTS champion_matchups;');
  await client.query('DROP TABLE IF EXISTS player_blueprints;');
  await client.query('DROP TABLE IF EXISTS champion_tier_performance;');

  console.log('✅ Migration 002: Rolled back successfully');
}
