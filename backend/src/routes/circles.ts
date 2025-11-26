import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middlewares/auth';
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
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const circles = await prisma.circle.findMany({
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        posts: {
          select: { id: true }
        },
        _count: {
          select: {
            memberships: true,
            posts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const circlesWithMembershipStatus = circles.map(circle => ({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      category: circle.category,
      members: circle._count.memberships,
      posts: circle._count.posts,
      createdAt: circle.createdAt,
      updatedAt: circle.updatedAt,
      isMember: circle.memberships.some(m => m.userId === userId),
      membersList: circle.memberships.map(m => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        joinedAt: m.joinedAt,
        role: m.role
      }))
    }));
    
    res.json({
      success: true,
      data: circlesWithMembershipStatus
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

/**
 * @openapi
 * /api/circles/{id}:
 *   delete:
 *     summary: Delete circle
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
 *       204:
 *         description: Circle deleted
 *       404:
 *         description: Circle not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const circle = await prisma.circle.findUnique({
      where: { id }
    });
    
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    await prisma.circle.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete circle error:', error);
    res.status(500).json({ error: 'Failed to delete circle' });
  }
});

/**
 * @openapi
 * /api/circles/{id}/join:
 *   post:
 *     summary: Join a circle
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
 *         description: Successfully joined circle
 */
router.post('/:id/join', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const circle = await prisma.circle.findUnique({
      where: { id }
    });
    
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if already a member
    const existingMembership = await prisma.circleMembership.findUnique({
      where: {
        userId_circleId: {
          userId,
          circleId: id
        }
      }
    });
    
    if (existingMembership) {
      return res.status(400).json({ error: 'Already a member of this circle' });
    }
    
    await prisma.circleMembership.create({
      data: {
        userId,
        circleId: id
      }
    });
    
    res.json({
      success: true,
      message: 'Successfully joined circle'
    });
  } catch (error) {
    console.error('Join circle error:', error);
    res.status(500).json({ error: 'Failed to join circle' });
  }
});

/**
 * @openapi
 * /api/circles/{id}/leave:
 *   post:
 *     summary: Leave a circle
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
 *         description: Successfully left circle
 */
router.post('/:id/leave', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const membership = await prisma.circleMembership.findUnique({
      where: {
        userId_circleId: {
          userId,
          circleId: id
        }
      }
    });
    
    if (!membership) {
      return res.status(400).json({ error: 'Not a member of this circle' });
    }
    
    await prisma.circleMembership.delete({
      where: {
        userId_circleId: {
          userId,
          circleId: id
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Successfully left circle'
    });
  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({ error: 'Failed to leave circle' });
  }
});

/**
 * @openapi
 * /api/circles/{id}/posts:
 *   get:
 *     summary: Get circle posts (members only)
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
 *         description: Circle posts
 */
router.get('/:id/posts', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if user is a member
    const membership = await prisma.circleMembership.findUnique({
      where: {
        userId_circleId: {
          userId,
          circleId: id
        }
      }
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Must be a member to view posts' });
    }
    
    const posts = await prisma.circlePost.findMany({
      where: { circleId: id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get circle posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * @openapi
 * /api/circles/{id}/posts:
 *   post:
 *     summary: Create a post in circle (members only)
 *     tags: [Circles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/:id/posts', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    
    // Check if user is a member
    const membership = await prisma.circleMembership.findUnique({
      where: {
        userId_circleId: {
          userId,
          circleId: id
        }
      }
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Must be a member to post' });
    }
    
    const post = await prisma.circlePost.create({
      data: {
        content: content.trim(),
        authorId: userId,
        circleId: id
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create circle post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;