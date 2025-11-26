import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { ProfileUpdateSchema } from '../models/schemas';
import { getProfile, updateProfile, getStats } from '../controllers/profileController';

/**
 * @openapi
 * tags:
 *   - name: Profile
 *     description: User profile management endpoints
 */
const router = Router();

// All profile routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getProfile);

/**
 * @openapi
 * /api/profile/me:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               avatar: { type: string, format: uri }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me', validate(ProfileUpdateSchema), updateProfile);

/**
 * @openapi
 * /api/profile/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 missionsCompleted: { type: integer }
 *                 projectsDone: { type: integer }
 *                 reflectionsWritten: { type: integer }
 *                 learningStreak: { type: integer }
 *                 totalMissions: { type: integer }
 *                 inProgressMissions: { type: integer }
 *                 avgProgress: { type: number }
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /api/profile/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 */
router.get('/preferences', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { prisma } = require('../db/prisma');
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });
    
    res.json({
      success: true,
      data: preferences || {
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        mentorFeedback: true,
        deadlineReminders: true,
        collaborationUpdates: true
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
});

/**
 * @openapi
 * /api/profile/password:
 *   put:
 *     summary: Update user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/password', async (req: any, res) => {
  try {
    console.log('Password update request received');
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    const bcrypt = require('bcrypt');
    const { prisma } = require('../db/prisma');
    
    // Get current user
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, email: true, password: true }
    });
    
    if (!user || !user.password) {
      return res.status(404).json({
        success: false,
        message: 'User not found or password not set'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
    
    console.log('Password updated successfully for user:', userId);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
});

/**
 * @openapi
 * /api/profile/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications: { type: boolean }
 *               mentorFeedback: { type: boolean }
 *               deadlineReminders: { type: boolean }
 *               collaborationUpdates: { type: boolean }
 *     responses:
 *       200:
 *         description: Notification settings updated
 *       401:
 *         description: Unauthorized
 */
router.put('/notifications', async (req: any, res) => {
  try {
    const settings = req.body;
    const userId = req.user.id;
    const { prisma } = require('../db/prisma');
    
    // Update or create user preferences with notification settings
    await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        emailNotifications: settings.emailNotifications,
        mentorFeedback: settings.mentorFeedback,
        deadlineReminders: settings.deadlineReminders,
        collaborationUpdates: settings.collaborationUpdates
      },
      create: {
        userId,
        emailNotifications: settings.emailNotifications,
        mentorFeedback: settings.mentorFeedback,
        deadlineReminders: settings.deadlineReminders,
        collaborationUpdates: settings.collaborationUpdates
      }
    });
    
    // Send confirmation email if email notifications are enabled
    if (settings.emailNotifications) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const emailjs = require('@emailjs/nodejs');
        
        try {
          await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            'template_notifications',
            {
              to_email: user.email,
              to_name: user.name,
              message: 'Your notification settings have been updated successfully.'
            },
            {
              publicKey: process.env.EMAILJS_PUBLIC_KEY,
              privateKey: process.env.EMAILJS_PRIVATE_KEY
            }
          );
        } catch (emailError) {
          console.error('Email notification error:', emailError);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
});

/**
 * @openapi
 * /api/profile/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme: { type: string, enum: [light, dark, system] }
 *               language: { type: string, enum: [en, fr] }
 *               timezone: { type: string }
 *     responses:
 *       200:
 *         description: Preferences updated
 *       401:
 *         description: Unauthorized
 */
router.put('/preferences', async (req: any, res) => {
  try {
    const preferences = req.body;
    const userId = req.user.id;
    const { prisma } = require('../db/prisma');
    
    // Update or create user preferences
    await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language: preferences.language || 'en',
        timezone: preferences.timezone || 'UTC'
      },
      create: {
        userId,
        language: preferences.language || 'en',
        timezone: preferences.timezone || 'UTC'
      }
    });
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

export default router;
