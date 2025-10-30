import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getSystemStats, getAllUsers } from '../controllers/adminController';
import { exportUserDataToPDF, exportUserDataToCSV } from '../services/exportService';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

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