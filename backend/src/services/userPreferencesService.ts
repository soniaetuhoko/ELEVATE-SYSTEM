import { prisma } from '../db/prisma';

export const getUserPreferences = async (userId: string) => {
  let preferences = await prisma.userPreferences.findUnique({
    where: { userId }
  });

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.userPreferences.create({
      data: { userId }
    });
  }

  return preferences;
};

export const updateOnboardingStatus = async (userId: string, completed: boolean) => {
  return await prisma.userPreferences.upsert({
    where: { userId },
    update: { onboardingCompleted: completed },
    create: { userId, onboardingCompleted: completed }
  });
};

export const updateHelpPreferences = async (userId: string, data: {
  helpTooltipsEnabled?: boolean;
  lastHelpAccessed?: Date;
  preferredHelpSection?: string;
}) => {
  return await prisma.userPreferences.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data }
  });
};