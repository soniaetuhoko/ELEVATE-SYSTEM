import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Calendar,
  Target,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import MissionModal from '@/components/MissionModal';
import MissionDetailModal from '@/components/MissionDetailModal';
import apiService from '@/services/api';
import type { Mission } from '@/types';

export default function MissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | undefined>();
  const [viewingMission, setViewingMission] = useState<Mission | null>(null);
  const { ref: gridRef, inView: gridInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMissions();
      setMissions(response.data || []);
    } catch (error) {
      toast.error('Failed to load missions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMission = async (missionData: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await apiService.createMission(missionData);
    loadMissions();
  };

  const handleUpdateMission = async (missionData: Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingMission) {
      await apiService.updateMission(editingMission.id, missionData);
      loadMissions();
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      try {
        // Optimistically update UI first
        setMissions(prev => prev.filter(mission => mission.id !== id));
        
        // Then make API call
        await apiService.deleteMission(id);
        toast.success('Deleted');
      } catch (error) {
        console.error('Delete mission error:', error);
        toast.error('Failed to delete mission');
        // Reload missions to restore state if API call failed
        loadMissions();
      }
    }
  };

  const openCreateModal = () => {
    setEditingMission(undefined);
    setShowModal(true);
  };

  const openEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setShowModal(true);
  };

  const openViewModal = (mission: Mission) => {
    setViewingMission(mission);
    setShowDetailModal(true);
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

  const handleEditFromView = (mission: Mission) => {
    setShowDetailModal(false);
    setEditingMission(mission);
    setShowModal(true);
  };

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || mission.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = [
    { label: 'Total Missions', value: missions.length.toString(), color: 'text-blue-600' },
    { label: 'In Progress', value: missions.filter(m => m.status === 'In Progress' || m.status === 'Planning').length.toString(), color: 'text-orange-600' },
    { label: 'Completed', value: missions.filter(m => m.status === 'Completed').length.toString(), color: 'text-green-600' },
    { label: 'Avg Progress', value: missions.length > 0 ? `${Math.round(missions.reduce((acc, m) => acc + m.progress, 0) / missions.length)}%` : '0%', color: 'text-purple-600' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Missions</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your learning missions
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Create Mission
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label}
              className="hover:shadow-lg transition-all hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700"
              style={{
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>



        {/* Filter Controls */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search missions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filter by status"
                aria-label="Filter missions by status"
              >
                <option value="all">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filter by category"
                aria-label="Filter missions by category"
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Business">Business</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Missions Grid */}
        <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((mission, index) => (
            <Card 
              key={mission.id} 
              className="hover:shadow-lg transition-all hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700"
              style={{
                animation: gridInView ? `fadeIn 0.6s ease-out ${index * 0.1}s both` : 'none'
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{mission.title}</CardTitle>
                    </div>
                    <CardDescription>{mission.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(mission.status)}>
                      {mission.status}
                    </Badge>
                    <Badge variant={mission.progress >= 80 ? 'default' : 'secondary'}>
                      {mission.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{mission.projects}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{mission.reflections}</p>
                    <p className="text-xs text-muted-foreground">Reflections</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-600 flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {mission.deadline}
                    </p>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openViewModal(mission)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openEditModal(mission)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700" onClick={() => handleDeleteMission(mission.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <MissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mission={editingMission}
        onSave={editingMission ? handleUpdateMission : handleCreateMission}
      />
      
      <MissionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        mission={viewingMission}
        onEdit={handleEditFromView}
      />
    </Layout>
  );
}