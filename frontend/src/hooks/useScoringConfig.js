import { useQuery } from '@tanstack/react-query';
import apiRequest from '../services/api';

const fetchScoringConfig = async () => apiRequest('/scoring-config');

const useScoringConfig = () =>
  useQuery({
    queryKey: ['scoring-config'],
    queryFn: fetchScoringConfig,
  });

export default useScoringConfig;
