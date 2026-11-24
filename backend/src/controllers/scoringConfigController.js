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
          'La configuración de puntuación ha sido modificada por otro usuario. Por favor, actualiza la página e inténtalo de nuevo.',
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
