import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import * as reflectionsController from '../controllers/reflectionsController';

/**
 * @openapi
 * tags:
 *   - name: Reflections
 *     description: Learning reflection endpoints
 */
const router = Router();

/**
 * @openapi
 * /api/reflections:
 *   get:
 *     summary: List user reflections
 *     tags: [Reflections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of reflections
 */
router.get('/', requireAuth, reflectionsController.list);

/**
 * @openapi
 * /api/reflections:
 *   post:
 *     summary: Create new reflection
 *     tags: [Reflections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               weekNumber: { type: integer }
 *               keyLearnings: { type: array, items: { type: string } }
 *               challenges: { type: array, items: { type: string } }
 *               improvements: { type: array, items: { type: string } }
 *               missionId: { type: string }
 *               projectId: { type: string }
 *     responses:
 *       201:
 *         description: Reflection created
 */
router.post('/', requireAuth, reflectionsController.create);

/**
 * @openapi
 * /api/reflections/{id}:
 *   get:
 *     summary: Get reflection by ID
 *     tags: [Reflections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reflection details
 *       404:
 *         description: Reflection not found
 */
router.get('/:id', requireAuth, reflectionsController.getById);

/**
 * @openapi
 * /api/reflections/{id}:
 *   put:
 *     summary: Update reflection
 *     tags: [Reflections]
 *     security:
 *       - bearerAuth: []
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
 *               content: { type: string }
 *               weekNumber: { type: integer }
 *     responses:
 *       200:
 *         description: Updated reflection
 *       404:
 *         description: Reflection not found
 */
router.put('/:id', requireAuth, reflectionsController.update);

/**
 * @openapi
 * /api/reflections/{id}:
 *   delete:
 *     summary: Delete reflection
 *     tags: [Reflections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Reflection deleted
 *       404:
 *         description: Reflection not found
 */
router.delete('/:id', requireAuth, reflectionsController.remove);

export default router;