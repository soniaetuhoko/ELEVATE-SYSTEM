import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getUserById, updateUser } from '../services/userService';
import { getUserStats } from '../services/statsService';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateUser(req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getUserStats(req.user!.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};