"""
TrixieVerse ML Service - FastAPI wrapper for blueprint generation
Provides HTTP endpoints for the Node.js backend to call Python ML logic
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import logging
import asyncio
import asyncpg
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import services
from services.blueprint_service import BlueprintGenerationService
from services.feature_engineering import PipelineOrchestrator
from services.riot_data_ingestion import RiotDataPipeline

# FastAPI app
app = FastAPI(
    title="TrixieVerse ML Service",
    description="Predictive rank climbing ML pipeline",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("VITE_API_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global connection pool
pool: Optional[asyncpg.Pool] = None


@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    global pool
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL not configured")
    
    try:
        pool = await asyncpg.create_pool(
            db_url,
            min_size=5,
            max_size=20,
            command_timeout=60,
        )
        logger.info("✅ ML Service initialized - Database connected")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    global pool
    if pool:
        await pool.close()
        logger.info("Database connection closed")


# ============ REQUEST MODELS ============

class BlueprintGenerateRequest(BaseModel):
    """Request to generate climbing blueprint"""
    player_id: str
    target_tier: str
    role: Optional[str] = None


class DataIngestionRequest(BaseModel):
    """Request to ingest player match data"""
    summoner_name: str
    tag_line: str
    player_id: str
    match_count: Optional[int] = 50


# ============ ENDPOINTS ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "trixieverse-ml",
        "version": "0.1.0"
    }


@app.post("/api/blueprint/generate")
async def generate_blueprint(request: BlueprintGenerateRequest):
    """
    Generate personalized climbing blueprint
    
    Args:
        player_id: UUID of player
        target_tier: Target rank (GOLD, PLATINUM, etc)
        role: Optional role preference (MID, ADC, etc)
    
    Returns:
        Climbing blueprint with recommended champions, builds, and success probability
    """
    global pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    try:
        logger.info(f"Generating blueprint for {request.player_id} → {request.target_tier}")
        
        service = BlueprintGenerationService(pool)
        blueprint = await service.generate_blueprint(
            player_id=request.player_id,
            target_tier=request.target_tier,
            role=request.role
        )
        
        if "error" in blueprint:
            raise HTTPException(status_code=400, detail=blueprint["error"])
        
        return blueprint
        
    except Exception as e:
        logger.error(f"Blueprint generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/blueprint/{player_id}")
async def get_blueprint(player_id: str):
    """Fetch cached blueprint for a player"""
    global pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    try:
        query = """
            SELECT
                player_id,
                current_tier,
                target_tier,
                main_role,
                recommended_champions,
                recommended_builds,
                power_spike_windows,
                estimated_climb_hours,
                climb_probability,
                created_at,
                expires_at
            FROM player_blueprints
            WHERE player_id = $1
                AND status = 'active'
                AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
        """
        
        blueprint = await pool.fetchrow(query, player_id)
        
        if not blueprint:
            raise HTTPException(status_code=404, detail="Blueprint not found")
        
        return {
            "player_id": blueprint["player_id"],
            "current_tier": blueprint["current_tier"],
            "target_tier": blueprint["target_tier"],
            "main_role": blueprint["main_role"],
            "recommended_champions": blueprint["recommended_champions"],
            "recommended_builds": blueprint["recommended_builds"],
            "power_spike_windows": blueprint["power_spike_windows"],
            "estimated_climb_hours": blueprint["estimated_climb_hours"],
            "climb_probability": blueprint["climb_probability"],
            "created_at": blueprint["created_at"].isoformat(),
            "expires_at": blueprint["expires_at"].isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching blueprint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/data/ingest")
async def ingest_player_data(request: DataIngestionRequest):
    """
    Ingest match data for a player from Riot API
    Populates feature tables for ML
    """
    global pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    try:
        api_key = os.getenv("RIOT_API_KEY")
        if not api_key:
            raise ValueError("RIOT_API_KEY not configured")
        
        db_url = os.getenv("DATABASE_URL")
        pipeline = RiotDataPipeline(api_key, db_url)
        
        logger.info(f"Ingesting matches for {request.summoner_name}")
        
        stored_count = await pipeline.ingest_player_matches(
            summoner_name=request.summoner_name,
            tag_line=request.tag_line,
            player_id=request.player_id,
            count=request.match_count or 50
        )
        
        return {
            "status": "success",
            "stored_matches": stored_count,
            "player_id": request.player_id
        }
        
    except Exception as e:
        logger.error(f"Data ingestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/features/update")
async def update_features():
    """
    Update champion performance and matchup features
    Should be run periodically (e.g., every 6 hours)
    """
    global pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    try:
        logger.info("Updating feature tables...")
        
        orchestrator = PipelineOrchestrator(pool)
        await orchestrator.update_champion_tier_performance()
        await orchestrator.update_champion_matchups()
        
        return {
            "status": "success",
            "message": "Features updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Feature update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/models/train")
async def train_models():
    """
    Train/retrain ML models
    Should be run daily or when new data is available
    """
    global pool
    
    if not pool:
        raise HTTPException(status_code=503, detail="Service not ready")
    
    try:
        logger.info("Training ML models...")
        
        from services.champion_recommender import (
            ChampionRecommenderModel,
            ClimbTimePredictorModel
        )
        
        # Train champion recommender
        recommender = ChampionRecommenderModel()
        recommender_metrics = await recommender.train(pool)
        
        # Train climb time predictor
        climb_predictor = ClimbTimePredictorModel()
        climb_predictor_metrics = await climb_predictor.train(pool)
        
        return {
            "status": "success",
            "champion_recommender": recommender_metrics,
            "climb_time_predictor": climb_predictor_metrics
        }
        
    except Exception as e:
        logger.error(f"Model training error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("ML_SERVICE_PORT", "5000"))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
