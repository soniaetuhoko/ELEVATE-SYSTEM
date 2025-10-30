import { prisma } from '../db/prisma';

export const listProjects = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status.replace('InProgress', 'In Progress') as any,
    missionId: project.missionId,
    progress: project.progress,
    startDate: project.startDate.toISOString().split('T')[0],
    dueDate: project.dueDate.toISOString().split('T')[0],
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    technologies: project.technologies,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
};

export const getProject = async (id: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { mission: true },
  });

  if (!project) return null;

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status.replace('InProgress', 'In Progress') as any,
    missionId: project.missionId,
    progress: project.progress,
    startDate: project.startDate.toISOString().split('T')[0],
    dueDate: project.dueDate.toISOString().split('T')[0],
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    technologies: project.technologies,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
};

export const createProject = async (data: {
  title: string;
  description: string;
  missionId: string;
  startDate: string;
  dueDate: string;
  repositoryUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  userId: string;
}) => {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      missionId: data.missionId,
      startDate: new Date(data.startDate),
      dueDate: new Date(data.dueDate),
      repositoryUrl: data.repositoryUrl,
      liveUrl: data.liveUrl,
      technologies: data.technologies || [],
      userId: data.userId,
    },
    include: { mission: true },
  });

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status.replace('InProgress', 'In Progress') as any,
    missionId: project.missionId,
    progress: project.progress,
    startDate: project.startDate.toISOString().split('T')[0],
    dueDate: project.dueDate.toISOString().split('T')[0],
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    technologies: project.technologies,
    userId: project.userId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
};

export const updateProject = async (id: string, userId: string, data: any) => {
  const project = await prisma.project.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status?.replace('In Progress', 'InProgress') as any,
      progress: data.progress,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      repositoryUrl: data.repositoryUrl,
      liveUrl: data.liveUrl,
      technologies: data.technologies,
    },
  });

  if (project.count === 0) return null;
  return getProject(id, userId);
};

export const deleteProject = async (id: string, userId: string): Promise<boolean> => {
  const result = await prisma.project.deleteMany({
    where: { id, userId },
  });

  return result.count > 0;
};