import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import * as missionsController from '../controllers/missionsController';

/**
 * @openapi
 * tags:
 *   - name: Missions
 *     description: Mission management endpoints
 */
const router = Router();

/**
 * @openapi
 * /api/missions:
 *   get:
 *     summary: List user missions
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of missions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, missionsController.list);

/**
 * @openapi
 * /api/missions:
 *   post:
 *     summary: Create a mission
 *     tags: [Missions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MissionCreateInput'
 *     responses:
 *       201:
 *         description: Created mission
 */
router.post('/', requireAuth, missionsController.create);

/**
 * @openapi
 * /api/missions/{id}:
 *   get:
 *     summary: Get a mission by id
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mission'
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, missionsController.getById);

/**
 * @openapi
 * /api/missions/{id}:
 *   put:
 *     summary: Update a mission
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               progress: { type: integer, minimum: 0, maximum: 100 }
 *     responses:
 *       200:
 *         description: Updated mission
 *       404:
 *         description: Not found
 */
router.put('/:id', requireAuth, missionsController.update);

/**
 * @openapi
 * /api/missions/{id}:
 *   delete:
 *     summary: Delete a mission
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', requireAuth, missionsController.remove);

export default router;
