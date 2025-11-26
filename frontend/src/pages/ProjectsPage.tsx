import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProjectModal from '@/components/ProjectModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import apiService from '@/services/api';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await apiService.createProject(projectData);
    loadProjects();
  };

  const handleUpdateProject = async (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      await apiService.updateProject(editingProject.id, projectData);
      loadProjects();
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        // Optimistically update UI first
        setProjects(prev => prev.filter(project => project.id !== id));
        
        // Then make API call
        await apiService.deleteProject(id);
        toast.success('Deleted');
      } catch (error) {
        console.error('Delete project error:', error);
        toast.error('Failed to delete project');
        // Reload projects to restore state if API call failed
        loadProjects();
      }
    }
  };

  const openCreateModal = () => {
    setEditingProject(undefined);
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const openViewModal = (project: Project) => {
    setViewingProject(project);
    setShowDetailModal(true);
  };

  const handleEditFromView = (project: Project) => {
    setShowDetailModal(false);
    setEditingProject(project);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return CheckCircle2;
      case 'In Progress':
        return Clock;
      case 'Planning':
        return Calendar;
      default:
        return FolderKanban;
    }
  };

  const filterProjects = (status?: string) => {
    let filtered = projects;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your learning projects and track progress
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({projects.filter(p => p.status === 'In Progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({projects.filter(p => p.status === 'Completed').length})
            </TabsTrigger>
            <TabsTrigger value="planning">
              Planning ({projects.filter(p => p.status === 'Planning').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterProjects().map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FolderKanban className="h-5 w-5 text-blue-600" />
                        <CardTitle>{project.title}</CardTitle>
                        <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                          {(() => {
                            const StatusIcon = getStatusIcon(project.status);
                            return <StatusIcon className="h-3 w-3" />;
                          })()}
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mission Link */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LinkIcon className="h-4 w-4" />
                    <span>Linked to: <span className="text-blue-600 font-medium">{project.missionId}</span></span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Due: {project.dueDate}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openViewModal(project)}>
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openEditModal(project)}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {filterProjects('In Progress').map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterProjects('Completed').map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            {filterProjects('Planning').map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {project.title}
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        project={editingProject}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
      />
      
      <ProjectDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        project={viewingProject}
        onEdit={handleEditFromView}
      />
    </Layout>
  );
}