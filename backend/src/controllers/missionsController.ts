import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createMission, deleteMission, getMission, listMissions, updateMission } from '../services/missionsService';

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const missions = await listMissions(req.user!.id);
    res.json({
      success: true,
      data: missions
    });
  } catch (error) {
    console.error('List missions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch missions'
    });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, deadline, category } = req.body;
    const mission = await createMission({
      title,
      description,
      deadline,
      category,
      userId: req.user!.id
    });
    res.status(201).json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mission'
    });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mission = await getMission(id, req.user!.id);
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    res.json({
      success: true,
      data: mission
    });
  } catch (error) {
    console.error('Get mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mission'
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateMission(id, req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mission'
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMission(id, req.user!.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Delete mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete mission'
    });
  }
};
