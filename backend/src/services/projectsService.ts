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
  missionId?: string;
  status?: string;
  progress?: number;
  startDate: string;
  dueDate: string;
  repositoryUrl?: string;
  liveUrl?: string;
  technologies?: string[];
  userId: string;
}) => {
  console.log('Creating project with data:', data); // Debug log
  // Create a default mission if none provided
  let missionId = data.missionId;
  if (!missionId) {
    const defaultMission = await prisma.mission.create({
      data: {
        title: `Mission for ${data.title}`,
        description: `Auto-generated mission for project: ${data.title}`,
        deadline: new Date(data.dueDate),
        category: 'Technical',
        userId: data.userId,
      },
    });
    missionId = defaultMission.id;
  }
  
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      missionId: missionId,
      status: data.status?.replace('In Progress', 'InProgress') as any || 'Planning',
      progress: Number(data.progress) || 0,
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
  console.log('Updating project with data:', { id, userId, data }); // Debug log
  
  const updateData = {
    title: data.title,
    description: data.description,
    status: data.status?.replace('In Progress', 'InProgress') as any,
    progress: Number(data.progress) || 0, // Ensure progress is a number
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    repositoryUrl: data.repositoryUrl,
    liveUrl: data.liveUrl,
    technologies: data.technologies,
  };
  
  console.log('Update data prepared:', updateData); // Debug log
  
  const project = await prisma.project.updateMany({
    where: { id, userId },
    data: updateData,
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