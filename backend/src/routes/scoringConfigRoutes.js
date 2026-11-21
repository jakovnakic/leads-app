import express from 'express';
import {
  getScoringConfigController,
  updateScoringConfigController,
} from '../controllers/scoringConfigController.js';

const router = express.Router();

router.get('/', getScoringConfigController);

router.patch('/', updateScoringConfigController);

export default router;
