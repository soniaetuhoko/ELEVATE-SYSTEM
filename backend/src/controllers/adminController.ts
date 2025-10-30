import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { prisma } from '../db/prisma';

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [
      totalUsers,
      totalMissions,
      totalProjects,
      totalReflections,
      activeUsers,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.mission.count(),
      prisma.project.count(),
      prisma.reflection.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalMissions,
          totalProjects,
          totalReflections,
          activeUsers
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics'
    });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            missions: true,
            projects: true,
            reflections: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};