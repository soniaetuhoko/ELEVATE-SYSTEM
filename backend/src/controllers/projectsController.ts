import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../services/projectsService';

export const list = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await listProjects(req.user!.id);
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const project = await createProject({
      ...req.body,
      userId: req.user!.id
    });
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const project = await getProject(id, req.user!.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project'
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateProject(id, req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProject(id, req.user!.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};