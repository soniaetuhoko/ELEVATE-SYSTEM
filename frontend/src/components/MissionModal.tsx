import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    deadline: mission?.deadline || '',
    category: mission?.category || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Mission title is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        status: mission?.status || 'Planning',
        progress: mission?.progress || 0,
        projects: mission?.projects || 0,
        reflections: mission?.reflections || 0,
      });
      toast.success(mission ? 'Mission updated!' : 'Mission created!');
      onClose();
    } catch (error) {
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
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Technical, Business, Soft Skills"
              disabled={isLoading}
            />
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