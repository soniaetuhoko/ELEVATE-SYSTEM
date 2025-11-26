import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen,
  Calendar,
  TrendingUp,
  Edit,
  X
} from 'lucide-react';
import CommentsSection from '@/components/CommentsSection';
import type { Reflection } from '@/types';

interface ReflectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: Reflection | null;
  onEdit: (reflection: Reflection) => void;
}

export default function ReflectionDetailModal({ isOpen, onClose, reflection, onEdit }: ReflectionDetailModalProps) {
  if (!reflection) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">{reflection.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(reflection)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(reflection.createdAt)}</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              Week {reflection.weekNumber || 1}
            </Badge>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{reflection.content.split(' ').length} words</span>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Main Content */}
          <div>
            <h3 className="font-semibold mb-3">Reflection Content</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {reflection.content}
              </p>
            </div>
          </div>

          {/* Key Learnings */}
          {reflection.keyLearnings && reflection.keyLearnings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Key Learnings</h3>
              <ul className="space-y-2">
                {reflection.keyLearnings.map((learning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{learning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {reflection.challenges && reflection.challenges.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Challenges Faced</h3>
              <ul className="space-y-2">
                {reflection.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {reflection.improvements && reflection.improvements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Areas for Improvement</h3>
              <ul className="space-y-2">
                {reflection.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Staff Comments */}
          <div>
            <CommentsSection 
              type="reflection" 
              itemId={reflection.id} 
              itemTitle={reflection.title} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}