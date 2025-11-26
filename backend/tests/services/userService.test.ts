import { createUser, getUserByEmail, getUserById, updateUser } from '../../src/services/userService';
import { prisma } from '../../src/db/prisma';

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        password: 'hashedpassword',
        role: 'student',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await createUser({
        email: 'student@alustudent.com',
        name: 'John Doe',
        password: 'hashedpassword',
        role: 'student',
      });

      expect(result.id).toBe('user123');
      expect(result.email).toBe('student@alustudent.com');
      expect(result.name).toBe('John Doe');
      expect(result.role).toBe('student');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        password: 'hashedpassword',
        role: 'student',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByEmail('student@alustudent.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('student@alustudent.com');
      expect(result?.password).toBe('hashedpassword');
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserByEmail('nonexistent@alustudent.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Doe',
        password: 'hashedpassword',
        role: 'student',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById('user123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user123');
      expect(result?.email).toBe('student@alustudent.com');
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: 'user123',
        email: 'student@alustudent.com',
        name: 'John Updated',
        password: 'hashedpassword',
        role: 'student',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user123', { name: 'John Updated' });

      expect(result).toBeDefined();
      expect(result?.name).toBe('John Updated');
    });
  });
});