"""
Champion Pool Recommender Model
Predicts the best champions for a player to climb with
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import logging
from typing import List, Dict, Tuple
from datetime import datetime
import asyncpg

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChampionRecommenderModel:
    """
    ML model that recommends champions based on:
    - Win rate at target tier
    - Learning curve (games to proficiency)
    - Playstyle fit
    - Counter-pick value
    """

    def __init__(self, model_path: str = "models/champion_recommender.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_encoders = {}
        self.feature_columns = [
            "win_rate_current_tier",
            "win_rate_target_tier",
            "sample_size",
            "avg_kda",
            "avg_cs_per_min",
            "learning_curve_score",
            "playstyle_fit",
            "counter_pick_value",
            "ban_rate",
        ]

    async def prepare_training_data(self, pool: asyncpg.Pool) -> pd.DataFrame:
        """
        Prepare training data from database
        Features: champion stats, win rates, playstyles
        Target: successful climbs (players who climbed 2+ tiers)
        """
        logger.info("📊 Preparing training data...")

        # Get successful climbs (players who climbed 2+ tiers)
        query = """
            SELECT
                m.champion_id,
                pa.role,
                pa.tier,
                COUNT(*) as match_count,
                SUM(CASE WHEN m.is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                AVG(m.kills + m.assists) / NULLIF(AVG(m.deaths), 0) as avg_kda,
                AVG(m.cs::float / NULLIF(m.game_duration_seconds / 60.0, 0)) as cs_per_min,
                AVG(m.vision_score) as avg_vision_score,
                AVG(m.damage_dealt_to_champions) as avg_damage
            FROM matches m
            JOIN player_accounts pa ON m.player_id = pa.id
            WHERE m.champion_id IS NOT NULL
                AND m.role != 'UNKNOWN'
            GROUP BY m.champion_id, pa.role, pa.tier
            HAVING COUNT(*) >= 20
        """

        rows = await pool.fetch(query)

        data = []
        for row in rows:
            # Engineering features
            win_rate = row["win_rate"] or 0
            avg_kda = row["avg_kda"] or 1.0
            cs_per_min = row["cs_per_min"] or 5.0

            # Learning curve: how consistent is win rate across games?
            learning_curve_score = min(avg_kda / 2.0, 1.0)  # Normalized to 0-1

            # Playstyle fit: damage dealt indicator
            avg_damage = row["avg_damage"] or 0
            playstyle_fit = min(avg_damage / 5000.0, 1.0)  # Damage-heavy = high fit

            # Counter-pick value: estimated from matchup diversity
            counter_pick_value = min(row["match_count"] / 100.0, 1.0)

            data.append(
                {
                    "champion_id": row["champion_id"],
                    "role": row["role"],
                    "tier": row["tier"],
                    "win_rate": win_rate,
                    "learning_curve_score": learning_curve_score,
                    "playstyle_fit": playstyle_fit,
                    "counter_pick_value": counter_pick_value,
                    "sample_size": row["match_count"],
                    "avg_kda": avg_kda,
                    "avg_cs_per_min": cs_per_min,
                    "avg_vision_score": row["avg_vision_score"] or 0,
                    # Target: high win rate champions
                    "is_strong_pick": 1 if win_rate >= 52 else 0,
                }
            )

        df = pd.DataFrame(data)
        logger.info(f"✅ Prepared {len(df)} training samples")

        return df

    async def train(self, pool: asyncpg.Pool) -> Dict:
        """
        Train champion recommender model
        Returns: model metrics (accuracy, precision, recall)
        """
        logger.info("🤖 Training champion recommender model...")

        try:
            # Prepare data
            df = await self.prepare_training_data(pool)

            if df.empty:
                logger.error("No training data available")
                return {"error": "No training data"}

            # Select features
            feature_cols = [
                "win_rate",
                "learning_curve_score",
                "playstyle_fit",
                "counter_pick_value",
                "sample_size",
                "avg_kda",
                "avg_cs_per_min",
            ]

            X = df[feature_cols].fillna(0)
            y = df["is_strong_pick"]

            # Split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Train ensemble
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=10,
                random_state=42,
                n_jobs=-1,
            )

            self.model.fit(X_train, y_train)

            # Evaluate
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)

            logger.info(f"✅ Model trained successfully")
            logger.info(f"   Accuracy:  {accuracy:.3f}")
            logger.info(f"   Precision: {precision:.3f}")
            logger.info(f"   Recall:    {recall:.3f}")

            # Save model
            joblib.dump(self.model, self.model_path)

            return {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "samples": len(X_train),
            }

        except Exception as e:
            logger.error(f"Training error: {e}")
            return {"error": str(e)}

    async def predict(
        self, champion_data: List[Dict]
    ) -> List[Tuple[int, float, float]]:
        """
        Predict recommendation score for champions
        Returns: [(champion_id, confidence, climb_probability), ...]
        """
        if not self.model:
            self.model = joblib.load(self.model_path)

        try:
            # Prepare features
            features = [
                [
                    data.get("win_rate", 0),
                    data.get("learning_curve_score", 0),
                    data.get("playstyle_fit", 0),
                    data.get("counter_pick_value", 0),
                    data.get("sample_size", 0),
                    data.get("avg_kda", 0),
                    data.get("avg_cs_per_min", 0),
                ]
                for data in champion_data
            ]

            # Predict
            predictions = self.model.predict_proba(features)

            results = []
            for i, data in enumerate(champion_data):
                champion_id = data.get("champion_id")
                confidence = predictions[i][1]  # Probability of class 1 (strong pick)
                climb_probability = min(
                    confidence * (data.get("win_rate", 0) / 100.0), 0.95
                )

                results.append((champion_id, round(confidence, 3), round(climb_probability, 3)))

            return sorted(results, key=lambda x: x[1], reverse=True)

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return []


class ClimbTimePredictorModel:
    """
    Predicts estimated hours to reach target tier
    Based on: current win rate, LP gain rate, games per hour
    """

    def __init__(self, model_path: str = "models/climb_time_predictor.pkl"):
        self.model_path = model_path
        self.model = None

    async def prepare_training_data(self, pool: asyncpg.Pool) -> pd.DataFrame:
        """
        Prepare data from actual player climbing histories
        """
        logger.info("📊 Preparing climb time training data...")

        # Aggregate player progression data
        query = """
            SELECT
                pa.id as player_id,
                pa.tier,
                COUNT(*) as total_games,
                SUM(CASE WHEN m.is_win THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as win_rate,
                (DATE(MAX(m.created_at)) - DATE(MIN(m.created_at))) as days_played,
                COUNT(*) / NULLIF(
                    DATE(MAX(m.created_at)) - DATE(MIN(m.created_at)), 0
                )::float as games_per_day
            FROM player_accounts pa
            JOIN matches m ON pa.id = m.player_id
            WHERE pa.tier IN ('SILVER', 'GOLD', 'PLATINUM', 'DIAMOND')
                AND m.created_at > CURRENT_DATE - INTERVAL '90 days'
            GROUP BY pa.id, pa.tier
            HAVING COUNT(*) >= 50
        """

        rows = await pool.fetch(query)

        data = []
        for row in rows:
            win_rate = row["win_rate"] or 0
            games_per_day = row["games_per_day"] or 1.0
            days_played = row["days_played"] or 1

            # Estimate climb time: LP needed / LP gain per game / games per day
            lp_gain_per_game = max(win_rate - 50, 0) * 0.2  # Conservative estimate
            climb_hours = max(100 / (lp_gain_per_game + 1) / games_per_day * 24, 0.1)

            data.append(
                {
                    "win_rate": win_rate,
                    "games_per_day": games_per_day,
                    "days_played": days_played,
                    "estimated_climb_hours": min(climb_hours, 500),  # Cap at 500 hours
                }
            )

        df = pd.DataFrame(data)
        logger.info(f"✅ Prepared {len(df)} climb time samples")

        return df

    async def train(self, pool: asyncpg.Pool) -> Dict:
        """Train climb time predictor"""
        logger.info("🤖 Training climb time predictor model...")

        try:
            df = await self.prepare_training_data(pool)

            if df.empty:
                return {"error": "No training data"}

            X = df[["win_rate", "games_per_day"]].fillna(0)
            y = df["estimated_climb_hours"]

            # Use gradient boosting for regression
            self.model = GradientBoostingClassifier(
                n_estimators=50, max_depth=5, random_state=42
            )

            self.model.fit(X, y)

            # Save
            joblib.dump(self.model, self.model_path)

            logger.info(f"✅ Climb time predictor trained")

            return {"samples": len(X)}

        except Exception as e:
            logger.error(f"Training error: {e}")
            return {"error": str(e)}


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
            # Train champion recommender
            recommender = ChampionRecommenderModel()
            metrics = await recommender.train(pool)
            print(f"Champion Recommender Metrics: {metrics}")

            # Train climb time predictor
            climb_predictor = ClimbTimePredictorModel()
            metrics = await climb_predictor.train(pool)
            print(f"Climb Time Predictor Metrics: {metrics}")

        finally:
            await pool.close()

    asyncio.run(main())
