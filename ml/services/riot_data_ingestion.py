"""
Riot API data ingestion service for TrixieVerse
Handles async fetching of Wild Rift match data at scale
"""

import asyncio
import aiohttp
import logging
from typing import List, Dict, Optional
from datetime import datetime
import asyncpg
from dataclasses import dataclass
from enum import Enum
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RiotTier(Enum):
    """Wild Rift rank tiers"""
    IRON = "IRON"
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"
    DIAMOND = "DIAMOND"
    EMERALD = "EMERALD"
    GRANDMASTER = "GRANDMASTER"


@dataclass
class PlayerAccount:
    """Riot player account info"""
    puuid: str
    summoner_name: str
    tag_line: str
    tier: str
    rank: str


@dataclass
class RiotMatch:
    """Raw Riot match data"""
    match_id: str
    player_puuid: str
    champion_id: int
    role: str
    lane: str
    team_position: str
    kills: int
    deaths: int
    assists: int
    cs: int
    gold_earned: int
    damage_dealt_to_champions: int
    vision_score: int
    damage_dealt_to_objectives: int
    damage_dealt_to_buildings: int
    first_blood_kill: bool
    first_turret_kill: bool
    largest_killing_spree: int
    wards_placed: int
    wards_killed: int
    game_duration_seconds: int
    game_version: str
    timestamp: int
    win: bool


