import { useQuery } from '@tanstack/react-query';
import apiRequest from '../services/api';

const fetchLeads = async (filters) => {
  const queryParams = new URLSearchParams();

  if (filters.search) {
    queryParams.set('search', filters.search);
  }

  if (filters.status) {
    queryParams.set('status', filters.status);
  }

  if (filters.assignedAgentId) {
    queryParams.set('agentId', filters.assignedAgentId);
  }

  return apiRequest(`/leads?${queryParams.toString()}`);
};

const useLeads = (filters = {}) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetchLeads(filters),
  });
};

export default useLeads;
