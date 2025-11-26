// Custom hooks for API data fetching

import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import type { Mission, Project, Reflection, UserStats } from '@/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMissions(): UseApiState<Mission[]> {
  const [state, setState] = useState<UseApiState<Mission[]>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchMissions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.getMissions();
      setState(prev => ({ ...prev, data: response.data || [], loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch missions',
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return { ...state, refetch: fetchMissions };
}

export function useProjects(): UseApiState<Project[]> {
  const [state, setState] = useState<UseApiState<Project[]>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchProjects = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.getProjects();
      setState(prev => ({ ...prev, data: response.data || [], loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { ...state, refetch: fetchProjects };
}

export function useReflections(): UseApiState<Reflection[]> {
  const [state, setState] = useState<UseApiState<Reflection[]>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchReflections = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.getReflections();
      setState(prev => ({ ...prev, data: response.data || [], loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch reflections',
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

  return { ...state, refetch: fetchReflections };
}

export function useUserStats(): UseApiState<UserStats> {
  const [state, setState] = useState<UseApiState<UserStats>>({
    data: null,
    loading: true,
    error: null,
    refetch: () => {},
  });

  const fetchStats = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.getUserStats();
      setState(prev => ({ ...prev, data: response.data, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { ...state, refetch: fetchStats };
}