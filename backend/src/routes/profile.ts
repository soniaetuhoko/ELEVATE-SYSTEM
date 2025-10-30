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

export default router;
