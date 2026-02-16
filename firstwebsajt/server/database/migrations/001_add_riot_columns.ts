/**
 * Database Migration: Add Riot API columns
 * Adds support for storing Riot match data
 */

export const up = async (client: any) => {
  await client.query(`
    -- Add Riot API columns to matches table
    ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS riot_match_id VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS riot_platform_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS champion_id INTEGER,
    ADD COLUMN IF NOT EXISTS team_id INTEGER,
    ADD COLUMN IF NOT EXISTS vision_score FLOAT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS damage_dealt_to_objectives INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS damage_dealt_to_buildings INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS first_blood_kill BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_blood_assist BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_tower_kill BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS first_tower_assist BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS largest_killing_spree INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wards_placed INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wards_killed INTEGER DEFAULT 0;

    -- Create indexes for Riot match lookups
    CREATE INDEX IF NOT EXISTS idx_matches_riot_match_id ON matches(riot_match_id);
    CREATE INDEX IF NOT EXISTS idx_matches_riot_platform_id ON matches(riot_platform_id);
    CREATE INDEX IF NOT EXISTS idx_matches_champion_id ON matches(champion_id);
  `);
};

export const down = async (client: any) => {
  await client.query(`
    -- Drop indexes
    DROP INDEX IF EXISTS idx_matches_riot_match_id;
    DROP INDEX IF EXISTS idx_matches_riot_platform_id;
    DROP INDEX IF EXISTS idx_matches_champion_id;

    -- Drop columns
    ALTER TABLE matches
    DROP COLUMN IF EXISTS riot_match_id,
    DROP COLUMN IF EXISTS riot_platform_id,
    DROP COLUMN IF EXISTS champion_id,
    DROP COLUMN IF EXISTS team_id,
    DROP COLUMN IF EXISTS vision_score,
    DROP COLUMN IF EXISTS damage_dealt_to_objectives,
    DROP COLUMN IF EXISTS damage_dealt_to_buildings,
    DROP COLUMN IF EXISTS first_blood_kill,
    DROP COLUMN IF EXISTS first_blood_assist,
    DROP COLUMN IF EXISTS first_tower_kill,
    DROP COLUMN IF EXISTS first_tower_assist,
    DROP COLUMN IF EXISTS largest_killing_spree,
    DROP COLUMN IF EXISTS wards_placed,
    DROP COLUMN IF EXISTS wards_killed;
  `);
};
