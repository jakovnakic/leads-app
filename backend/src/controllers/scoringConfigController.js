import { getScoringConfig } from '../services/scoringConfigService.js';

export const getScoringConfigController = async (req, res, next) => {
  try {
    const scoringConfig = await getScoringConfig();

    res.status(200).json(scoringConfig);
  } catch (error) {
    next(error);
  }
};
