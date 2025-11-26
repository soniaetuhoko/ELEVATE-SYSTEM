import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, AuthRequest } from '../../src/middlewares/auth';
import { verifyToken } from '../../src/utils/jwt';
import { getUserById } from '../../src/services/userService';

// Mock dependencies
jest.mock('../../src/utils/jwt');
jest.mock('../../src/services/userService');

const mockedVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockedGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      req.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        role: 'student' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockedVerifyToken.mockReturnValue({ userId: 'user123', role: 'student' });
      mockedGetUserById.mockResolvedValue(mockUser);

      await authenticate(req as any, res as Response, next);

      expect((req as AuthRequest).user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      await authenticate(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      req.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockedVerifyToken.mockReturnValue(null);

      await authenticate(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      req.headers = {
        authorization: 'Bearer valid-token',
      };

      mockedVerifyToken.mockReturnValue({ userId: 'user123', role: 'student' });
      mockedGetUserById.mockResolvedValue(null);

      await authenticate(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for correct role', () => {
      (req as AuthRequest).user = {
        id: 'user123',
        email: 'admin@alueducation.com',
        name: 'Admin',
        role: 'admin',
      };

      const middleware = requireRole(['admin']);
      middleware(req as any, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access for incorrect role', () => {
      (req as AuthRequest).user = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'Student',
        role: 'student',
      };

      const middleware = requireRole(['admin']);
      middleware(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when no user is present', () => {
      const middleware = requireRole(['admin']);
      middleware(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});