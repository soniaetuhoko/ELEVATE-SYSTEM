import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/db/prisma';

describe('Frontend-Backend Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Clean up and create test user
    await prisma.reflection.deleteMany();
    await prisma.project.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();

    // Register and login user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'frontend@alustudent.com',
        name: 'Frontend Test User',
        password: 'password123'
      });

    await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'frontend@alustudent.com',
        otp: registerResponse.body.data.developmentOTP
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'frontend@alustudent.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await prisma.reflection.deleteMany();
    await prisma.project.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Dashboard Data Loading', () => {
    it('should load all dashboard data successfully', async () => {
      // Test user stats endpoint (used by dashboard)
      const userStatsResponse = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(userStatsResponse.status).toBe(200);
      expect(userStatsResponse.body.data).toHaveProperty('totalMissions');
      expect(userStatsResponse.body.data).toHaveProperty('missionsCompleted');
      expect(userStatsResponse.body.data).toHaveProperty('projectsDone');
      expect(userStatsResponse.body.data).toHaveProperty('reflectionsWritten');

      // Test platform stats endpoint (used by dashboard)
      const platformStatsResponse = await request(app)
        .get('/api/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(platformStatsResponse.status).toBe(200);
      expect(platformStatsResponse.body.data).toHaveProperty('activeStudents');
      expect(platformStatsResponse.body.data).toHaveProperty('missionsCompleted');
      expect(platformStatsResponse.body.data).toHaveProperty('projectsCreated');
      expect(platformStatsResponse.body.data).toHaveProperty('successRate');
    });
  });

  describe('Missions Page Integration', () => {
    let missionId: string;

    it('should handle complete mission lifecycle from frontend perspective', async () => {
      // Create mission (MissionsPage.tsx -> apiService.createMission)
      const createResponse = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Frontend Integration Mission',
          description: 'Testing frontend-backend integration',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Technical'
        });

      expect(createResponse.status).toBe(201);
      missionId = createResponse.body.data.id;

      // List missions (MissionsPage.tsx -> apiService.getMissions)
      const listResponse = await request(app)
        .get('/api/missions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].title).toBe('Frontend Integration Mission');

      // Update mission (MissionsPage.tsx -> apiService.updateMission)
      const updateResponse = await request(app)
        .put(`/api/missions/${missionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Frontend Mission',
          progress: 75
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Frontend Mission');
      expect(updateResponse.body.data.progress).toBe(75);

      // Delete mission (MissionsPage.tsx -> apiService.deleteMission)
      const deleteResponse = await request(app)
        .delete(`/api/missions/${missionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('Projects Page Integration', () => {
    let missionId: string;
    let projectId: string;

    beforeAll(async () => {
      // Create a mission first for project linking
      const missionResponse = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Project Test Mission',
          description: 'Mission for project testing',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Technical'
        });
      missionId = missionResponse.body.data.id;
    });

    it('should handle complete project lifecycle from frontend perspective', async () => {
      // Create project (ProjectsPage.tsx -> apiService.createProject)
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Frontend Integration Project',
          description: 'Testing project frontend-backend integration',
          missionId: missionId,
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          technologies: ['React', 'TypeScript', 'Node.js']
        });

      expect(createResponse.status).toBe(201);
      projectId = createResponse.body.data.id;

      // List projects (ProjectsPage.tsx -> apiService.getProjects)
      const listResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].title).toBe('Frontend Integration Project');
      expect(listResponse.body.data[0].technologies).toContain('React');

      // Update project (ProjectsPage.tsx -> apiService.updateProject)
      const updateResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Frontend Project',
          progress: 60,
          status: 'InProgress'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Frontend Project');
      expect(updateResponse.body.data.progress).toBe(60);
    });
  });

  describe('Reflections Page Integration', () => {
    let missionId: string;
    let reflectionId: string;

    beforeAll(async () => {
      // Create a mission for reflection linking
      const missionResponse = await request(app)
        .post('/api/missions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Reflection Test Mission',
          description: 'Mission for reflection testing',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'SoftSkills'
        });
      missionId = missionResponse.body.data.id;
    });

    it('should handle complete reflection lifecycle from frontend perspective', async () => {
      // Create reflection (ReflectionsPage.tsx -> apiService.createReflection)
      const createResponse = await request(app)
        .post('/api/reflections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Frontend Integration Reflection',
          content: 'This reflection tests the integration between frontend and backend systems. I learned about API testing and how to ensure data flows correctly between React components and Express endpoints.',
          weekNumber: 1,
          keyLearnings: ['API Integration', 'Testing Strategies', 'Error Handling'],
          challenges: ['Async Data Loading', 'State Management'],
          improvements: ['Better Error Messages', 'Loading States'],
          missionId: missionId
        });

      expect(createResponse.status).toBe(201);
      reflectionId = createResponse.body.data.id;

      // List reflections (ReflectionsPage.tsx -> apiService.getReflections)
      const listResponse = await request(app)
        .get('/api/reflections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].title).toBe('Frontend Integration Reflection');
      expect(listResponse.body.data[0].keyLearnings).toContain('API Integration');

      // Update reflection (ReflectionsPage.tsx -> apiService.updateReflection)
      const updateResponse = await request(app)
        .put(`/api/reflections/${reflectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Frontend Reflection',
          content: 'Updated content with more insights about the integration process.'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated Frontend Reflection');
    });
  });

  describe('Collaboration Page Integration', () => {
    it('should load collaboration data successfully', async () => {
      // Get circles (CollaborationPage.tsx -> apiService.getCircles)
      const circlesResponse = await request(app)
        .get('/api/circles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(circlesResponse.status).toBe(200);
      expect(circlesResponse.body.success).toBe(true);

      // Get mentors (CollaborationPage.tsx -> apiService.getMentors)
      const mentorsResponse = await request(app)
        .get('/api/mentors')
        .set('Authorization', `Bearer ${authToken}`);

      expect(mentorsResponse.status).toBe(200);
      expect(mentorsResponse.body.success).toBe(true);
      expect(Array.isArray(mentorsResponse.body.data)).toBe(true);
    });
  });

  describe('Profile Page Integration', () => {
    it('should handle profile operations from frontend perspective', async () => {
      // Get profile (ProfilePage.tsx -> apiService.getProfile)
      const getResponse = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.email).toBe('frontend@alustudent.com');
      expect(getResponse.body.data.name).toBe('Frontend Test User');

      // Update profile (ProfilePage.tsx -> apiService.updateProfile)
      const updateResponse = await request(app)
        .put('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Frontend User'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Updated Frontend User');
    });
  });

  describe('Search Integration', () => {
    it('should handle search from frontend perspective', async () => {
      // Search (Layout.tsx -> apiService.search)
      const searchResponse = await request(app)
        .get('/api/search?q=frontend')
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toHaveProperty('total');
    });
  });

  describe('Notifications Integration', () => {
    it('should handle notifications from frontend perspective', async () => {
      // Get notifications (Layout.tsx -> apiService.getNotifications)
      const notificationsResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(notificationsResponse.status).toBe(200);
      expect(notificationsResponse.body.success).toBe(true);
      expect(Array.isArray(notificationsResponse.body.data)).toBe(true);
    });
  });

  describe('Documentation Integration', () => {
    it('should handle documentation endpoints from frontend perspective', async () => {
      // Get help content (HelpModal.tsx -> fetch('/api/docs/help'))
      const helpResponse = await request(app)
        .get('/api/docs/help');

      expect(helpResponse.status).toBe(200);
      expect(helpResponse.body.success).toBe(true);
      expect(helpResponse.body.data.sections).toBeDefined();
      expect(Array.isArray(helpResponse.body.data.sections)).toBe(true);

      // Get user preferences (DashboardPage.tsx -> fetch('/api/docs/preferences'))
      const prefsResponse = await request(app)
        .get('/api/docs/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(prefsResponse.status).toBe(200);
      expect(prefsResponse.body.success).toBe(true);
      expect(prefsResponse.body.data).toHaveProperty('onboardingCompleted');

      // Complete onboarding (OnboardingTour.tsx -> fetch('/api/docs/onboarding'))
      const onboardingResponse = await request(app)
        .post('/api/docs/onboarding')
        .set('Authorization', `Bearer ${authToken}`);

      expect(onboardingResponse.status).toBe(200);
      expect(onboardingResponse.body.success).toBe(true);

      // Download PDF manual (HelpModal.tsx -> fetch('/api/docs/manual'))
      const manualResponse = await request(app)
        .get('/api/docs/manual');

      expect(manualResponse.status).toBe(200);
      expect(manualResponse.headers['content-type']).toBe('application/pdf');
    });
  });
});