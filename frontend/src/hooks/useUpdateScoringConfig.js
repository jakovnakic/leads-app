import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiRequest from '../services/api';

const updateScoringConfig = async (configData) =>
  apiRequest('/scoring-config', {
    method: 'PATCH',
    body: JSON.stringify(configData),
  });

const useUpdateScoringConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScoringConfig,
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(['scoring-config'], updatedConfig);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
};

export default useUpdateScoringConfig;
