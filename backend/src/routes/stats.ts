import { Router } from 'express';
import { prisma } from '../db/prisma';

/**
 * @openapi
 * tags:
 *   - name: Stats
 *     description: Platform statistics endpoints
 */
const router = Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeStudents: { type: integer }
 *                     missionsCompleted: { type: integer }
 *                     projectsCreated: { type: integer }
 *                     successRate: { type: integer }
 */
router.get('/', async (_req, res) => {
  try {
    const [totalUsers, completedMissions, totalProjects, totalMissions] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.mission.count({ where: { status: 'Completed' } }),
      prisma.project.count(),
      prisma.mission.count()
    ]);
    
    const successRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        activeStudents: totalUsers,
        missionsCompleted: completedMissions,
        projectsCreated: totalProjects,
        successRate
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

export default router;
