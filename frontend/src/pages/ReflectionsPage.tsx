import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react';
import Layout from '@/components/Layout';
import ReflectionModal from '@/components/ReflectionModal';
import ReflectionDetailModal from '@/components/ReflectionDetailModal';
import apiService from '@/services/api';
import type { Reflection } from '@/types';

export default function ReflectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | undefined>();
  const [viewingReflection, setViewingReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getReflections();
      setReflections(response.data || []);
    } catch (error) {
      toast.error('Failed to load reflections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReflection = async (reflectionData: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await apiService.createReflection(reflectionData);
    loadReflections();
  };

  const handleUpdateReflection = async (reflectionData: Omit<Reflection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingReflection) {
      await apiService.updateReflection(editingReflection.id, reflectionData);
      loadReflections();
    }
  };

  const handleDeleteReflection = async (id: string) => {
    if (confirm('Are you sure you want to delete this reflection?')) {
      try {
        // Optimistically update UI first
        setReflections(prev => prev.filter(reflection => reflection.id !== id));
        
        // Then make API call
        await apiService.deleteReflection(id);
        toast.success('Deleted');
      } catch (error) {
        console.error('Delete reflection error:', error);
        toast.error('Failed to delete reflection');
        // Reload reflections to restore state if API call failed
        loadReflections();
      }
    }
  };

  const openCreateModal = () => {
    setEditingReflection(undefined);
    setShowModal(true);
  };

  const openEditModal = (reflection: Reflection) => {
    setEditingReflection(reflection);
    setShowModal(true);
  };

  const openViewModal = (reflection: Reflection) => {
    setViewingReflection(reflection);
    setShowDetailModal(true);
  };

  const handleEditFromView = (reflection: Reflection) => {
    setShowDetailModal(false);
    setEditingReflection(reflection);
    setShowModal(true);
  };





  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reflections</h1>
            <p className="text-muted-foreground mt-1">
              Document your learning journey and insights
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            New Reflection
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Reflections</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{reflections.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {reflections.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Words</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {reflections.length > 0 ? Math.round(reflections.reduce((acc, r) => acc + r.content.split(' ').length, 0) / reflections.length) : 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Recent</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {reflections.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reflections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reflections List */}
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <Card key={reflection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{reflection.title}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-700">
                        Week {reflection.weekNumber || 1}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {reflection.content.substring(0, 150)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(reflection.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{reflection.content.split(' ').length} words</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">{reflection.missionId}</span>
                  </div>
                </div>

                {/* Key Learnings */}
                {reflection.keyLearnings && reflection.keyLearnings.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reflection.keyLearnings.slice(0, 3).map((learning: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {learning}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openViewModal(reflection)}>
                    <Eye className="h-4 w-4" />
                    Read
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openEditModal(reflection)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700" onClick={() => handleDeleteReflection(reflection.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <ReflectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reflection={editingReflection}
        onSave={editingReflection ? handleUpdateReflection : handleCreateReflection}
      />
      
      <ReflectionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        reflection={viewingReflection}
        onEdit={handleEditFromView}
      />
    </Layout>
  );
}