import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/achievements:
 *   get:
 *     summary: Get user achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User achievements
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user stats
    const [missions, projects, reflections] = await Promise.all([
      prisma.mission.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.reflection.findMany({ where: { userId } }),
    ]);

    const completedMissions = missions.filter(m => m.status === 'Completed').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalProgress = missions.reduce((sum, m) => sum + (m.progress || 0), 0);
    const avgProgress = missions.length > 0 ? Math.round(totalProgress / missions.length) : 0;
    
    // Calculate learning streak
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReflections = reflections.filter(r => r.createdAt >= sevenDaysAgo);
    const learningStreak = Math.min(recentReflections.length, 7);

    const achievements = [
      {
        id: 'first-mission',
        title: 'First Mission',
        description: 'Completed your first mission',
        icon: 'Target',
        earned: completedMissions > 0,
        earnedAt: completedMissions > 0 ? missions.find(m => m.status === 'Completed')?.updatedAt : null
      },
      {
        id: 'consistent-learner',
        title: 'Consistent Learner',
        description: '7-day reflection streak',
        icon: 'BookOpen',
        earned: learningStreak >= 7,
        earnedAt: learningStreak >= 7 ? new Date() : null
      },
      {
        id: 'project-master',
        title: 'Project Master',
        description: 'Completed 5 projects',
        icon: 'FolderKanban',
        earned: completedProjects >= 5,
        earnedAt: completedProjects >= 5 ? projects.filter(p => p.status === 'Completed')[4]?.updatedAt : null
      },
      {
        id: 'rising-star',
        title: 'Rising Star',
        description: 'Reached 50% progress on all missions',
        icon: 'TrendingUp',
        earned: avgProgress >= 50 && missions.length > 0,
        earnedAt: avgProgress >= 50 && missions.length > 0 ? new Date() : null
      }
    ];

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
});

export default router;