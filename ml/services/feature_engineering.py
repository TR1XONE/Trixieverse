"""
Feature engineering pipeline
Extracts meaningful patterns from raw match data for ML models
"""

import pandas as pd
import numpy as np
import asyncpg
import logging
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureExtractor:
    """Extract statistical features from match data"""

    def __init__(self, db_pool: asyncpg.Pool):
        self.pool = db_pool

    async def compute_champion_tier_stats(
        self, champion_id: int, role: str, tier: str, min_samples: int = 10
    ) -> Dict:
        """
        Compute win rate, play rate, and other stats for a champion at a tier
        """
        query = """
            SELECT
                COUNT(*) as sample_size,
                SUM(CASE WHEN is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                AVG(kills) as avg_kills,
                AVG(deaths) as avg_deaths,
                AVG(assists) as avg_assists,
                AVG(cs) as avg_cs,
                AVG(vision_score) as avg_vision_score,
                AVG(damage_dealt_to_champions) as avg_damage,
                AVG(CASE WHEN game_duration_seconds > 0 THEN cs::float / (game_duration_seconds / 60.0) END) as avg_cs_per_min
            FROM matches
            WHERE champion_id = $1 AND role = $2
                AND player_id IN (
                    SELECT id FROM player_accounts WHERE tier = $3
                )
        """

        row = await self.pool.fetchrow(query, champion_id, role, tier)

        if not row or row["sample_size"] < min_samples:
            return None

        return {
            "champion_id": champion_id,
            "role": role,
            "tier": tier,
            "sample_size": row["sample_size"],
            "win_rate": round(row["win_rate"] or 0, 2),
            "avg_kda": round(
                (row["avg_kills"] + row["avg_assists"]) / max(row["avg_deaths"], 0.1),
                2,
            ),
            "avg_cs_per_min": round(row["avg_cs_per_min"] or 0, 2),
            "avg_vision_score": round(row["avg_vision_score"] or 0, 2),
            "avg_damage": int(row["avg_damage"] or 0),
        }

    async def compute_champion_matchups(
        self, champion_id: int, enemy_champion_id: int, role: str, tier: str
    ) -> Dict:
        """
        Compute win rate in specific 1v1 matchup
        """
        query = """
            SELECT
                COUNT(*) as sample_size,
                SUM(CASE WHEN m.is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                AVG(m.kills - m.deaths) as avg_kda_diff,
                AVG(m.damage_dealt_to_champions) as avg_damage
            FROM matches m
            WHERE m.champion_id = $1 AND role = $2
                AND m.player_id IN (
                    SELECT id FROM player_accounts WHERE tier = $3
                )
                AND EXISTS (
                    SELECT 1 FROM matches m2
                    WHERE m2.riot_match_id = m.riot_match_id
                        AND m2.champion_id = $4
                )
        """

        row = await self.pool.fetchrow(
            query, champion_id, role, tier, enemy_champion_id
        )

        if not row or row["sample_size"] < 5:
            return None

        # Difficulty score (1-10): how hard is this matchup?
        # 1 = very favorable, 10 = very unfavorable
        win_rate = row["win_rate"] or 50
        difficulty_score = max(1, min(10, int(11 - (win_rate / 10))))

        return {
            "champion_id": champion_id,
            "enemy_champion_id": enemy_champion_id,
            "role": role,
            "tier": tier,
            "sample_size": row["sample_size"],
            "win_rate": round(win_rate, 2),
            "difficulty_score": difficulty_score,
            "avg_kda_diff": round(row["avg_kda_diff"] or 0, 2),
        }

    async def compute_item_build_stats(
        self, champion_id: int, role: str, tier: str
    ) -> List[Dict]:
        """
        Find most successful item build paths for a champion
        """
        query = """
            SELECT
                STRING_AGG(DISTINCT item_id::text, ',' ORDER BY item_id::text) as item_build,
                COUNT(*) as sample_size,
                SUM(CASE WHEN is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                AVG(game_duration_seconds) as avg_duration
            FROM (
                SELECT * FROM matches
                WHERE champion_id = $1 AND role = $2
                    AND player_id IN (SELECT id FROM player_accounts WHERE tier = $3)
                ORDER BY created_at DESC
                LIMIT 1000
            )
            GROUP BY item_build
            HAVING COUNT(*) >= 5
            ORDER BY win_rate DESC
            LIMIT 10
        """

        rows = await self.pool.fetch(query, champion_id, role, tier)

        builds = []
        for row in rows:
            builds.append(
                {
                    "champion_id": champion_id,
                    "role": role,
                    "tier": tier,
                    "item_build": row["item_build"],
                    "sample_size": row["sample_size"],
                    "win_rate": round(row["win_rate"] or 0, 2),
                    "avg_duration_minutes": round((row["avg_duration"] or 0) / 60, 1),
                }
            )

        return builds

    async def compute_power_spike_timing(
        self, champion_id: int, role: str
    ) -> Dict:
        """
        Identify when champion becomes strong during game
        Based on: win rate spike at specific game times
        """
        query = """
            SELECT
                FLOOR(game_duration_seconds / 300.0) * 300 as time_bucket,
                SUM(CASE WHEN is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                COUNT(*) as sample_size
            FROM matches
            WHERE champion_id = $1 AND role = $2
                AND game_duration_seconds > 0
            GROUP BY time_bucket
            HAVING COUNT(*) >= 5
            ORDER BY time_bucket
        """

        rows = await self.pool.fetch(query, champion_id, role)

        if not rows:
            return None

        # Find power spike: where win rate jumps significantly
        spikes = {}
        for i, row in enumerate(rows):
            time_minutes = (row["time_bucket"] / 60) if row["time_bucket"] else 0

            if i == 0:
                continue

            win_rate = row["win_rate"] or 0
            prev_win_rate = rows[i - 1]["win_rate"] or 0

            # Significant spike = 10%+ increase
            if win_rate - prev_win_rate >= 10:
                if time_minutes < 10:
                    spikes["early"] = int(time_minutes)
                elif time_minutes < 20:
                    spikes["mid"] = int(time_minutes)
                else:
                    spikes["late"] = int(time_minutes)

        return spikes if spikes else None

    async def compute_tier_climb_probability(
        self, champion_id: int, role: str, current_tier: str, target_tier: str
    ) -> float:
        """
        Estimate probability of climbing from current tier to target tier
        with this champion
        """
        # Get win rate at current tier
        current_stats = await self.compute_champion_tier_stats(
            champion_id, role, current_tier
        )
        if not current_stats:
            return 0.0

        # Higher win rate = higher climb probability
        win_rate = current_stats.get("win_rate", 50)

        # Tier climb factors (empirical)
        climb_curve = {
            "IRON": 0.0,
            "BRONZE": 0.3,
            "SILVER": 0.5,
            "GOLD": 0.65,
            "PLATINUM": 0.75,
            "DIAMOND": 0.85,
            "EMERALD": 0.90,
            "GRANDMASTER": 1.0,
        }

        tier_multiplier = climb_curve.get(target_tier, 0.5)

        # Probability = (win_rate / 100) * tier_multiplier
        probability = min((win_rate / 100) * tier_multiplier * 1.5, 0.95)

        return round(probability, 3)


