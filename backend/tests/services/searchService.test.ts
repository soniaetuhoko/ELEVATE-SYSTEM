import { searchAll, getAnalytics } from '../../src/services/searchService';
import { prisma } from '../../src/db/prisma';

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchAll', () => {
    it('should search across missions, projects, and reflections', async () => {
      const mockMissions = [
        { id: 'mission1', title: 'Web Development', description: 'Learn web dev' },
      ];
      const mockProjects = [
        { id: 'project1', title: 'Portfolio Website', description: 'Build portfolio' },
      ];
      const mockReflections = [
        { id: 'reflection1', title: 'Learning Reflection', content: 'Today I learned...' },
      ];

      (prisma.mission.findMany as jest.Mock).mockResolvedValue(mockMissions);
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);
      (prisma.reflection.findMany as jest.Mock).mockResolvedValue(mockReflections);

      const result = await searchAll('user123', 'web');

      expect(result.missions).toEqual(mockMissions);
      expect(result.projects).toEqual(mockProjects);
      expect(result.reflections).toEqual(mockReflections);
      expect(result.total).toBe(3);
    });

    it('should return empty results when no matches found', async () => {
      (prisma.mission.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reflection.findMany as jest.Mock).mockResolvedValue([]);

      const result = await searchAll('user123', 'nonexistent');

      expect(result.missions).toEqual([]);
      expect(result.projects).toEqual([]);
      expect(result.reflections).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getAnalytics', () => {
    it('should return user analytics', async () => {
      const mockRecentActivity = [
        { id: 'mission1', title: 'Mission 1', updatedAt: new Date(), status: 'InProgress' },
      ];

      (prisma.mission.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalMissions
        .mockResolvedValueOnce(5); // completedMissions
      (prisma.project.count as jest.Mock)
        .mockResolvedValueOnce(8) // totalProjects
        .mockResolvedValueOnce(3); // completedProjects
      (prisma.reflection.count as jest.Mock).mockResolvedValue(15);
      (prisma.mission.findMany as jest.Mock).mockResolvedValue(mockRecentActivity);

      const result = await getAnalytics('user123');

      expect(result.overview.totalMissions).toBe(10);
      expect(result.overview.completedMissions).toBe(5);
      expect(result.overview.totalProjects).toBe(8);
      expect(result.overview.completedProjects).toBe(3);
      expect(result.overview.totalReflections).toBe(15);
      expect(result.overview.completionRate).toBe(50);
      expect(result.recentActivity).toEqual(mockRecentActivity);
    });

    it('should handle zero missions correctly', async () => {
      (prisma.mission.count as jest.Mock)
        .mockResolvedValueOnce(0) // totalMissions
        .mockResolvedValueOnce(0); // completedMissions
      (prisma.project.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (prisma.reflection.count as jest.Mock).mockResolvedValue(0);
      (prisma.mission.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAnalytics('user123');

      expect(result.overview.completionRate).toBe(0);
    });
  });
});