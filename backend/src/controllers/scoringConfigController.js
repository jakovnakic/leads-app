import {
  getScoringConfig,
  updateScoringConfig,
} from '../services/scoringConfigService.js';

export const getScoringConfigController = async (req, res, next) => {
  try {
    const scoringConfig = await getScoringConfig();

    res.status(200).json(scoringConfig);
  } catch (error) {
    next(error);
  }
};

export const updateScoringConfigController = async (req, res, next) => {
  try {
    const result = await updateScoringConfig(req.body);

    if (result.conflict) {
      return res.status(409).json({
        status: 'Error',
        message:
          'Scoring configuration has been modified by another user. Please refresh and try again.',
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
