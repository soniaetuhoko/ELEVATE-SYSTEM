import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import * as projectsController from '../controllers/projectsController';

/**
 * @openapi
 * tags:
 *   - name: Projects
 *     description: Project management endpoints
 */
const router = Router();

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: List user projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', requireAuth, projectsController.list);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, missionId, startDate, dueDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               missionId: { type: string }
 *               startDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               repositoryUrl: { type: string, format: uri }
 *               liveUrl: { type: string, format: uri }
 *               technologies: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', requireAuth, projectsController.create);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/:id', requireAuth, projectsController.getById);

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
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
 *               description: { type: string }
 *               status: { type: string, enum: [Planning, InProgress, Completed] }
 *               progress: { type: integer, minimum: 0, maximum: 100 }
 *     responses:
 *       200:
 *         description: Updated project
 *       404:
 *         description: Project not found
 */
router.put('/:id', requireAuth, projectsController.update);

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete('/:id', requireAuth, projectsController.remove);

export default router;