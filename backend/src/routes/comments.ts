import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: Create a comment (staff/mentor only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - entityId
 *               - content
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [mission, project, reflection]
 *               entityId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', async (req: any, res) => {
  try {
    const { entityType, entityId, content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Only staff/mentors/admins can create comments
    if (userRole === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    // Validate entity type
    if (!['mission', 'project', 'reflection'].includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entity type'
      });
    }
    
    // Create comment data
    const commentData: any = {
      content,
      authorId: userId
    };
    
    if (entityType === 'mission') commentData.missionId = entityId;
    else if (entityType === 'project') commentData.projectId = entityId;
    else if (entityType === 'reflection') commentData.reflectionId = entityId;
    
    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      }
    });
    
    // Create notification for the item owner
    let itemOwner;
    if (entityType === 'mission') {
      itemOwner = await prisma.mission.findUnique({
        where: { id: entityId },
        select: { userId: true, title: true }
      });
    } else if (entityType === 'project') {
      itemOwner = await prisma.project.findUnique({
        where: { id: entityId },
        select: { userId: true, title: true }
      });
    } else if (entityType === 'reflection') {
      itemOwner = await prisma.reflection.findUnique({
        where: { id: entityId },
        select: { userId: true, title: true }
      });
    }
    
    if (itemOwner && itemOwner.userId !== userId) {
      await prisma.notification.create({
        data: {
          title: 'New Comment',
          message: `${req.user.name} commented on your ${entityType}: "${itemOwner.title}"`,
          type: 'comment',
          userId: itemOwner.userId,
          data: {
            commentId: comment.id,
            entityType,
            entityId
          }
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
});

/**
 * @openapi
 * /api/comments/{type}/{itemId}:
 *   get:
 *     summary: Get comments for an item
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mission, project, reflection]
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:type/:itemId', async (req: any, res) => {
  try {
    const { type, itemId } = req.params;
    
    // Validate type
    if (!['mission', 'project', 'reflection'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type'
      });
    }
    
    // Get comments for this item
    let whereClause: any = {};
    if (type === 'mission') whereClause.missionId = itemId;
    else if (type === 'project') whereClause.projectId = itemId;
    else if (type === 'reflection') whereClause.reflectionId = itemId;
    
    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments'
    });
  }
});

/**
 * @openapi
 * /api/comments/my/{type}/{itemId}:
 *   get:
 *     summary: Get comments on my work (student view)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mission, project, reflection]
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments on my work
 */
router.get('/my/:type/:itemId', async (req: any, res) => {
  try {
    const { type, itemId } = req.params;
    const userId = req.user.id;
    
    // First verify that the item belongs to the current user
    let item;
    if (type === 'mission') {
      item = await prisma.mission.findFirst({
        where: { id: itemId, userId }
      });
    } else if (type === 'project') {
      item = await prisma.project.findFirst({
        where: { id: itemId, userId }
      });
    } else if (type === 'reflection') {
      item = await prisma.reflection.findFirst({
        where: { id: itemId, userId }
      });
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found or not accessible' });
    }
    
    // Get comments for this item
    let whereClause: any = {};
    if (type === 'mission') whereClause.missionId = itemId;
    else if (type === 'project') whereClause.projectId = itemId;
    else if (type === 'reflection') whereClause.reflectionId = itemId;
    
    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get my comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;