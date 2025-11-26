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
        AND: [
          { email: { endsWith: '@alueducation.com' } },
          { role: { not: 'admin' } }
        ]
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

/**
 * @openapi
 * /api/mentors/{id}/request:
 *   post:
 *     summary: Request mentorship from a mentor
 *     tags: [Mentors]
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
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Mentorship request sent
 */
router.post('/:id/request', async (req: any, res) => {
  try {
    const { id: mentorId } = req.params;
    const { message } = req.body;
    const studentId = req.user.id;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Check if mentor exists and is valid
    const mentor = await prisma.user.findFirst({
      where: {
        id: mentorId,
        email: { endsWith: '@alueducation.com' },
        role: { not: 'admin' }
      }
    });
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });
    
    // Create notification for mentor
    await prisma.notification.create({
      data: {
        title: 'New Mentorship Request',
        message: `${student?.name} has requested mentorship: "${message.trim()}"`,
        type: 'mentorship_request',
        userId: mentorId,
        data: {
          studentId,
          studentName: student?.name,
          studentEmail: student?.email,
          requestMessage: message.trim()
        }
      }
    });
    
    // Create notification for student (confirmation)
    await prisma.notification.create({
      data: {
        title: 'Mentorship Request Sent',
        message: `Your mentorship request has been sent to ${mentor.name}. They will contact you soon.`,
        type: 'mentorship_confirmation',
        userId: studentId,
        data: {
          mentorId,
          mentorName: mentor.name,
          mentorEmail: mentor.email
        }
      }
    });
    
    // Send email notification if available
    try {
      const emailjs = require('@emailjs/nodejs');
      
      // Email to mentor
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        'template_mentorship',
        {
          to_email: mentor.email,
          to_name: mentor.name,
          student_name: student?.name,
          student_email: student?.email,
          message: message.trim(),
          subject: 'New Mentorship Request - ELEVATE Platform'
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY
        }
      );
      
      // Email to student (confirmation)
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        'template_confirmation',
        {
          to_email: student?.email,
          to_name: student?.name,
          mentor_name: mentor.name,
          message: `Your mentorship request has been sent to ${mentor.name}. They will contact you soon.`,
          subject: 'Mentorship Request Sent - ELEVATE Platform'
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
      message: 'Mentorship request sent successfully'
    });
  } catch (error) {
    console.error('Request mentorship error:', error);
    res.status(500).json({ error: 'Failed to send mentorship request' });
  }
});

export default router;