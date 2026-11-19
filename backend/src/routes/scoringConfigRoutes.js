import express from 'express';
import { getScoringConfigController } from '../controllers/scoringConfigController.js';

const router = express.Router();

router.get('/', getScoringConfigController);

export default router;
