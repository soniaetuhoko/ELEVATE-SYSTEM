import { prisma } from '../db/prisma';

export const getProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId }
  });
};

export const updateProfile = async (userId: string, data: {
  name?: string;
  email?: string;
}) => {
  return await prisma.user.update({
    where: { id: userId },
    data
  });
};

export const getUserStats = async (userId: string) => {
  const [missions, projects, reflections] = await Promise.all([
    prisma.mission.findMany({ where: { userId } }),
    prisma.project.findMany({ where: { userId } }),
    prisma.reflection.findMany({ where: { userId } })
  ]);

  const completedMissions = missions.filter((m) => m.status === 'Completed').length;
  const inProgressMissions = missions.filter((m) => m.status === 'InProgress').length;
  const avgProgress = missions.length > 0 
    ? Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length)
    : 0;

  return {
    totalMissions: missions.length,
    missionsCompleted: completedMissions,
    inProgressMissions,
    avgProgress,
    projectsDone: projects.length,
    reflectionsWritten: reflections.length,
    learningStreak: 7 // Mock value
  };
};