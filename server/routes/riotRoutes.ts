import { Router, Request, Response, NextFunction } from 'express';
import riotApiService from '../services/riotApiService';
import logger from '../utils/logger';

const router = Router();

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameName = typeof req.query.gameName === 'string' ? req.query.gameName : '';
    const tagLine = typeof req.query.tagLine === 'string' ? req.query.tagLine : '';
    const start = typeof req.query.start === 'string' ? Number.parseInt(req.query.start, 10) : 0;
    const count = typeof req.query.count === 'string' ? Number.parseInt(req.query.count, 10) : 20;

    if (!gameName || !tagLine) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query params: gameName, tagLine',
      });
    }

    const account = await riotApiService.getAccountByGameName(gameName, tagLine);
    const puuid = account?.puuid as string | undefined;

    if (!puuid) {
      return res.status(502).json({
        success: false,
        message: 'Riot API did not return a puuid for this account',
      });
    }

    const [ranked, matchIds] = await Promise.all([
      riotApiService.getRankedStatsByPuuid(puuid),
      riotApiService.getMatchIdsByPuuid(puuid, Number.isFinite(start) ? start : 0, Number.isFinite(count) ? count : 20),
    ]);

    return res.json({
      success: true,
      data: {
        account,
        ranked,
        matchIds,
      },
    });
  } catch (error: any) {
    logger.error({ message: 'Error fetching Riot profile', error: error?.message, status: error?.response?.status });
    const status = error?.response?.status;
    if (typeof status === 'number') {
      return res.status(status).json({
        success: false,
        message: 'Riot API error',
        status,
      });
    }
    next(error);
  }
});

router.get('/matches/by-puuid/:puuid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { puuid } = req.params;
    const start = typeof req.query.start === 'string' ? Number.parseInt(req.query.start, 10) : 0;
    const count = typeof req.query.count === 'string' ? Number.parseInt(req.query.count, 10) : 20;

    if (!puuid) {
      return res.status(400).json({ success: false, message: 'Missing puuid' });
    }

    const matchIds = await riotApiService.getMatchIdsByPuuid(
      puuid,
      Number.isFinite(start) ? start : 0,
      Number.isFinite(count) ? count : 20
    );

    return res.json({ success: true, data: matchIds });
  } catch (error: any) {
    logger.error({ message: 'Error fetching Riot match IDs', error: error?.message, status: error?.response?.status });
    const status = error?.response?.status;
    if (typeof status === 'number') {
      return res.status(status).json({ success: false, message: 'Riot API error', status });
    }
    next(error);
  }
});

router.get('/matches/:matchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId } = req.params;
    if (!matchId) {
      return res.status(400).json({ success: false, message: 'Missing matchId' });
    }

    const match = await riotApiService.getMatchById(matchId);
    return res.json({ success: true, data: match });
  } catch (error: any) {
    logger.error({ message: 'Error fetching Riot match', error: error?.message, status: error?.response?.status });
    const status = error?.response?.status;
    if (typeof status === 'number') {
      return res.status(status).json({ success: false, message: 'Riot API error', status });
    }
    next(error);
  }
});

router.get('/ranked/by-puuid/:puuid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { puuid } = req.params;
    if (!puuid) {
      return res.status(400).json({ success: false, message: 'Missing puuid' });
    }

    const ranked = await riotApiService.getRankedStatsByPuuid(puuid);
    return res.json({ success: true, data: ranked });
  } catch (error: any) {
    logger.error({ message: 'Error fetching Riot ranked stats', error: error?.message, status: error?.response?.status });
    const status = error?.response?.status;
    if (typeof status === 'number') {
      return res.status(status).json({ success: false, message: 'Riot API error', status });
    }
    next(error);
  }
});

export default router;
