import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getSystemStats, getAllUsers } from '../controllers/adminController';
import { exportUserDataToPDF, exportUserDataToCSV } from '../services/exportService';
import { prisma } from '../db/prisma';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// User management endpoints
/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [student, mentor, admin] }
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/users', async (req, res) => {
  try {
    const { name, email, role = 'student' } = req.body;
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: 'temp123' // Temporary password
      }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (Admin only)
 *     tags: [Admin]
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
 *         description: User details with statistics
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        missions: { orderBy: { createdAt: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        reflections: { orderBy: { createdAt: 'desc' } },
        _count: {
          select: {
            missions: true,
            projects: true,
            reflections: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user information (Admin only)
 *     tags: [Admin]
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
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               role: { type: string, enum: [student, mentor, admin] }
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Circles management endpoints
/**
 * @openapi
 * /api/admin/circles:
 *   get:
 *     summary: Get all circles (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all circles with statistics
 */
router.get('/circles', async (req, res) => {
  try {
    const circles = await prisma.circle.findMany({
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
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
    
    res.json({ success: true, data: circles });
  } catch (error) {
    console.error('Get all circles error:', error);
    res.status(500).json({ error: 'Failed to fetch circles' });
  }
});

/**
 * @openapi
 * /api/admin/circles:
 *   post:
 *     summary: Create a new circle (Admin only)
 *     tags: [Admin]
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
 *     responses:
 *       201:
 *         description: Circle created successfully
 */
router.post('/circles', async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = (req as any).user.id;
    
    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        createdBy: adminId
      },
      include: {
        _count: {
          select: {
            memberships: true,
            posts: true
          }
        }
      }
    });
    
    res.json({ success: true, data: circle });
  } catch (error) {
    console.error('Create circle error:', error);
    res.status(500).json({ error: 'Failed to create circle' });
  }
});

/**
 * @openapi
 * /api/admin/circles/{id}:
 *   delete:
 *     summary: Delete a circle (Admin only)
 *     tags: [Admin]
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
 *         description: Circle deleted successfully
 */
router.delete('/circles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStats'
 */
router.get('/stats', getSystemStats);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', getAllUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
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
 *         description: User deleted successfully
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [student, mentor, admin] }
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Content management endpoints
router.get('/missions', async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: missions });
  } catch (error) {
    console.error('Get all missions error:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

router.delete('/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.mission.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete mission error:', error);
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.project.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

router.get('/reflections', async (req, res) => {
  try {
    const reflections = await prisma.reflection.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: reflections });
  } catch (error) {
    console.error('Get all reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

router.delete('/reflections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.reflection.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ error: 'Failed to delete reflection' });
  }
});

/**
 * @openapi
 * /api/admin/export/pdf:
 *   get:
 *     summary: Export data as PDF
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/pdf', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const pdf = await exportUserDataToPDF(userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=elevate-data.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

/**
 * @openapi
 * /api/admin/export/csv:
 *   get:
 *     summary: Export data as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export/csv', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const csv = await exportUserDataToCSV(userId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=elevate-data.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;