"""
Blueprint generation service
Orchestrates ML models to generate personalized climbing roadmaps
"""

import asyncpg
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
from ml.models.champion_recommender import ChampionRecommenderModel, ClimbTimePredictorModel
from ml.services.feature_engineering import FeatureExtractor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BlueprintGenerationService:
    """
    Generate personalized climbing blueprints combining:
    - Optimal champion selection (with confidence scores)
    - Recommended item builds (by matchup)
    - Power spike timings
    - Estimated climb duration
    - Success probability
    """

    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        self.recommender = ChampionRecommenderModel()
        self.climb_predictor = ClimbTimePredictorModel()
        self.feature_extractor = FeatureExtractor(pool)

    async def generate_blueprint(
        self, player_id: str, target_tier: str, role: str = None
    ) -> Dict:
        """
        Main blueprint generation endpoint
        Input: player_id, target_tier, optional role preference
        Output: Personalized climbing roadmap
        """
        logger.info(f"🗺️  Generating blueprint for player {player_id} → {target_tier}")

        try:
            # Step 1: Get player current data
            player = await self._get_player_stats(player_id)
            if not player:
                return {"error": "Player not found"}

            current_tier = player["tier"]
            current_role = role or player.get("main_role", "MID")

            # Step 2: Validate tier progression
            tier_order = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]
            if (
                current_tier not in tier_order
                or target_tier not in tier_order
                or tier_order.index(current_tier) >= tier_order.index(target_tier)
            ):
                return {
                    "error": "Invalid tier progression",
                    "current": current_tier,
                    "target": target_tier,
                }

            # Step 3: Get champion candidates
            champions = await self._get_champion_candidates(
                current_tier, target_tier, current_role
            )

            if not champions:
                return {"error": "No champion data available for tier"}

            # Step 4: Get model predictions
            predictions = await self.recommender.predict(champions)

            # Step 5: Build recommendation packages (top 3 champions)
            recommended_champions = []
            for champ_id, confidence, climb_prob in predictions[:3]:
                champ_data = next(
                    (c for c in champions if c["champion_id"] == champ_id), None
                )
                if champ_data:
                    recommended_champions.append(
                        {
                            "champion_id": champ_id,
                            "champion_name": champ_data.get("champion_name", "Unknown"),
                            "confidence": confidence,
                            "climb_probability": climb_prob,
                            "win_rate": champ_data.get("win_rate", 0),
                            "sample_size": champ_data.get("sample_size", 0),
                            "difficulty_level": champ_data.get(
                                "difficulty_level", 5
                            ),  # 1-10
                        }
                    )

            # Step 6: Get item builds for each recommended champion
            recommended_builds = {}
            for champ in recommended_champions:
                builds = await self._get_optimal_builds(
                    champ["champion_id"], current_role, target_tier
                )
                recommended_builds[champ["champion_id"]] = builds

            # Step 7: Get power spike timings
            power_spikes = {}
            for champ in recommended_champions:
                spikes = await self._get_power_spikes(champ["champion_id"], current_role)
                if spikes:
                    power_spikes[champ["champion_id"]] = spikes

            # Step 8: Estimate climb duration
            avg_climb_prob = (
                sum(c["climb_probability"] for c in recommended_champions)
                / len(recommended_champions)
            ) if recommended_champions else 0.5

            estimated_hours = await self._estimate_climb_hours(
                current_tier, target_tier, avg_climb_prob
            )

            # Step 9: Create blueprint package
            blueprint = {
                "player_id": player_id,
                "current_tier": current_tier,
                "target_tier": target_tier,
                "main_role": current_role,
                "recommended_champions": recommended_champions,
                "recommended_builds": recommended_builds,
                "power_spike_windows": power_spikes,
                "estimated_climb_hours": estimated_hours,
                "climb_probability": round(avg_climb_prob * 100, 1),
                "confidence_score": round(
                    (predicted_confidence := predictions[0][1] if predictions else 0) * 100, 1
                ),
                "generated_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "metrics": {
                    "total_samples_analyzed": sum(
                        c["sample_size"] for c in recommended_champions
                    ),
                    "tier_gap": len(
                        tier_order[
                            tier_order.index(current_tier) : tier_order.index(target_tier)
                        ]
                    ),
                },
            }

            # Step 10: Store blueprint in database
            await self._store_blueprint(blueprint)

            logger.info(
                f"✅ Blueprint generated: {avg_climb_prob*100:.1f}% success probability"
            )

            return blueprint

        except Exception as e:
            logger.error(f"Blueprint generation error: {e}")
            return {"error": f"Blueprint generation failed: {str(e)}"}

    async def _get_player_stats(self, player_id: str) -> Optional[Dict]:
        """Get current player statistics"""
        query = """
            SELECT id, tier, rank, main_role
            FROM player_accounts
            WHERE id = $1
        """
        return await self.pool.fetchrow(query, player_id)

    async def _get_champion_candidates(
        self, current_tier: str, target_tier: str, role: str
    ) -> List[Dict]:
        """
        Get champion candidates for this tier progression
        Prioritize champions with:
        - High win rate at target tier
        - Reasonable sample size
        - Good learning curve
        """
        query = """
            SELECT
                ctp.champion_id,
                COALESCE(ctp.champion_name, 'Champion_' || ctp.champion_id::text) as champion_name,
                ctp.role,
                ctp.win_rate,
                ctp.sample_size,
                ctp.average_kda,
                ctp.average_cs_per_min,
                CASE
                    WHEN ctp.average_kda < 2.0 THEN 10  -- Very hard champion
                    WHEN ctp.average_kda < 2.5 THEN 7
                    WHEN ctp.average_kda < 3.0 THEN 5
                    ELSE 3  -- Easy champion
                END as difficulty_level
            FROM champion_tier_performance ctp
            WHERE ctp.current_tier = $2
                AND ctp.role = $3
                AND ctp.sample_size >= 10
                AND ctp.win_rate >= 48
            ORDER BY ctp.win_rate DESC
            LIMIT 50
        """

        rows = await self.pool.fetch(query, current_tier, target_tier, role)

        candidates = [dict(row) for row in rows]
        logger.info(f"Found {len(candidates)} champion candidates")

        return candidates

    async def _get_optimal_builds(
        self, champion_id: int, role: str, tier: str
    ) -> List[Dict]:
        """Get recommended item build paths for a champion"""
        query = """
            SELECT
                item_sequence,
                win_rate,
                sample_size,
                average_game_duration_seconds
            FROM optimal_item_builds
            WHERE champion_id = $1
                AND role = $2
                AND tier = $3
                AND sample_size >= 5
            ORDER BY win_rate DESC
            LIMIT 3
        """

        rows = await self.pool.fetch(query, champion_id, role, tier)

        builds = []
        for row in rows:
            builds.append(
                {
                    "item_sequence": row["item_sequence"],
                    "win_rate": row["win_rate"],
                    "sample_size": row["sample_size"],
                    "average_duration_minutes": round(
                        (row["average_game_duration_seconds"] or 0) / 60, 1
                    ),
                }
            )

        return builds

    async def _get_power_spikes(self, champion_id: int, role: str) -> Optional[Dict]:
        """Get power spike timings for a champion"""
        query = """
            SELECT
                spike_time_minutes,
                spike_power_level
            FROM power_spike_timings
            WHERE champion_id = $1
                AND role = $2
            ORDER BY spike_time_minutes
            LIMIT 5
        """

        rows = await self.pool.fetch(query, champion_id, role)

        if not rows:
            return None

        spikes = {}
        for row in rows:
            time = row["spike_time_minutes"]
            power = row["spike_power_level"]

            if time < 10:
                spikes["early"] = {"time_minutes": time, "power_level": power}
            elif time < 20:
                spikes["mid"] = {"time_minutes": time, "power_level": power}
            else:
                spikes["late"] = {"time_minutes": time, "power_level": power}

        return spikes if spikes else None

    async def _estimate_climb_hours(
        self, current_tier: str, target_tier: str, success_probability: float
    ) -> float:
        """
        Estimate hours needed to climb based on:
        - Tier gap
        - Success probability (higher = faster)
        - Average LP gain assumptions
        """
        tier_order = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]
        tier_distance = tier_order.index(target_tier) - tier_order.index(current_tier)

        # Base hours per tier: assumes 40 games average, 1.5 games/hour
        hours_per_tier = 40 / 1.5 / max(success_probability, 0.45)

        total_hours = tier_distance * hours_per_tier

        return round(total_hours, 1)

    async def _store_blueprint(self, blueprint: Dict):
        """Store blueprint in database for future reference"""
        query = """
            INSERT INTO player_blueprints
            (player_id, current_tier, target_tier, main_role,
             recommended_champions, recommended_builds, power_spike_windows,
             estimated_climb_hours, climb_probability, created_at, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP + INTERVAL '30 days')
            ON CONFLICT (player_id, target_tier) DO UPDATE SET
                recommended_champions = EXCLUDED.recommended_champions,
                recommended_builds = EXCLUDED.recommended_builds,
                estimated_climb_hours = EXCLUDED.estimated_climb_hours,
                climb_probability = EXCLUDED.climb_probability
        """

        try:
            await self.pool.execute(
                query,
                blueprint["player_id"],
                blueprint["current_tier"],
                blueprint["target_tier"],
                blueprint["main_role"],
                json.dumps(blueprint["recommended_champions"]),
                json.dumps(blueprint["recommended_builds"]),
                json.dumps(blueprint["power_spike_windows"]),
                blueprint["estimated_climb_hours"],
                blueprint["climb_probability"] / 100.0,
            )
            logger.info(f"✅ Blueprint stored for player {blueprint['player_id']}")
        except Exception as e:
            logger.error(f"Error storing blueprint: {e}")


# CLI Testing
if __name__ == "__main__":
    import asyncio
    import os
    from dotenv import load_dotenv

    load_dotenv()

    async def main():
        db_url = os.getenv("DATABASE_URL")
        pool = await asyncpg.create_pool(db_url, min_size=5, max_size=20)

        try:
            service = BlueprintGenerationService(pool)

            # Example: Generate blueprint for a player
            player_id = "550e8400-e29b-41d4-a716-446655440000"  # Sample UUID
            blueprint = await service.generate_blueprint(
                player_id=player_id, target_tier="PLATINUM", role="MID"
            )

            print("Generated Blueprint:")
            print(json.dumps(blueprint, indent=2))

        finally:
            await pool.close()

    asyncio.run(main())
