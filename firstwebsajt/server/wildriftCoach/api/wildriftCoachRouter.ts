import { Router, Request, Response, NextFunction } from 'express';
import singleMatchAnalysisService from '../services/SingleMatchAnalysisService';
import trendAnalysisService from '../services/TrendAnalysisService';
import type { IngestMatchRequestBody, TrendRequestBody } from './types';

const router = Router();

router.post('/analyze/match', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as IngestMatchRequestBody;
    if (!body?.match?.matchId || !body?.match?.puuid) {
      return res.status(400).json({ success: false, message: 'Missing match.matchId or match.puuid' });
    }

    const analysis = await singleMatchAnalysisService.analyze(body.match);
    return res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
});

router.post('/analyze/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as TrendRequestBody;
    if (!body?.puuid || !Array.isArray(body?.matches)) {
      return res.status(400).json({ success: false, message: 'Missing puuid or matches[]' });
    }

    const trend = await trendAnalysisService.analyze({
      puuid: body.puuid,
      matches: body.matches,
      windowSize: body.windowSize,
    });

    return res.json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
});

export default router;
