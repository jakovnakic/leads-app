import { useQuery } from '@tanstack/react-query';
import apiRequest from '../services/api';

const fetchAgents = async () => apiRequest('/agents');

const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });
};

export default useAgents;
