import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Reflection } from '@/types';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection?: Reflection;
  onSave: (reflection: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function ReflectionModal({ isOpen, onClose, reflection, onSave }: ReflectionModalProps) {
  const [formData, setFormData] = useState({
    title: reflection?.title || '',
    content: reflection?.content || '',
    missionId: reflection?.missionId || undefined,
    projectId: reflection?.projectId || undefined,
    weekNumber: reflection?.weekNumber || 1,
    keyLearnings: reflection?.keyLearnings?.join('\n') || '',
    challenges: reflection?.challenges?.join('\n') || '',
    improvements: reflection?.improvements?.join('\n') || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Reflection title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Reflection content is required');
      return;
    }

    setIsLoading(true);
    try {
      const reflectionData = {
        ...formData,
        keyLearnings: formData.keyLearnings.split('\n').filter(Boolean),
        challenges: formData.challenges.split('\n').filter(Boolean),
        improvements: formData.improvements.split('\n').filter(Boolean),
      };
      
      // Remove null missionId and projectId to avoid backend issues
      const cleanData = { ...reflectionData };
      if (!cleanData.missionId) {
        const { missionId, ...rest } = cleanData;
        Object.assign(cleanData, rest);
      }
      if (!cleanData.projectId) {
        const { projectId, ...rest } = cleanData;
        Object.assign(cleanData, rest);
      }
      
      await onSave(cleanData);
      toast.success(reflection ? 'Updated' : 'Created');
      onClose();
    } catch (error) {
      toast.error('Failed to save reflection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reflection ? 'Edit Reflection' : 'Create New Reflection'}</DialogTitle>
          <DialogDescription>
            {reflection ? 'Update your reflection' : 'Document your learning journey and insights'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Reflection Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Week 3 - React Fundamentals"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weekNumber">Week Number</Label>
            <Input
              id="weekNumber"
              type="number"
              min="1"
              value={formData.weekNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, weekNumber: parseInt(e.target.value) || 1 }))}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Main Content</Label>
            <Textarea
              id="content"
              className="min-h-[120px]"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, experiences, and insights from this week..."
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keyLearnings">Key Learnings (one per line)</Label>
            <Textarea
              id="keyLearnings"
              className="min-h-[80px]"
              value={formData.keyLearnings}
              onChange={(e) => setFormData(prev => ({ ...prev, keyLearnings: e.target.value }))}
              placeholder="Understanding React hooks&#10;Importance of component composition&#10;State management patterns"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges Faced (one per line)</Label>
            <Textarea
              id="challenges"
              className="min-h-[80px]"
              value={formData.challenges}
              onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
              placeholder="Debugging async operations&#10;Understanding useEffect dependencies&#10;Managing complex state"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="improvements">Areas for Improvement (one per line)</Label>
            <Textarea
              id="improvements"
              className="min-h-[80px]"
              value={formData.improvements}
              onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
              placeholder="Practice more with custom hooks&#10;Learn advanced TypeScript patterns&#10;Improve testing skills"
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
                reflection ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}