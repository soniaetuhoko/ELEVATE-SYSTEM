import { Router } from 'express';
import { login, sendOTP, verifyOTP } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { AuthSendSchema, AuthVerifySchema, LoginSchema } from '../models/schemas';

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication via login and registration with OTP
 */
const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, description: 'Any valid email address' }
 *               password: { type: string, description: 'User password' }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string, description: 'JWT token' }
 *                     user: { $ref: '#/components/schemas/Profile' }
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', validate(LoginSchema), login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register new user and send OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email, description: 'Any valid email address' }
 *               name: { type: string, description: 'Full name' }
 *               password: { type: string, minLength: 6, description: 'User password (minimum 6 characters)' }
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: 
 *                   type: object
 *                   properties:
 *                     email: { type: string }
 *       400:
 *         description: Invalid email or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', validate(AuthSendSchema), sendOTP);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, pattern: '^[0-9]{6}$', description: '6-digit OTP code' }
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/Profile' }
 *       400:
 *         description: Invalid OTP, expired OTP, or validation error
 *       500:
 *         description: Server error
 */
router.post('/verify-otp', validate(AuthVerifySchema), verifyOTP);

export default router;
