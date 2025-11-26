import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/db/prisma';

describe('Admin Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.userPreferences.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminRegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@alueducation.com',
        name: 'Test Admin',
        password: 'password123'
      });

    await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'admin@alueducation.com',
        otp: adminRegisterResponse.body.data.developmentOTP
      });

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@alueducation.com',
        password: 'password123'
      });

    adminToken = adminLoginResponse.body.data.token;

    // Create student user
    const studentRegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student@alustudent.com',
        name: 'Test Student',
        password: 'password123'
      });

    await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'student@alustudent.com',
        otp: studentRegisterResponse.body.data.developmentOTP
      });

    const studentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@alustudent.com',
        password: 'password123'
      });

    studentToken = studentLoginResponse.body.data.token;
  });

  afterAll(async () => {
    await prisma.userPreferences.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Admin Statistics', () => {
    it('should get system statistics for admin', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.overview.totalUsers).toBeGreaterThanOrEqual(2);
      expect(response.body.data.recentUsers).toBeDefined();
    });

    it('should reject non-admin access to stats', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Admin access required');
    });
  });

  describe('User Management', () => {
    it('should list all users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).toHaveProperty('role');
      expect(response.body.data[0]).toHaveProperty('_count');
    });

    it('should reject non-admin access to user list', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Admin access required');
    });
  });

  describe('Data Export', () => {
    it('should export data as PDF for admin', async () => {
      const response = await request(app)
        .get('/api/admin/export/pdf')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('elevate-data.pdf');
    });

    it('should export data as CSV for admin', async () => {
      const response = await request(app)
        .get('/api/admin/export/csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv');
      expect(response.headers['content-disposition']).toContain('elevate-data.csv');
    });

    it('should reject non-admin access to exports', async () => {
      const pdfResponse = await request(app)
        .get('/api/admin/export/pdf')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(pdfResponse.status).toBe(403);

      const csvResponse = await request(app)
        .get('/api/admin/export/csv')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(csvResponse.status).toBe(403);
    });
  });
});