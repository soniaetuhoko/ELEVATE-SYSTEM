import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createReflection, deleteReflection, getReflection, listReflections, updateReflection } from '../services/reflectionsService';

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const reflections = await listReflections(req.user!.id);
    res.json({
      success: true,
      data: reflections
    });
  } catch (error) {
    console.error('List reflections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reflections'
    });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const reflection = await createReflection({
      ...req.body,
      userId: req.user!.id
    });
    res.status(201).json({
      success: true,
      data: reflection
    });
  } catch (error) {
    console.error('Create reflection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reflection'
    });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reflection = await getReflection(id, req.user!.id);
    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }
    res.json({
      success: true,
      data: reflection
    });
  } catch (error) {
    console.error('Get reflection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reflection'
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateReflection(id, req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reflection'
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteReflection(id, req.user!.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reflection'
    });
  }
};