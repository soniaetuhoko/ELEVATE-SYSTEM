import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { searchAll } from '../services/searchService';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Search across all content
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResults'
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const userId = (req as any).user.id;
    const results = await searchAll(userId, q);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;