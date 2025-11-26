import request from 'supertest';
import express from 'express';
import { login, sendOTP, verifyOTP } from '../../src/controllers/authController';
import { prisma } from '../../src/db/prisma';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.post('/login', login);
app.post('/register', sendOTP);
app.post('/verify-otp', verifyOTP);

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock email service
jest.mock('../../src/utils/email', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true),
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.tempUsers = {};
  });

  describe('POST /login', () => {
    it('should login successfully with valid ALU credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        role: 'student',
        password: 'hashedpassword',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'student@alustudent.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('student@alustudent.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should accept any valid email domain', async () => {
      const mockUser = {
        id: 'user123',
        email: 'user@gmail.com',
        name: 'John Doe',
        role: 'student',
        password: 'hashedpassword',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'user@gmail.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('user@gmail.com');
    });

    it('should reject invalid password', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        role: 'student',
        password: 'hashedpassword',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'student@alustudent.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /register', () => {
    it('should send OTP for valid ALU email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/register')
        .send({
          email: 'newstudent@alustudent.com',
          name: 'New Student',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
    });

    it('should accept any valid email for registration', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/register')
        .send({
          email: 'user@gmail.com',
          name: 'User',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
    });

    it('should reject existing user registration', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'Student',
        role: 'student',
        password: 'hashedpassword',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/register')
        .send({
          email: 'student@alustudent.com',
          name: 'Student',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /verify-otp', () => {
    it('should verify OTP and create user', async () => {
      global.tempUsers = {
        'student@alustudent.com': {
          name: 'Student',
          password: 'password123',
          otp: '123456',
          timestamp: Date.now(),
        } as any,
      };

      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'Student',
        role: 'student',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/verify-otp')
        .send({
          email: 'student@alustudent.com',
          otp: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration successful');
    });

    it('should reject invalid OTP', async () => {
      global.tempUsers = {
        'student@alustudent.com': {
          name: 'Student',
          password: 'password123',
          otp: '123456',
          timestamp: Date.now(),
        } as any,
      };

      const response = await request(app)
        .post('/verify-otp')
        .send({
          email: 'student@alustudent.com',
          otp: '654321',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid OTP');
    });
  });
});