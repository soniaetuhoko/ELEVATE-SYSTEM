import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/db/prisma';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let missionId: string;
  let projectId: string;
  let reflectionId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.reflection.deleteMany();
    await prisma.project.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.reflection.deleteMany();
    await prisma.project.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@alustudent.com',
          name: 'Test Student',
          password: 'password123'
        });

      expect(registerResponse.status).toBe(200);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.developmentOTP).toBeDefined();

      // Step 2: Verify OTP
      const verifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          email: 'test@alustudent.com',
          otp: registerResponse.body.data.developmentOTP
        });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      userId = verifyResponse.body.data.user.id;

      // Step 3: Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@alustudent.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
      authToken = loginResponse.body.data.token;
    });

    it('should reject non-ALU email domains', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@gmail.com',
          name: 'Test User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ALU email address');
    });
  });

  describe('Mission Management', () => {
    it('should create, read, update, and delete missions', async () => {
      // Create mission
      const createResponse = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Mission',
          description: 'A test mission for integration testing',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Technical'
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      missionId = createResponse.body.data.id;

      // Read missions
      const readResponse = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toHaveLength(1);
      expect(readResponse.body.data[0].title).toBe('Test Mission');

      // Update mission
      const updateResponse = await request(app)
        .put(`/api/missions/${missionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Mission',
          progress: 50
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Test Mission');
      expect(updateResponse.body.data.progress).toBe(50);

      // Get single mission
      const getSingleResponse = await request(app)
        .get(`/api/missions/${missionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getSingleResponse.status).toBe(200);
      expect(getSingleResponse.body.data.title).toBe('Updated Test Mission');
    });
  });

  describe('Project Management', () => {
    it('should create, read, update, and delete projects', async () => {
      // Create project
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project',
          description: 'A test project for integration testing',
          missionId: missionId,
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          technologies: ['JavaScript', 'Node.js']
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      projectId = createResponse.body.data.id;

      // Read projects
      const readResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data).toHaveLength(1);
      expect(readResponse.body.data[0].title).toBe('Test Project');

      // Update project
      const updateResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Project',
          progress: 75,
          status: 'InProgress'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Test Project');
      expect(updateResponse.body.data.progress).toBe(75);
    });
  });

  describe('Profile Management', () => {
    it('should get and update user profile', async () => {
      // Get profile
      const getResponse = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.email).toBe('test@alustudent.com');
      expect(getResponse.body.data.name).toBe('Test Student');

      // Update profile
      const updateResponse = await request(app)
        .put('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Student'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Updated Test Student');

      // Get user stats
      const statsResponse = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.data.totalMissions).toBe(1);
      expect(statsResponse.body.data.projectsDone).toBe(1);
    });
  });

  describe('Search and Platform Stats', () => {
    it('should search across content and get platform stats', async () => {
      // Search
      const searchResponse = await request(app)
        .get('/api/search?q=test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);

      // Platform stats
      const statsResponse = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.success).toBe(true);
    });
  });

  describe('Documentation Endpoints', () => {
    it('should provide help content and performance metrics', async () => {
      // Get help content
      const helpResponse = await request(app)
        .get('/api/docs/help');

      expect(helpResponse.status).toBe(200);
      expect(helpResponse.body.success).toBe(true);
      expect(helpResponse.body.data.sections).toBeDefined();

      // Get performance metrics
      const perfResponse = await request(app)
        .get('/api/docs/performance');

      expect(perfResponse.status).toBe(200);
      expect(perfResponse.body.success).toBe(true);

      // Get user preferences
      const prefsResponse = await request(app)
        .get('/api/docs/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(prefsResponse.status).toBe(200);
      expect(prefsResponse.body.success).toBe(true);

      // Mark onboarding complete
      const onboardingResponse = await request(app)
        .post('/api/docs/onboarding')
        .set('Authorization', `Bearer ${authToken}`);

      expect(onboardingResponse.status).toBe(200);
      expect(onboardingResponse.body.success).toBe(true);
    });

    it('should generate PDF manual', async () => {
      const response = await request(app)
        .get('/api/docs/manual');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('Collaboration Features', () => {
    it('should list circles and mentors', async () => {
      // Get circles
      const circlesResponse = await request(app)
        .get('/api/circles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(circlesResponse.status).toBe(200);
      expect(circlesResponse.body.success).toBe(true);

      // Get mentors
      const mentorsResponse = await request(app)
        .get('/api/mentors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(mentorsResponse.status).toBe(200);
      expect(mentorsResponse.body.success).toBe(true);
    });
  });

  describe('Authorization Tests', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/missions');

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/missions')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Cleanup Operations', () => {
    it('should delete created resources', async () => {
      // Delete project
      const deleteProjectResponse = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteProjectResponse.status).toBe(200);

      // Delete mission
      const deleteMissionResponse = await request(app)
        .delete(`/api/missions/${missionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteMissionResponse.status).toBe(200);

      // Verify deletions
      const missionsResponse = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(missionsResponse.body.data).toHaveLength(0);
    });
  });
});