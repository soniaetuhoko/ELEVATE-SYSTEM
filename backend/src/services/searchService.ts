import { prisma } from '../db/prisma';

export const searchAll = async (userId: string, query: string) => {
  const searchTerm = `%${query}%`;
  
  const [missions, projects, reflections] = await Promise.all([
    prisma.mission.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    }),
    prisma.project.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    }),
    prisma.reflection.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    })
  ]);

  return {
    missions,
    projects,
    reflections,
    total: missions.length + projects.length + reflections.length
  };
};

export const getAnalytics = async (userId: string) => {
  const [
    totalMissions,
    completedMissions,
    totalProjects,
    completedProjects,
    totalReflections,
    recentActivity
  ] = await Promise.all([
    prisma.mission.count({ where: { userId } }),
    prisma.mission.count({ where: { userId, status: 'Completed' } }),
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: 'Completed' } }),
    prisma.reflection.count({ where: { userId } }),
    prisma.mission.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, updatedAt: true, status: true }
    })
  ]);

  return {
    overview: {
      totalMissions,
      completedMissions,
      totalProjects,
      completedProjects,
      totalReflections,
      completionRate: totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0
    },
    recentActivity
  };
};