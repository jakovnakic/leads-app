import express from 'express';
import {
  getAllLeadsController,
  getLeadByIdController,
} from '../controllers/leadController.js';
import validateUuid from '../middleware/validateUuid.js';

const router = express.Router();

router.get('/', getAllLeadsController);

router.get('/:id', validateUuid, getLeadByIdController);

export default router;
