import { prisma } from '../db/prisma';
import { User } from '../types';

export const createUser = async (data: {
  email: string;
  name: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
}): Promise<User> => {
  const user = await prisma.user.create({
    data,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const getUserByEmail = async (email: string): Promise<(User & { password?: string }) | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    password: (user as any).password || undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const updateUserPassword = async (id: string, password: string): Promise<void> => {
  await prisma.user.update({
    where: { id },
    data: { password } as any,
  });
};