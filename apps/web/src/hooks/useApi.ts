/**
 * React hooks for TinyTroupe API interactions
 * Provides type-safe, reactive API state management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  apiClient, 
  PopulationResponse, 
  CreatePopulationRequest,
  InterventionResponse,
  CreateInterventionRequest,
  ExecuteInterventionRequest,
  InterventionResults,
  SimulationResponse,
  SimulationRequest,
  SimulationResults
} from '@/lib/api-client';

// Generic API state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic hook for API operations
function useApiState<T>(initialData: T | null = null): [
  ApiState<T>,
  (data: T | null) => void,
  (loading: boolean) => void,
  (error: string | null) => void
] {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  return [state, setData, setLoading, setError];
}

// Population Hooks
export function usePopulations() {
  const [state, setData, setLoading, setError] = useApiState<PopulationResponse[]>([]);

  const fetchPopulations = useCallback(async () => {
    setLoading(true);
    try {
      const populations = await apiClient.listPopulations();
      setData(populations);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch populations');
    }
  }, [setData, setLoading, setError]);

  const createPopulation = useCallback(async (request: CreatePopulationRequest) => {
    setLoading(true);
    try {
      const population = await apiClient.createPopulation(request);
      setData(prev => prev ? [...prev, population] : [population]);
      return population;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create population');
      throw error;
    }
  }, [setData, setLoading, setError]);

  const deletePopulation = useCallback(async (populationId: string) => {
    setLoading(true);
    try {
      await apiClient.deletePopulation(populationId);
      setData(prev => prev ? prev.filter(p => p.population_id !== populationId) : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete population');
      throw error;
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    fetchPopulations();
  }, [fetchPopulations]);

  return {
    ...state,
    refresh: fetchPopulations,
    createPopulation,
    deletePopulation,
  };
}

export function usePopulation(populationId: string | null) {
  const [state, setData, setLoading, setError] = useApiState<PopulationResponse>();

  const fetchPopulation = useCallback(async () => {
    if (!populationId) return;
    
    setLoading(true);
    try {
      const population = await apiClient.getPopulation(populationId);
      setData(population);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch population');
    }
  }, [populationId, setData, setLoading, setError]);

  useEffect(() => {
    fetchPopulation();
  }, [fetchPopulation]);

  return {
    ...state,
    refresh: fetchPopulation,
  };
}

// Intervention Hooks
export function useInterventions(status?: string) {
  const [state, setData, setLoading, setError] = useApiState<InterventionResponse[]>([]);

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    try {
      const interventions = await apiClient.listInterventions(status);
      setData(interventions);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch interventions');
    }
  }, [status, setData, setLoading, setError]);

  const createIntervention = useCallback(async (request: CreateInterventionRequest) => {
    setLoading(true);
    try {
      const intervention = await apiClient.createIntervention(request);
      setData(prev => prev ? [...prev, intervention] : [intervention]);
      return intervention;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create intervention');
      throw error;
    }
  }, [setData, setLoading, setError]);

  const executeIntervention = useCallback(async (request: ExecuteInterventionRequest) => {
    setLoading(true);
    try {
      const result = await apiClient.executeIntervention(request);
      // Update the intervention status in our local state
      setData(prev => prev ? prev.map(i => 
        i.intervention_id === request.intervention_id 
          ? { ...i, status: 'running' as const }
          : i
      ) : []);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute intervention');
      throw error;
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  return {
    ...state,
    refresh: fetchInterventions,
    createIntervention,
    executeIntervention,
  };
}

export function useIntervention(interventionId: string | null) {
  const [state, setData, setLoading, setError] = useApiState<InterventionResponse>();

  const fetchIntervention = useCallback(async () => {
    if (!interventionId) return;
    
    setLoading(true);
    try {
      const intervention = await apiClient.getIntervention(interventionId);
      setData(intervention);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch intervention');
    }
  }, [interventionId, setData, setLoading, setError]);

  const pauseIntervention = useCallback(async () => {
    if (!interventionId) return;
    
    try {
      await apiClient.pauseIntervention(interventionId);
      setData(prev => prev ? { ...prev, status: 'paused' as const } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause intervention');
      throw error;
    }
  }, [interventionId, setData, setError]);

  const resumeIntervention = useCallback(async () => {
    if (!interventionId) return;
    
    try {
      await apiClient.resumeIntervention(interventionId);
      setData(prev => prev ? { ...prev, status: 'running' as const } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resume intervention');
      throw error;
    }
  }, [interventionId, setData, setError]);

  const completeIntervention = useCallback(async () => {
    if (!interventionId) return;
    
    try {
      await apiClient.completeIntervention(interventionId);
      setData(prev => prev ? { ...prev, status: 'completed' as const } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete intervention');
      throw error;
    }
  }, [interventionId, setData, setError]);

  useEffect(() => {
    fetchIntervention();
  }, [fetchIntervention]);

  return {
    ...state,
    refresh: fetchIntervention,
    pauseIntervention,
    resumeIntervention,
    completeIntervention,
  };
}

export function useInterventionResults(interventionId: string | null) {
  const [state, setData, setLoading, setError] = useApiState<InterventionResults>();

  const fetchResults = useCallback(async () => {
    if (!interventionId) return;
    
    setLoading(true);
    try {
      const results = await apiClient.getInterventionResults(interventionId);
      setData(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch intervention results');
    }
  }, [interventionId, setData, setLoading, setError]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    ...state,
    refresh: fetchResults,
  };
}

// Simulation Hooks
export function useSimulations() {
  const [state, setData, setLoading, setError] = useApiState<SimulationResponse[]>([]);

  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    try {
      const simulations = await apiClient.listSimulations();
      setData(simulations);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch simulations');
    }
  }, [setData, setLoading, setError]);

  const createSimulation = useCallback(async (request: SimulationRequest) => {
    setLoading(true);
    try {
      const simulation = await apiClient.createSimulation(request);
      setData(prev => prev ? [...prev, simulation] : [simulation]);
      return simulation;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create simulation');
      throw error;
    }
  }, [setData, setLoading, setError]);

  const runSimulation = useCallback(async (simulationId: string) => {
    setLoading(true);
    try {
      const result = await apiClient.runSimulation(simulationId);
      // Update simulation status
      setData(prev => prev ? prev.map(s => 
        s.simulation_id === simulationId 
          ? { ...s, status: 'running' as const }
          : s
      ) : []);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to run simulation');
      throw error;
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return {
    ...state,
    refresh: fetchSimulations,
    createSimulation,
    runSimulation,
  };
}

export function useSimulation(simulationId: string | null) {
  const [state, setData, setLoading, setError] = useApiState<SimulationResponse>();

  const fetchSimulation = useCallback(async () => {
    if (!simulationId) return;
    
    setLoading(true);
    try {
      const simulation = await apiClient.getSimulation(simulationId);
      setData(simulation);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch simulation');
    }
  }, [simulationId, setData, setLoading, setError]);

  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  return {
    ...state,
    refresh: fetchSimulation,
  };
}

export function useSimulationResults(
  simulationId: string | null,
  extractionObjective?: string,
  fields?: string[]
) {
  const [state, setData, setLoading, setError] = useApiState<SimulationResults>();

  const fetchResults = useCallback(async () => {
    if (!simulationId || !extractionObjective || !fields) return;
    
    setLoading(true);
    try {
      const results = await apiClient.getSimulationResults(simulationId, extractionObjective, fields);
      setData(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch simulation results');
    }
  }, [simulationId, extractionObjective, fields, setData, setLoading, setError]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    ...state,
    refresh: fetchResults,
  };
}

// Health Check Hook
export function useHealthCheck() {
  const [state, setData, setLoading, setError] = useApiState<{ status: string }>();

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const health = await apiClient.healthCheck();
      setData(health);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Health check failed');
    }
  }, [setData, setLoading, setError]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...state,
    refresh: checkHealth,
  };
}