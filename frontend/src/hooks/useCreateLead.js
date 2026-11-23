import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiRequest from '../services/api';

const createLead = async (leadData) =>
  apiRequest('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  });

const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export default useCreateLead;