class RiotAPIClient:
    """
    Async Riot API client with built-in rate limiting
    Rate limit: 100 requests per 2 minutes (1 request per 1.2 seconds)
    """

    def __init__(self, api_key: str, region: str = "na1"):
        self.api_key = api_key
        self.region = region
        self.base_url = f"https://{region}.api.riotgames.com"
        self.regional_url = "https://americas.api.riotgames.com"  # For match history
        self.min_request_interval = 1.2  # Rate limiting
        self.last_request_time = 0
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

    async def _rate_limit(self):
        """Enforce rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()

    async def _get(self, url: str) -> Dict:
        """Generic GET request with error handling"""
        await self._rate_limit()
        
        try:
            async with self.session.get(url, headers={"X-Riot-Token": self.api_key}) as resp:
                if resp.status == 200:
                    return await resp.json()
                elif resp.status == 429:
                    logger.warning("Rate limited, backing off...")
                    await asyncio.sleep(5)
                    return await self._get(url)
                elif resp.status == 404:
                    logger.warning(f"Not found: {url}")
                    return None
                else:
                    logger.error(f"Error {resp.status}: {await resp.text()}")
                    return None
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return None

    async def get_account_by_game_name(
        self, summoner_name: str, tag_line: str
    ) -> Optional[Dict]:
        """Get player PUUID by summoner name"""
        url = f"{self.regional_url}/riot/account/v1/accounts/by-riot-id/{summoner_name}/{tag_line}"
        return await self._get(url)

    async def get_match_ids(
        self, puuid: str, start: int = 0, count: int = 20
    ) -> Optional[List[str]]:
        """Get list of match IDs for a player"""
        url = f"{self.regional_url}/lol/match/v5/matches/by-puuid/{puuid}/ids?start={start}&count={count}"
        return await self._get(url)

    async def get_match_details(self, match_id: str) -> Optional[Dict]:
        """Get full match details"""
        url = f"{self.regional_url}/lol/match/v5/matches/{match_id}"
        return await self._get(url)

    async def get_ranked_stats(self, player_id: str) -> Optional[List[Dict]]:
        """Get player ranked stats (tier, LP, etc)"""
        url = f"{self.base_url}/lol/league/v4/entries/by-summoner/{player_id}"
        return await self._get(url)


class MatchProcessor:
    """Process raw Riot match data into standardized format"""

    @staticmethod
    def parse_match(match_data: Dict, player_puuid: str) -> Optional[RiotMatch]:
        """
        Extract player's match performance from raw Riot data
        Returns None if player data not found
        """
        try:
            info = match_data.get("info", {})
            participants = info.get("participants", [])

            # Find player in participants
            player_data = None
            for p in participants:
                if p.get("puuid") == player_puuid:
                    player_data = p
                    break

            if not player_data:
                logger.warning(f"Player {player_puuid} not found in match")
                return None

            match = RiotMatch(
                match_id=match_data.get("metadata", {}).get("match_id"),
                player_puuid=player_puuid,
                champion_id=player_data.get("championId"),
                role=player_data.get("role", "UNKNOWN"),
                lane=player_data.get("lane", "UNKNOWN"),
                team_position=player_data.get("teamPosition", "UNKNOWN"),
                kills=player_data.get("kills", 0),
                deaths=player_data.get("deaths", 0),
                assists=player_data.get("assists", 0),
                cs=player_data.get("totalMinionsKilled", 0)
                + player_data.get("neutralMinionsKilled", 0),
                gold_earned=player_data.get("goldEarned", 0),
                damage_dealt_to_champions=player_data.get(
                    "totalDamageDealtToChampions", 0
                ),
                vision_score=player_data.get("visionScore", 0),
                damage_dealt_to_objectives=player_data.get(
                    "damageDealtToObjectives", 0
                ),
                damage_dealt_to_buildings=player_data.get(
                    "damageDealtToTurrets", 0
                ),
                first_blood_kill=player_data.get("firstBloodKill", False),
                first_turret_kill=player_data.get("firstTurretKill", False),
                largest_killing_spree=player_data.get("largestKillingSpree", 0),
                wards_placed=player_data.get("wardsPlaced", 0),
                wards_killed=player_data.get("wardsKilled", 0),
                game_duration_seconds=info.get("gameDuration", 0),
                game_version=info.get("gameVersion", ""),
                timestamp=info.get("gameStartTimestamp", 0),
                win=player_data.get("win", False),
            )

            return match

        except Exception as e:
            logger.error(f"Error parsing match: {e}")
            return None


class DataWarehouse:
    """PostgreSQL connection and storage"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        """Create connection pool"""
        self.pool = await asyncpg.create_pool(
            self.db_url,
            min_size=5,
            max_size=20,
            command_timeout=60,
        )
        logger.info("✅ Database connected")

    async def disconnect(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()

    async def store_match(self, match: RiotMatch, player_id: str) -> bool:
        """Store match in matches table"""
        try:
            # Check if match already exists
            existing = await self.pool.fetchval(
                "SELECT id FROM matches WHERE riot_match_id = $1",
                match.match_id,
            )

            if existing:
                logger.debug(f"Match {match.match_id} already stored")
                return False

            # Insert match
            query = """
                INSERT INTO matches (
                    player_id, riot_match_id, champion_id, role, kills, deaths,
                    assists, cs, gold_earned, damage_dealt_to_champions,
                    vision_score, damage_dealt_to_objectives, damage_dealt_to_buildings,
                    first_blood_kill, largest_killing_spree, wards_placed, wards_killed,
                    game_duration_seconds, created_at, is_win
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
                )
            """

            await self.pool.execute(
                query,
                player_id,
                match.match_id,
                match.champion_id,
                match.role,
                match.kills,
                match.deaths,
                match.assists,
                match.cs,
                match.gold_earned,
                match.damage_dealt_to_champions,
                match.vision_score,
                match.damage_dealt_to_objectives,
                match.damage_dealt_to_buildings,
                match.first_blood_kill,
                match.largest_killing_spree,
                match.wards_placed,
                match.wards_killed,
                match.game_duration_seconds,
                datetime.fromtimestamp(match.timestamp / 1000),
                match.win,
            )

            logger.info(f"✅ Stored match {match.match_id}")
            return True

        except Exception as e:
            logger.error(f"Error storing match: {e}")
            return False

    async def get_match_count(self) -> int:
        """Get total matches in database"""
        count = await self.pool.fetchval("SELECT COUNT(*) FROM matches")
        return count or 0


class RiotDataPipeline:
    """Orchestrate data ingestion pipeline"""

    def __init__(self, api_key: str, db_url: str):
        self.client = RiotAPIClient(api_key)
        self.warehouse = DataWarehouse(db_url)
        self.processor = MatchProcessor()

    async def ingest_player_matches(
        self, summoner_name: str, tag_line: str, player_id: str, count: int = 50
    ) -> int:
        """Fetch and store recent matches for a player"""
        try:
            async with self.client:
                # Get account
                account = await self.client.get_account_by_game_name(
                    summoner_name, tag_line
                )
                if not account:
                    logger.error(f"Account not found: {summoner_name}#{tag_line}")
                    return 0

                puuid = account.get("puuid")
                logger.info(f"📊 Fetching {count} matches for {summoner_name}#{tag_line}")

                # Get match IDs
                match_ids = await self.client.get_match_ids(puuid, count=count)
                if not match_ids:
                    logger.warning("No matches found")
                    return 0

                logger.info(f"📋 Found {len(match_ids)} matches, fetching details...")

                # Fetch and store matches (parallel)
                tasks = [
                    self._fetch_and_store_match(mid, player_id, puuid)
                    for mid in match_ids
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                stored_count = sum(1 for r in results if r is True)
                logger.info(f"✅ Stored {stored_count}/{len(match_ids)} matches")

                return stored_count

        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return 0

    async def _fetch_and_store_match(
        self, match_id: str, player_id: str, puuid: str
    ) -> bool:
        """Fetch single match and store"""
        try:
            match_data = await self.client.get_match_details(match_id)
            if not match_data:
                return False

            match = self.processor.parse_match(match_data, puuid)
            if not match:
                return False

            return await self.warehouse.store_match(match, player_id)

        except Exception as e:
            logger.error(f"Error processing match {match_id}: {e}")
            return False

    async def bulk_ingest(self, summoner_list: List[tuple], batch_size: int = 5):
        """
        Ingest matches for multiple players in parallel batches
        summoner_list: List of (summoner_name, tag_line, player_id)
        """
        await self.warehouse.connect()

        try:
            for i in range(0, len(summoner_list), batch_size):
                batch = summoner_list[i : i + batch_size]
                logger.info(f"Processing batch {i // batch_size + 1}/{(len(summoner_list) + batch_size - 1) // batch_size}")

                tasks = [
                    self.ingest_player_matches(name, tag, player_id, count=100)
                    for name, tag, player_id in batch
                ]
                await asyncio.gather(*tasks)

                await asyncio.sleep(2)  # Brief pause between batches

            total_matches = await self.warehouse.get_match_count()
            logger.info(f"✅ Pipeline complete. Total matches: {total_matches}")

        finally:
            await self.warehouse.disconnect()


# Usage example
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    api_key = os.getenv("RIOT_API_KEY")
    db_url = os.getenv("DATABASE_URL")

    pipeline = RiotDataPipeline(api_key, db_url)

    # Example: Ingest matches for a list of players
    summoners = [
        ("summoner_name_1", "NA1", "player_id_1"),
        ("summoner_name_2", "NA1", "player_id_2"),
    ]

    asyncio.run(pipeline.bulk_ingest(summoners))
