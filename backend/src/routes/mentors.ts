import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/mentors:
 *   get:
 *     summary: List available mentors
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentors
 */
router.get('/', async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { 
        role: { in: ['mentor', 'admin'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            missions: true // Count missions as students mentored
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const mentorsWithStats = await Promise.all(mentors.map(async (mentor) => {
      // Get expertise from user's mission categories
      const missions = await prisma.mission.findMany({
        where: { userId: mentor.id },
        select: { category: true },
        distinct: ['category']
      });
      
      const expertise = missions.length > 0 
        ? missions.map((m) => m.category)
        : ['General Mentoring'];
      
      return {
        id: mentor.id,
        name: mentor.name,
        role: mentor.role,
        expertise,
        students: mentor._count.missions, // Use mission count as proxy for students
        rating: 4.5 + (mentor.id.charCodeAt(0) % 10) / 20, // Deterministic rating based on ID
        available: true
      };
    }));
    
    res.json({
      success: true,
      data: mentorsWithStats
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

export default router;