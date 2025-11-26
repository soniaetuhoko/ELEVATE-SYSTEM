import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import * as collaborationsController from '../controllers/collaborationsController';

/**
 * @openapi
 * tags:
 *   - name: Collaborations
 *     description: Collaboration and circle management endpoints
 */
const router = Router();

/**
 * @openapi
 * /api/collaborations:
 *   get:
 *     summary: List collaboration circles
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of circles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Circle'
 */
router.get('/', requireAuth, collaborationsController.list);

/**
 * @openapi
 * /api/collaborations/{id}/join:
 *   post:
 *     summary: Join a collaboration circle
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Circle ID
 *     responses:
 *       200:
 *         description: Successfully joined circle
 *       404:
 *         description: Circle not found
 */
router.post('/:id/join', requireAuth, collaborationsController.join);

/**
 * @openapi
 * /api/collaborations/{id}/leave:
 *   post:
 *     summary: Leave a collaboration circle
 *     tags: [Collaborations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Circle ID
 *     responses:
 *       200:
 *         description: Successfully left circle
 *       404:
 *         description: Circle not found
 */
router.post('/:id/leave', requireAuth, collaborationsController.leave);

export default router;