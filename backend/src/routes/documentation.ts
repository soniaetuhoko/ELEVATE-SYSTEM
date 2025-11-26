import { Router } from 'express';
import { generateUserManualPDF, getHelpContent } from '../services/documentationService';
import { getPerformanceMetrics } from '../middlewares/monitoring';
import { getUserPreferences, updateOnboardingStatus, updateHelpPreferences } from '../services/userPreferencesService';
import { requireAuth } from '../middlewares/auth';

const router = Router();

/**
 * @openapi
 * /api/docs/manual:
 *   get:
 *     summary: Download user manual PDF
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: PDF user manual
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/manual', async (req, res) => {
  try {
    const pdf = await generateUserManualPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=elevate-user-manual.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate user manual' });
  }
});

/**
 * @openapi
 * /api/docs/help:
 *   get:
 *     summary: Get in-app help content
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Help content sections
 */
router.get('/help', (req, res) => {
  try {
    const helpContent = getHelpContent();
    res.json({
      success: true,
      data: helpContent
    });
  } catch (error) {
    console.error('Help content error:', error);
    res.status(500).json({ error: 'Failed to fetch help content' });
  }
});

/**
 * @openapi
 * /api/docs/performance:
 *   get:
 *     summary: Get system performance metrics
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/performance', (req, res) => {
  try {
    const metrics = getPerformanceMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

/**
 * @openapi
 * /api/docs/preferences:
 *   get:
 *     summary: Get user preferences for onboarding and help
 *     tags: [Documentation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 */
router.get('/preferences', requireAuth, async (req: any, res) => {
  try {
    const preferences = await getUserPreferences(req.user.id);
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * @openapi
 * /api/docs/onboarding:
 *   post:
 *     summary: Mark onboarding as completed
 *     tags: [Documentation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status updated
 */
router.post('/onboarding', requireAuth, async (req: any, res) => {
  try {
    await updateOnboardingStatus(req.user.id, true);
    res.json({
      success: true,
      message: 'Onboarding completed'
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ error: 'Failed to update onboarding status' });
  }
});

export default router;