import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import apiService from '@/services/api';
import type { Project, Mission } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSave: (project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function ProjectModal({ isOpen, onClose, project, onSave }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    missionId: project?.missionId || '',
    status: project?.status || 'Planning',
    progress: project?.progress || 0,
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    dueDate: project?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    repositoryUrl: project?.repositoryUrl || '',
    liveUrl: project?.liveUrl || '',
    technologies: project?.technologies?.join(', ') || '',
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMissions, setLoadingMissions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMissions();
      // Reset form when opening
      setFormData({
        title: project?.title || '',
        description: project?.description || '',
        missionId: project?.missionId || '',
        status: project?.status || 'Planning',
        progress: project?.progress || 0,
        startDate: project?.startDate || new Date().toISOString().split('T')[0],
        dueDate: project?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        repositoryUrl: project?.repositoryUrl || '',
        liveUrl: project?.liveUrl || '',
        technologies: project?.technologies?.join(', ') || '',
      });
    }
  }, [isOpen, project]);

  const loadMissions = async () => {
    try {
      setLoadingMissions(true);
      const response = await apiService.getMissions();
      setMissions(response.data || []);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoadingMissions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Project description is required');
      return;
    }
    
    if (!formData.startDate || !formData.dueDate) {
      toast.error('Start date and due date are required');
      return;
    }

    setIsLoading(true);
    try {
      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map((t: string) => t.trim()).filter(Boolean),
        status: formData.status,
        progress: Number(formData.progress) || 0, // Ensure progress is a number
      };
      
      console.log('Saving project with data:', projectData); // Debug log
      
      await onSave(projectData);
      toast.success(project ? 'Updated' : 'Created');
      onClose();
    } catch (error) {
      console.error('Save project error:', error);
      toast.error('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update your project details' : 'Add a new project to your portfolio'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., E-commerce Platform"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your project"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Select value={formData.missionId} onValueChange={(value) => setFormData(prev => ({ ...prev, missionId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={loadingMissions ? "Loading missions..." : "Select a mission"} />
              </SelectTrigger>
              <SelectContent>
                {missions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
              placeholder="React, Node.js, MongoDB (comma separated)"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">Repository URL</Label>
            <Input
              id="repositoryUrl"
              type="url"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
              placeholder="https://github.com/username/project"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              type="url"
              value={formData.liveUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
              placeholder="https://project.vercel.app"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                project ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}