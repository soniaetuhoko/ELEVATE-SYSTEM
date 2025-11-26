import { prisma } from '../db/prisma';

export const listReflections = async (userId: string) => {
  const reflections = await prisma.reflection.findMany({
    where: { userId },
    include: {
      mission: true,
      project: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return reflections.map((reflection) => ({
    id: reflection.id,
    title: reflection.title,
    content: reflection.content,
    excerpt: reflection.content.substring(0, 150) + '...',
    missionId: reflection.missionId || '',
    date: reflection.createdAt.toISOString().split('T')[0],
    wordCount: reflection.content.split(' ').length,
    mood: 'Productive' as any, // Default mood
    tags: reflection.keyLearnings || [],
    userId: reflection.userId,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  }));
};

export const getReflection = async (id: string, userId: string) => {
  const reflection = await prisma.reflection.findFirst({
    where: { id, userId },
    include: {
      mission: true,
      project: true
    }
  });

  if (!reflection) return null;

  return {
    id: reflection.id,
    title: reflection.title,
    content: reflection.content,
    excerpt: reflection.content.substring(0, 150) + '...',
    missionId: reflection.missionId || '',
    date: reflection.createdAt.toISOString().split('T')[0],
    wordCount: reflection.content.split(' ').length,
    mood: 'Productive' as any,
    tags: reflection.keyLearnings || [],
    userId: reflection.userId,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  };
};

export const createReflection = async (data: {
  title: string;
  content: string;
  weekNumber?: number;
  keyLearnings?: string[];
  challenges?: string[];
  improvements?: string[];
  missionId?: string;
  projectId?: string;
  userId: string;
}) => {
  const reflection = await prisma.reflection.create({
    data,
    include: {
      mission: true,
      project: true
    }
  });

  return {
    id: reflection.id,
    title: reflection.title,
    content: reflection.content,
    excerpt: reflection.content.substring(0, 150) + '...',
    missionId: reflection.missionId || '',
    date: reflection.createdAt.toISOString().split('T')[0],
    wordCount: reflection.content.split(' ').length,
    mood: 'Productive' as any,
    tags: reflection.keyLearnings || [],
    userId: reflection.userId,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  };
};

export const updateReflection = async (id: string, userId: string, data: Partial<{
  title: string;
  content: string;
  weekNumber: number;
  keyLearnings: string[];
  challenges: string[];
  improvements: string[];
  missionId: string;
  projectId: string;
}>) => {
  const reflection = await prisma.reflection.update({
    where: { id },
    data,
    include: {
      mission: true,
      project: true
    }
  });

  return {
    id: reflection.id,
    title: reflection.title,
    content: reflection.content,
    excerpt: reflection.content.substring(0, 150) + '...',
    missionId: reflection.missionId || '',
    date: reflection.createdAt.toISOString().split('T')[0],
    wordCount: reflection.content.split(' ').length,
    mood: 'Productive' as any,
    tags: reflection.keyLearnings || [],
    userId: reflection.userId,
    createdAt: reflection.createdAt.toISOString(),
    updatedAt: reflection.updatedAt.toISOString(),
  };
};

export const deleteReflection = async (id: string, userId: string) => {
  const reflection = await prisma.reflection.findFirst({
    where: { id, userId }
  });
  if (!reflection) return false;
  
  await prisma.reflection.delete({ where: { id } });
  return true;
};