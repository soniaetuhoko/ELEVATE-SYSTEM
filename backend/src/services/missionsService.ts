import { prisma } from '../db/prisma';
import { Mission } from '../types';

export const listMissions = async (userId: string): Promise<Mission[]> => {
  const missions = await prisma.mission.findMany({
    where: { userId },
    include: {
      projects: true,
      reflections: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    progress: mission.progress,
    status: mission.status.replace('InProgress', 'In Progress').replace('NearCompletion', 'Near Completion') as any,
    deadline: mission.deadline.toISOString().split('T')[0],
    projects: mission.projects.length,
    reflections: mission.reflections.length,
    category: mission.category.replace('SoftSkills', 'Soft Skills') as any,
    userId: mission.userId,
    createdAt: mission.createdAt.toISOString(),
    updatedAt: mission.updatedAt.toISOString(),
  }));
};

export const getMission = async (id: string, userId: string): Promise<Mission | null> => {
  const mission = await prisma.mission.findFirst({
    where: { id, userId },
    include: {
      projects: true,
      reflections: true,
    },
  });

  if (!mission) return null;

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    progress: mission.progress,
    status: mission.status.replace('InProgress', 'In Progress').replace('NearCompletion', 'Near Completion') as any,
    deadline: mission.deadline.toISOString().split('T')[0],
    projects: mission.projects.length,
    reflections: mission.reflections.length,
    category: mission.category.replace('SoftSkills', 'Soft Skills') as any,
    userId: mission.userId,
    createdAt: mission.createdAt.toISOString(),
    updatedAt: mission.updatedAt.toISOString(),
  };
};

export const createMission = async (data: {
  title: string;
  description: string;
  deadline: string;
  category?: string;
  userId: string;
}): Promise<Mission> => {
  const mission = await prisma.mission.create({
    data: {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline),
      category: data.category?.replace('Soft Skills', 'SoftSkills') as any || 'Technical',
      userId: data.userId,
    },
    include: {
      projects: true,
      reflections: true,
    },
  });

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    progress: mission.progress,
    status: mission.status.replace('InProgress', 'In Progress').replace('NearCompletion', 'Near Completion') as any,
    deadline: mission.deadline.toISOString().split('T')[0],
    projects: mission.projects.length,
    reflections: mission.reflections.length,
    category: mission.category.replace('SoftSkills', 'Soft Skills') as any,
    userId: mission.userId,
    createdAt: mission.createdAt.toISOString(),
    updatedAt: mission.updatedAt.toISOString(),
  };
};

export const updateMission = async (id: string, userId: string, data: Partial<Mission>): Promise<Mission | null> => {
  const mission = await prisma.mission.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      progress: data.progress,
      status: data.status?.replace('In Progress', 'InProgress').replace('Near Completion', 'NearCompletion') as any,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      category: data.category?.replace('Soft Skills', 'SoftSkills') as any,
    },
  });

  if (mission.count === 0) return null;

  return getMission(id, userId);
};

export const deleteMission = async (id: string, userId: string): Promise<boolean> => {
  const result = await prisma.mission.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
};
