import { Router } from 'express';
import { requireAuth, requireMentor } from '../middlewares/auth';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);
router.use(requireMentor);

/**
 * @openapi
 * /api/staff/students:
 *   get:
 *     summary: Get all students (staff only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { 
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            missions: true,
            projects: true,
            reflections: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const studentsWithStats = students.map(student => ({
      ...student,
      missions: student._count.missions,
      projects: student._count.projects,
      reflections: student._count.reflections
    }));
    
    res.json({
      success: true,
      data: studentsWithStats
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * @openapi
 * /api/staff/stats:
 *   get:
 *     summary: Get staff statistics
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff statistics
 */
router.get('/stats', async (req: any, res) => {
  try {
    const staffId = req.user.id;
    
    // Get total students
    const totalStudents = await prisma.user.count({
      where: { role: 'student' }
    });
    
    // Get mentorship requests for this staff member
    const mentorshipRequests = await prisma.notification.count({
      where: {
        userId: staffId,
        type: 'mentorship_request',
        read: false
      }
    });
    
    // Calculate staff rating (average from student feedback)
    const ratings = await prisma.notification.findMany({
      where: {
        userId: staffId,
        type: 'mentor_rating'
      },
      select: {
        data: true
      }
    });
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((acc, rating) => acc + (rating.data as any)?.rating || 0, 0) / ratings.length
      : 4.5; // Default rating
    
    // Calculate participation score based on activities
    const acceptedRequests = await prisma.notification.count({
      where: {
        userId: staffId,
        type: 'mentorship_accepted'
      }
    });
    
    const participationScore = Math.min(
      (acceptedRequests * 20) + (avgRating * 10) + (mentorshipRequests * 5),
      100
    );
    
    res.json({
      success: true,
      data: {
        totalStudents,
        mentorshipRequests,
        myRating: avgRating,
        participationScore: Math.round(participationScore)
      }
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Failed to fetch staff statistics' });
  }
});

/**
 * @openapi
 * /api/staff/mentorship-requests:
 *   get:
 *     summary: Get mentorship requests for staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentorship requests
 */
router.get('/mentorship-requests', async (req: any, res) => {
  try {
    const staffId = req.user.id;
    
    const requests = await prisma.notification.findMany({
      where: {
        userId: staffId,
        type: 'mentorship_request',
        read: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedRequests = requests.map(request => ({
      id: request.id,
      studentId: (request.data as any)?.studentId,
      studentName: (request.data as any)?.studentName,
      studentEmail: (request.data as any)?.studentEmail,
      message: (request.data as any)?.requestMessage,
      createdAt: request.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Get mentorship requests error:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship requests' });
  }
});

/**
 * @openapi
 * /api/staff/mentorship-requests/{id}/accept:
 *   post:
 *     summary: Accept mentorship request
 *     tags: [Staff]
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
 *         description: Request accepted
 */
router.post('/mentorship-requests/:id/accept', async (req: any, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    
    // Get the original request
    const request = await prisma.notification.findFirst({
      where: {
        id,
        userId: staffId,
        type: 'mentorship_request'
      }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const requestData = request.data as any;
    
    // Mark original request as read
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    
    // Create acceptance notification for student
    await prisma.notification.create({
      data: {
        title: 'Mentorship Request Accepted',
        message: `${req.user.name} has accepted your mentorship request! They will contact you soon.`,
        type: 'mentorship_accepted',
        userId: requestData.studentId,
        data: {
          mentorId: staffId,
          mentorName: req.user.name,
          mentorEmail: req.user.email
        }
      }
    });
    
    // Send email notification
    try {
      const emailjs = require('@emailjs/nodejs');
      
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        'template_confirmation',
        {
          to_email: requestData.studentEmail,
          to_name: requestData.studentName,
          mentor_name: req.user.name,
          message: `Great news! ${req.user.name} has accepted your mentorship request. They will contact you soon to discuss next steps.`,
          subject: 'Mentorship Request Accepted - ELEVATE Platform'
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY
        }
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Mentorship request accepted'
    });
  } catch (error) {
    console.error('Accept mentorship error:', error);
    res.status(500).json({ error: 'Failed to accept mentorship request' });
  }
});

/**
 * @openapi
 * /api/staff/mentorship-requests/{id}/decline:
 *   post:
 *     summary: Decline mentorship request
 *     tags: [Staff]
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
 *         description: Request declined
 */
router.post('/mentorship-requests/:id/decline', async (req: any, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    
    // Get the original request
    const request = await prisma.notification.findFirst({
      where: {
        id,
        userId: staffId,
        type: 'mentorship_request'
      }
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const requestData = request.data as any;
    
    // Mark original request as read
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    
    // Create decline notification for student
    await prisma.notification.create({
      data: {
        title: 'Mentorship Request Update',
        message: `${req.user.name} is currently unavailable for new mentorship. Please try reaching out to other mentors.`,
        type: 'mentorship_declined',
        userId: requestData.studentId,
        data: {
          mentorId: staffId,
          mentorName: req.user.name
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Mentorship request declined'
    });
  } catch (error) {
    console.error('Decline mentorship error:', error);
    res.status(500).json({ error: 'Failed to decline mentorship request' });
  }
});

/**
 * @openapi
 * /api/staff/missions:
 *   get:
 *     summary: Get all student missions (staff view)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student missions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mission'
 */
router.get('/missions', async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      where: {
        user: { role: 'student' }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: missions });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

/**
 * @openapi
 * /api/staff/projects:
 *   get:
 *     summary: Get all student projects (staff view)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        user: { role: 'student' }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * @openapi
 * /api/staff/reflections:
 *   get:
 *     summary: Get all student reflections (staff view)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student reflections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReflectionComplete'
 */
router.get('/reflections', async (req, res) => {
  try {
    const reflections = await prisma.reflection.findMany({
      where: {
        user: { role: 'student' }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: reflections });
  } catch (error) {
    console.error('Get reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

/**
 * @openapi
 * /api/staff/comments:
 *   post:
 *     summary: Add comment to student work
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, type, itemId]
 *             properties:
 *               content: { type: string }
 *               type: { type: string, enum: [mission, project, reflection] }
 *               itemId: { type: string }
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/comments', async (req: any, res) => {
  try {
    const { content, type, itemId } = req.body;
    const staffId = req.user.id;
    
    if (!content || !type || !itemId) {
      return res.status(400).json({ error: 'Content, type, and itemId are required' });
    }
    
    // Validate that the item exists and belongs to a student
    let item;
    let studentId;
    
    if (type === 'mission') {
      item = await prisma.mission.findFirst({
        where: { id: itemId, user: { role: 'student' } },
        include: { user: true }
      });
      studentId = item?.userId;
    } else if (type === 'project') {
      item = await prisma.project.findFirst({
        where: { id: itemId, user: { role: 'student' } },
        include: { user: true }
      });
      studentId = item?.userId;
    } else if (type === 'reflection') {
      item = await prisma.reflection.findFirst({
        where: { id: itemId, user: { role: 'student' } },
        include: { user: true }
      });
      studentId = item?.userId;
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found or not accessible' });
    }
    
    // Create comment
    const commentData: any = {
      content: content.trim(),
      authorId: staffId
    };
    
    if (type === 'mission') commentData.missionId = itemId;
    else if (type === 'project') commentData.projectId = itemId;
    else if (type === 'reflection') commentData.reflectionId = itemId;
    
    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    });
    
    // Create notification for student
    await prisma.notification.create({
      data: {
        title: 'New Comment from Staff',
        message: `${req.user.name} commented on your ${type}: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
        type: 'staff_comment',
        userId: studentId!,
        data: {
          commentId: comment.id,
          staffId,
          staffName: req.user.name,
          itemType: type,
          itemId,
          itemTitle: item.title
        }
      }
    });
    
    // Send email notification
    try {
      const emailjs = require('@emailjs/nodejs');
      
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        'template_confirmation',
        {
          to_email: item.user.email,
          to_name: item.user.name,
          mentor_name: req.user.name,
          message: `${req.user.name} has commented on your ${type} "${item.title}": ${content}`,
          subject: `New Comment on Your ${type.charAt(0).toUpperCase() + type.slice(1)} - ELEVATE Platform`
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY
        }
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * @openapi
 * /api/staff/comments/{type}/{itemId}:
 *   get:
 *     summary: Get comments for a specific item
 *     tags: [Staff]
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
router.get('/comments/:type/:itemId', async (req, res) => {
  try {
    const { type, itemId } = req.params;
    
    let whereClause: any = {};
    if (type === 'mission') whereClause.missionId = itemId;
    else if (type === 'project') whereClause.projectId = itemId;
    else if (type === 'reflection') whereClause.reflectionId = itemId;
    else return res.status(400).json({ error: 'Invalid type' });
    
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
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

export default router;