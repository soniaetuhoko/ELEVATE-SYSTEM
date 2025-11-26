import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target,
  Calendar,
  FolderKanban,
  BookOpen,
  Edit,
  X,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import apiService from '@/services/api';
import CommentsSection from '@/components/CommentsSection';
import type { Mission, Project, Reflection } from '@/types';

interface MissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  onEdit: (mission: Mission) => void;
}

export default function MissionDetailModal({ isOpen, onClose, mission, onEdit }: MissionDetailModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mission) {
      loadMissionData();
    }
  }, [isOpen, mission]);

  const loadMissionData = async () => {
    if (!mission) return;
    
    try {
      setIsLoading(true);
      const [projectsResponse, reflectionsResponse] = await Promise.all([
        apiService.getProjects(),
        apiService.getReflections()
      ]);
      
      // Filter projects and reflections for this mission
      const missionProjects = (projectsResponse.data || []).filter(p => p.missionId === mission.id);
      const missionReflections = (reflectionsResponse.data || []).filter(r => r.missionId === mission.id);
      
      setProjects(missionProjects);
      setReflections(missionReflections);
    } catch (error) {
      console.error('Failed to load mission data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mission) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-xl">{mission.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(mission)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge className={getStatusColor(mission.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(mission.status)}
                {mission.status}
              </span>
            </Badge>
            <Badge variant="outline">{mission.category}</Badge>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {formatDate(mission.deadline)}</span>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{mission.description}</p>
          </div>

          {/* Progress */}
          <div>
            <h3 className="font-semibold mb-3">Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{mission.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{reflections.length}</p>
                  <p className="text-xs text-muted-foreground">Reflections</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{mission.progress}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects ({projects.length})
            </h3>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No projects yet</div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{project.title}</CardTitle>
                        <Badge className={getStatusColor(project.status)} variant="outline">
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Progress: {project.progress}%</span>
                        <span>Due: {formatDate(project.dueDate)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reflections */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reflections ({reflections.length})
            </h3>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading reflections...</div>
            ) : reflections.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No reflections yet</div>
            ) : (
              <div className="space-y-3">
                {reflections.map((reflection) => (
                  <Card key={reflection.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{reflection.title}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-700">
                          Week {reflection.weekNumber || 1}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">
                        {reflection.content.substring(0, 150)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{reflection.content.split(' ').length} words</span>
                        </div>
                        <span>{formatDate(reflection.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Staff Comments */}
          <div>
            <CommentsSection 
              type="mission" 
              itemId={mission.id} 
              itemTitle={mission.title} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}