import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getUserRoleFromEmail } from '../utils/roleUtils';
import { generateOTP } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import { createUser, getUserByEmail, updateUserPassword } from '../services/userService';
import { sendOTPEmail } from '../utils/email';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic email validation (allow admin@admin.com for special admin account)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && email !== 'admin@admin.com') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please register first.'
      });
    }
    
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Account registration not completed. Please complete registration first.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    
    // Basic email validation (flexible for any email format)
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, name);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }
    
    // Store user data temporarily (in production, use Redis or similar)
    global.tempUsers = global.tempUsers || {};
    (global.tempUsers as any)[email] = { name, password, otp, timestamp: Date.now() };
    
    console.log(`OTP sent to ${email}: ${otp}`);

    // Always include OTP in response for testing/development
    const responseData: any = { email, developmentOTP: otp };

    res.json({
      success: true,
      message: `OTP sent! For testing purposes, your OTP is: ${otp}`,
      data: responseData
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    // Check temporary storage
    if (!global.tempUsers) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }
    
    const tempUser = global.tempUsers[email];
    if (!tempUser) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email. Please register again.'
      });
    }
    
    if (tempUser.otp !== otp) {
      // Show detailed error in development mode only
      const message = process.env.NODE_ENV !== 'production' 
        ? `Invalid OTP. Expected: ${tempUser.otp}, Received: ${otp}`
        : 'Invalid OTP. Please try again.';
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Check OTP expiry (5 minutes)
    if (Date.now() - tempUser.timestamp > 5 * 60 * 1000) {
      delete global.tempUsers[email];
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash((tempUser as any).password, 10);

    // Create user
    const role = getUserRoleFromEmail(email);
    const user = await createUser({
      email,
      name: tempUser.name,
      password: hashedPassword,
      role
    });

    // Clean up temporary storage
    if (global.tempUsers) {
      delete global.tempUsers[email];
    }

    res.json({
      success: true,
      message: 'Registration successful. Please login with your credentials.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};