import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { listCircles } from '../services/collaborationsService';
import { prisma } from '../db/prisma';

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const circles = await listCircles();
    res.json({
      success: true,
      data: circles
    });
  } catch (error) {
    console.error('List circles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch circles'
    });
  }
};

export const join = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if circle exists
    const circle = await prisma.circle.findUnique({ where: { id } });
    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Circle not found'
      });
    }
    
    // Check if already joined (using AdminLog as membership table)
    const existing = await prisma.adminLog.findFirst({
      where: {
        action: `joined_circle_${id}`,
        details: { contains: userId }
      }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this circle'
      });
    }
    
    // Add membership record
    await prisma.adminLog.create({
      data: {
        action: `joined_circle_${id}`,
        details: `User ${userId} joined circle ${circle.name}`,
        userId
      }
    });
    
    res.json({
      success: true,
      message: 'Joined circle successfully'
    });
  } catch (error) {
    console.error('Join circle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join circle'
    });
  }
};

export const leave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Remove membership record
    await prisma.adminLog.deleteMany({
      where: {
        action: `joined_circle_${id}`,
        details: { contains: userId }
      }
    });
    
    res.json({
      success: true,
      message: 'Left circle successfully'
    });
  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave circle'
    });
  }
};