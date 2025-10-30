import { prisma } from '../db/prisma';
import { UserStats } from '../types';

export const getUserStats = async (userId: string): Promise<UserStats> => {
  const [missions, projects, reflections] = await Promise.all([
    prisma.mission.findMany({ where: { userId } }),
    prisma.project.findMany({ where: { userId } }),
    prisma.reflection.findMany({ where: { userId } }),
  ]);

  const completedMissions = missions.filter((m) => m.status === 'Completed').length;
  const inProgressMissions = missions.filter((m) => m.status === 'InProgress').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  
  const totalProgress = missions.reduce((sum, m) => sum + m.progress, 0);
  const avgProgress = missions.length > 0 ? Math.round(totalProgress / missions.length) : 0;

  // Calculate learning streak (simplified - last 7 days with reflections)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentReflections = reflections.filter((r) => r.createdAt >= sevenDaysAgo);
  const learningStreak = Math.min(recentReflections.length, 7);

  return {
    missionsCompleted: completedMissions,
    projectsDone: completedProjects,
    reflectionsWritten: reflections.length,
    learningStreak,
    totalMissions: missions.length,
    inProgressMissions,
    avgProgress,
  };
};