import { prisma } from '../db/prisma';

export const listCircles = async () => {
  return await prisma.circle.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const getCircle = async (id: string) => {
  return await prisma.circle.findUnique({
    where: { id }
  });
};

export const createCircle = async (data: {
  name: string;
  description: string;
  category?: string;
}) => {
  return await prisma.circle.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category as any || 'Technical'
    }
  });
};

export const updateCircle = async (id: string, data: any) => {
  return await prisma.circle.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      category: data.category as any
    }
  });
};

export const deleteCircle = async (id: string) => {
  const circle = await prisma.circle.findUnique({ where: { id } });
  if (!circle) return false;
  
  await prisma.circle.delete({ where: { id } });
  return true;
};