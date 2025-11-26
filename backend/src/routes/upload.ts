import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { uploadProfile, uploadProject, uploadToCloudinary } from '../utils/upload';

/**
 * @openapi
 * tags:
 *   - name: Upload
 *     description: File upload endpoints
 */
const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/profile', uploadProfile.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(
      req.file.buffer, 
      'elevate/profiles',
      { 
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      }
    ) as any;
    
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * @openapi
 * /api/upload/project:
 *   post:
 *     summary: Upload project attachment
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/project', uploadProject.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadToCloudinary(
      req.file.buffer, 
      'elevate/projects'
    ) as any;
    
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Project upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;