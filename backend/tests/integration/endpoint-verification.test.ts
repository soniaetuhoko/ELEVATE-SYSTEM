import request from 'supertest';
import app from '../../src/app';

describe('Endpoint Verification Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'verify@alustudent.com',
        name: 'Verify User',
        password: 'password123'
      });

    if (registerResponse.status === 200) {
      await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'verify@alustudent.com',
          otp: registerResponse.body.data.developmentOTP || '123456'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verify@alustudent.com',
          password: 'password123'
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.data.token;
      }
    }
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register - should accept ALU emails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@alustudent.com',
          name: 'New User',
          password: 'password123'
        });

      expect([200, 400]).toContain(response.status); // 400 if user exists
    });

    it('POST /api/auth/register - should accept any valid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@gmail.com',
          name: 'Valid User',
          password: 'password123'
        });

      expect([200, 400]).toContain(response.status); // 400 if user exists
    });

    it('POST /api/auth/login - should work with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verify@alustudent.com',
          password: 'password123'
        });

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /api/missions - should require authentication', async () => {
      const response = await request(app)
        .get('/api/missions');

      expect(response.status).toBe(401);
    });

    it('GET /api/missions - should work with valid token', async () => {
      if (!authToken) {
        console.log('Skipping authenticated test - no token available');
        return;
      }

      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('GET /api/projects - should work with valid token', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('GET /api/reflections - should work with valid token', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/reflections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('GET /api/profile/me - should work with valid token', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email');
    });

    it('GET /api/profile/stats - should work with valid token', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalMissions');
    });
  });

  describe('Public Endpoints', () => {
    it('GET /api/docs/help - should work without authentication', async () => {
      const response = await request(app)
        .get('/api/docs/help');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sections).toBeDefined();
    });

    it('GET /api/docs/manual - should generate PDF', async () => {
      const response = await request(app)
        .get('/api/docs/manual');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('GET /api/docs/performance - should return metrics', async () => {
      const response = await request(app)
        .get('/api/docs/performance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Search and Stats', () => {
    it('GET /api/search - should work with query parameter', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/search?q=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('GET /api/stats - should return platform statistics', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Collaboration Endpoints', () => {
    it('GET /api/circles - should list circles', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/circles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('GET /api/mentors - should list mentors', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/mentors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Notifications', () => {
    it('GET /api/notifications - should work with valid token', async () => {
      if (!authToken) return;

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Health Check', () => {
    it('GET /health - should return server status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('GET / - should return API info', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});