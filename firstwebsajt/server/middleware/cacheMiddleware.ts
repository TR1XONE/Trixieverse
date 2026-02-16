/**
 * Cache Middleware
 * HTTP caching for GET requests
 */

import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';

interface CachedRequest extends Request {
  cacheKey?: string;
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(ttlSeconds: number = 300) {
  return (req: CachedRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = `${req.user?.id}:${req.path}:${JSON.stringify(req.query)}`;
    req.cacheKey = cacheKey;

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttlSeconds);
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Invalidate specific cache entries matching pattern
  const stats = cache.stats();
  stats.entries.forEach((entry) => {
    if (entry.key.includes(pattern)) {
      cache.delete(entry.key);
    }
  });
}

/**
 * Cache invalidation middleware
 * Invalidates cache on POST/PUT/DELETE requests
 */
export function cacheInvalidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Invalidate cache on mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Invalidate user-specific cache
    if (req.user?.id) {
      invalidateCache(req.user.id);
    }
  }

  next();
}
