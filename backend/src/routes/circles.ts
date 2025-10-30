import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/circles:
 *   get:
 *     summary: List peer circles
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of circles
 */
router.get('/', async (req, res) => {
  try {
    const circles = await prisma.circle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: circles
    });
  } catch (error) {
    console.error('Get circles error:', error);
    res.status(500).json({ error: 'Failed to fetch circles' });
  }
});

/**
 * @openapi
 * /api/circles:
 *   post:
 *     summary: Create new circle
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string, enum: [Technical, SoftSkills, Business] }
 *     responses:
 *       201:
 *         description: Circle created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, category = 'Technical' } = req.body;
    
    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        category
      }
    });
    
    res.status(201).json({
      success: true,
      data: circle
    });
  } catch (error) {
    console.error('Create circle error:', error);
    res.status(500).json({ error: 'Failed to create circle' });
  }
});

/**
 * @openapi
 * /api/circles/{id}:
 *   get:
 *     summary: Get circle details
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Circle details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const circle = await prisma.circle.findUnique({
      where: { id }
    });
    
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    res.json({
      success: true,
      data: circle
    });
  } catch (error) {
    console.error('Get circle error:', error);
    res.status(500).json({ error: 'Failed to fetch circle' });
  }
});

export default router;