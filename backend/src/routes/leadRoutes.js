import express from 'express';
import {
  getAllLeadsController,
  getLeadByIdController,
  createLeadController,
} from '../controllers/leadController.js';
import validateUuid from '../middleware/validateUuid.js';
import validateLead from '../middleware/validateLead.js';

const router = express.Router();

router.get('/', getAllLeadsController);

router.get('/:id', validateUuid, getLeadByIdController);

router.post('/', validateLead, createLeadController);

export default router;
