import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FolderKanban,
  Calendar,
  ExternalLink,
  Github,
  Edit,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import CommentsSection from '@/components/CommentsSection';
import type { Project } from '@/types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit: (project: Project) => void;
}

export default function ProjectDetailModal({ isOpen, onClose, project, onEdit }: ProjectDetailModalProps) {
  if (!project) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Planning':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Planning':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">{project.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge className={getStatusColor(project.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(project.status)}
                {project.status}
              </span>
            </Badge>
            <span>Progress: {project.progress}%</span>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <h3 className="font-semibold mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Start Date</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.startDate)}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Due Date</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.repositoryUrl && (
              <div>
                <h3 className="font-semibold mb-2">Repository</h3>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => handleOpenUrl(project.repositoryUrl!)}
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </div>
            )}
            {project.liveUrl && (
              <div>
                <h3 className="font-semibold mb-2">Live Demo</h3>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => handleOpenUrl(project.liveUrl!)}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Site
                </Button>
              </div>
            )}
          </div>

          {/* Mission Link */}
          <div>
            <h3 className="font-semibold mb-2">Mission</h3>
            <p className="text-sm text-muted-foreground">
              This project is part of mission: <span className="text-blue-600 font-medium">{project.missionId}</span>
            </p>
          </div>

          {/* Staff Comments */}
          <div>
            <CommentsSection 
              type="project" 
              itemId={project.id} 
              itemTitle={project.title} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}