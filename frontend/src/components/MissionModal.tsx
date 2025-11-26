import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Mission } from '@/types';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission?: Mission;
  onSave: (mission: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function MissionModal({ isOpen, onClose, mission, onSave }: MissionModalProps) {
  const [formData, setFormData] = useState({
    title: mission?.title || '',
    description: mission?.description || '',
    deadline: mission?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: mission?.category || 'Technical',
    status: mission?.status || 'Planning',
    progress: mission?.progress || 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: mission?.title || '',
        description: mission?.description || '',
        deadline: mission?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: mission?.category || 'Technical',
        status: mission?.status || 'Planning',
        progress: mission?.progress || 0,
      });
    }
  }, [isOpen, mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Mission title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Mission description is required');
      return;
    }
    
    if (!formData.deadline) {
      toast.error('Mission deadline is required');
      return;
    }

    setIsLoading(true);
    try {
      const missionData = {
        ...formData,
        status: formData.status,
        progress: Number(formData.progress) || 0, // Ensure progress is a number
        projects: mission?.projects || 0,
        reflections: mission?.reflections || 0,
      };
      
      console.log('Saving mission with data:', missionData); // Debug log
      
      await onSave(missionData);
      toast.success(mission ? 'Updated' : 'Created');
      onClose();
    } catch (error) {
      console.error('Save mission error:', error);
      toast.error('Failed to save mission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mission ? 'Edit Mission' : 'Create New Mission'}</DialogTitle>
          <DialogDescription>
            {mission ? 'Update your mission details' : 'Add a new learning mission to track your progress'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Mission Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Web Development Mastery"
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
              placeholder="Brief description of your mission"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Soft Skills">Soft Skills</SelectItem>
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
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
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
                mission ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}