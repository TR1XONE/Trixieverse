/**
 * Admin API Routes
 */

import { Router, Request, Response } from 'express';
import adminService from '../services/adminService.js';

const router = Router();

// Middleware to check admin role
const adminOnly = (req: Request, res: Response, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.use(adminOnly);

/**
 * GET /admin/dashboard
 * Get admin dashboard stats
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

/**
 * GET /admin/users
 * Get all users
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const users = await adminService.getAllUsers(
      parseInt(limit as string),
      parseInt(offset as string)
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /admin/users/:userId
 * Get user details
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserDetails(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

/**
 * POST /admin/users/:userId/suspend
 * Suspend user
 */
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason required' });
    }

    await adminService.suspendUser(userId, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

/**
 * POST /admin/users/:userId/unsuspend
 * Unsuspend user
 */
router.post('/users/:userId/unsuspend', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await adminService.unsuspendUser(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsuspend user' });
  }
});

/**
 * DELETE /admin/users/:userId
 * Delete user
 */
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /admin/reports
 * Get reported content
 */
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const reports = await adminService.getReportedContent(parseInt(limit as string));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * POST /admin/reports/:reportId/resolve
 * Resolve report
 */
router.post('/reports/:reportId/resolve', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action required' });
    }

    await adminService.resolveReport(reportId, action);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

/**
 * GET /admin/logs
 * Get system logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await adminService.getSystemLogs(
      parseInt(limit as string),
      parseInt(offset as string)
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

/**
 * GET /admin/health
 * Get system health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await adminService.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system health' });
  }
});

/**
 * GET /admin/analytics
 * Get analytics report
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await adminService.getAnalyticsReport(parseInt(days as string));
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
