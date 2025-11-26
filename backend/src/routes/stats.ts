import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const [
      totalUsers,
      totalMissions,
      totalProjects,
      totalReflections,
      completedMissions,
      completedProjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.mission.count(),
      prisma.project.count(),
      prisma.reflection.count(),
      prisma.mission.count({ where: { status: 'Completed' } }),
      prisma.project.count({ where: { status: 'Completed' } })
    ]);

    const successRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

    const stats = {
      activeStudents: totalUsers,
      missionsCompleted: completedMissions,
      projectsCreated: totalProjects,
      successRate,
      totalReflections: totalReflections,
      totalMissions,
      completedProjects
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics'
    });
  }
});

export default router;