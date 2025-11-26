import request from 'supertest';
import express from 'express';
import { list, create, getById, update, remove } from '../../src/controllers/missionsController';
import { prisma } from '../../src/db/prisma';

const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, res, next) => {
  req.user = { id: 'user123', email: 'student@alustudent.com', name: 'Student', role: 'student' };
  next();
});

app.get('/missions', list);
app.post('/missions', create);
app.get('/missions/:id', getById);
app.put('/missions/:id', update);
app.delete('/missions/:id', remove);

describe('Missions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /missions', () => {
    it('should return user missions', async () => {
      const mockMissions = [
        {
          id: 'mission1',
          title: 'Web Development',
          description: 'Learn web development',
          progress: 50,
          status: 'InProgress',
          deadline: new Date('2024-12-31'),
          category: 'Technical',
          userId: 'user123',
          projects: [],
          reflections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.mission.findMany as jest.Mock).mockResolvedValue(mockMissions);

      const response = await request(app).get('/missions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Web Development');
    });
  });

  describe('POST /missions', () => {
    it('should create a new mission', async () => {
      const mockMission = {
        id: 'mission1',
        title: 'New Mission',
        description: 'Mission description',
        progress: 0,
        status: 'Planning',
        deadline: new Date('2024-12-31'),
        category: 'Technical',
        userId: 'user123',
        projects: [],
        reflections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mission.create as jest.Mock).mockResolvedValue(mockMission);

      const response = await request(app)
        .post('/missions')
        .send({
          title: 'New Mission',
          description: 'Mission description',
          deadline: '2024-12-31',
          category: 'Technical',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Mission');
    });
  });

  describe('GET /missions/:id', () => {
    it('should return mission by id', async () => {
      const mockMission = {
        id: 'mission1',
        title: 'Mission 1',
        description: 'Description',
        progress: 75,
        status: 'InProgress',
        deadline: new Date('2024-12-31'),
        category: 'Technical',
        userId: 'user123',
        projects: [],
        reflections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mission.findFirst as jest.Mock).mockResolvedValue(mockMission);

      const response = await request(app).get('/missions/mission1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('mission1');
    });

    it('should return 404 for non-existent mission', async () => {
      (prisma.mission.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/missions/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Mission not found');
    });
  });

  describe('PUT /missions/:id', () => {
    it('should update mission', async () => {
      const mockUpdatedMission = {
        id: 'mission1',
        title: 'Updated Mission',
        description: 'Updated description',
        progress: 80,
        status: 'InProgress',
        deadline: new Date('2024-12-31'),
        category: 'Technical',
        userId: 'user123',
        projects: [],
        reflections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mission.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.mission.findFirst as jest.Mock).mockResolvedValue(mockUpdatedMission);

      const response = await request(app)
        .put('/missions/mission1')
        .send({
          title: 'Updated Mission',
          progress: 80,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Mission');
    });
  });

  describe('DELETE /missions/:id', () => {
    it('should delete mission', async () => {
      (prisma.mission.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app).delete('/missions/mission1');

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent mission', async () => {
      (prisma.mission.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const response = await request(app).delete('/missions/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});