class PipelineOrchestrator:
    """Orchestrate feature extraction and storage"""

    def __init__(self, db_pool: asyncpg.Pool):
        self.pool = db_pool
        self.extractor = FeatureExtractor(db_pool)

    async def update_champion_tier_performance(self):
        """Update all champion performance stats"""
        logger.info("📊 Computing champion tier performance...")

        # Get all unique champion/role/tier combinations from matches
        query = """
            SELECT DISTINCT champion_id, role
            FROM matches
            WHERE champion_id IS NOT NULL
                AND role != 'UNKNOWN'
        """

        rows = await self.pool.fetch(query)
        tiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]

        updated = 0
        for row in rows:
            champion_id = row["champion_id"]
            role = row["role"]

            for tier in tiers:
                stats = await self.extractor.compute_champion_tier_stats(
                    champion_id, role, tier
                )

                if stats:
                    # Upsert into database
                    insert_query = """
                        INSERT INTO champion_tier_performance
                        (champion_id, champion_name, role, current_tier, win_rate, 
                         play_rate, sample_size, average_kda, average_cs_per_min, 
                         average_vision_score, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
                        ON CONFLICT (champion_id, role, current_tier, target_tier)
                        DO UPDATE SET
                            win_rate = EXCLUDED.win_rate,
                            sample_size = EXCLUDED.sample_size,
                            average_kda = EXCLUDED.average_kda,
                            average_cs_per_min = EXCLUDED.average_cs_per_min,
                            updated_at = CURRENT_TIMESTAMP
                    """

                    await self.pool.execute(
                        insert_query,
                        champion_id,
                        f"Champion_{champion_id}",  # TODO: Get actual champion name
                        role,
                        tier,
                        stats["win_rate"],
                        0,  # Play rate computed elsewhere
                        stats["sample_size"],
                        stats["avg_kda"],
                        stats["avg_cs_per_min"],
                        stats["avg_vision_score"],
                    )

                    updated += 1

        logger.info(f"✅ Updated {updated} champion tier performance records")

    async def update_champion_matchups(self):
        """Update champion matchup statistics"""
        logger.info("📊 Computing champion matchups...")

        # Get all unique champion pairs that have played against each other
        query = """
            SELECT DISTINCT m1.champion_id, m2.champion_id
            FROM matches m1
            JOIN matches m2 ON m1.riot_match_id = m2.riot_match_id
            WHERE m1.champion_id != m2.champion_id
                AND m1.champion_id IS NOT NULL
                AND m2.champion_id IS NOT NULL
            LIMIT 1000
        """

        rows = await self.pool.fetch(query)
        tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM"]

        updated = 0
        for row in rows:
            champ_a = row["champion_id"]
            champ_b = row[1]

            for role in ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]:
                for tier in tiers:
                    matchup_stats = await self.extractor.compute_champion_matchups(
                        champ_a, champ_b, role, tier
                    )

                    if matchup_stats:
                        # Insert into database
                        insert_query = """
                            INSERT INTO champion_matchups
                            (champion_id, champion_name, enemy_champion_id, enemy_champion_name,
                             role, tier, win_rate, difficulty_score, sample_size, updated_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                            ON CONFLICT (champion_id, enemy_champion_id, role, tier)
                            DO UPDATE SET
                                win_rate = EXCLUDED.win_rate,
                                difficulty_score = EXCLUDED.difficulty_score,
                                updated_at = CURRENT_TIMESTAMP
                        """

                        await self.pool.execute(
                            insert_query,
                            champ_a,
                            f"Champion_{champ_a}",
                            champ_b,
                            f"Champion_{champ_b}",
                            role,
                            tier,
                            matchup_stats["win_rate"],
                            matchup_stats["difficulty_score"],
                            matchup_stats["sample_size"],
                        )

                        updated += 1

        logger.info(f"✅ Updated {updated} matchup records")

    async def run_full_pipeline(self):
        """Run complete feature extraction pipeline"""
        logger.info("🚀 Starting full feature extraction pipeline...")

        try:
            await self.update_champion_tier_performance()
            await self.update_champion_matchups()

            logger.info("✅ Pipeline complete!")

        except Exception as e:
            logger.error(f"Pipeline error: {e}")


# Usage
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    db_url = os.getenv("DATABASE_URL")

    async def main():
        pool = await asyncpg.create_pool(db_url, min_size=5, max_size=20)

        try:
            orchestrator = PipelineOrchestrator(pool)
            await orchestrator.run_full_pipeline()

        finally:
            await pool.close()

    import asyncio

    asyncio.run(main())
