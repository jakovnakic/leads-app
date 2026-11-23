import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiRequest from '../services/api';

const updateLead = async ({ id, leadData }) =>
  apiRequest(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(leadData),
  });

const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export default useUpdateLead;
