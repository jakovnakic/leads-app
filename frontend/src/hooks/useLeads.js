import { useQuery, keepPreviousData } from '@tanstack/react-query';
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

  if (filters.page !== undefined) {
    queryParams.set('page', filters.page);
  }

  if (filters.pageSize !== undefined) {
    queryParams.set('limit', filters.pageSize);
  }

  if (filters.sortBy) {
    queryParams.set('sortBy', filters.sortBy);
  }

  if (filters.order) {
    queryParams.set('order', filters.order);
  }

  return apiRequest(`/leads?${queryParams.toString()}`);
};

const useLeads = (filters = {}) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetchLeads(filters),
    placeholderData: keepPreviousData,
  });
};

export default useLeads;
