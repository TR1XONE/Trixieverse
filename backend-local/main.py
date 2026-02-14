from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ares_engine import CoachConfig, coach_from_ocr


app = FastAPI(title="Ares Local Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CoachConfigModel(BaseModel):
    name: str = "Sage"
    accent: str = "neutral"
    personality: str = "supportive"
    response_length: str = "medium"
    celebration_level: str = "moderate"


class OcrCoachRequest(BaseModel):
    ocr_text: str
    discord_user_id: str | None = None
    coach: CoachConfigModel | None = None
    matches: list[dict] | None = None


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/ares/coach")
def ares_coach(req: OcrCoachRequest) -> dict:
    coach_cfg = None
    if req.coach is not None:
        coach_cfg = CoachConfig(
            name=req.coach.name,
            accent=req.coach.accent,
            personality=req.coach.personality,
            response_length=req.coach.response_length,
            celebration_level=req.coach.celebration_level,
        )

    return coach_from_ocr(
        ocr_text=req.ocr_text,
        coach=coach_cfg,
        matches=req.matches,
        discord_user_id=req.discord_user_id,
    )


# Run locally (Windows):
# python -m venv .venv
# .venv\\Scripts\\activate
# pip install -r requirements.txt
# uvicorn main:app --host 0.0.0.0 --port 8000
