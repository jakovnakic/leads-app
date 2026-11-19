import express from 'express';
import { getAllAgentsController } from '../controllers/agentController.js';

const router = express.Router();

router.get('/', getAllAgentsController);

export default router;
