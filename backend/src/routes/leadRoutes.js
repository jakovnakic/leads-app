import express from 'express';
import {
  getAllLeadsController,
  getLeadByIdController,
  createLeadController,
  updateLeadController,
} from '../controllers/leadController.js';
import validateUuid from '../middleware/validateUuid.js';
import validateLead from '../middleware/validateLead.js';

const router = express.Router();

router.get('/', getAllLeadsController);

router.get('/:id', validateUuid, getLeadByIdController);

router.post('/', validateLead, createLeadController);

router.patch('/:id', validateUuid, updateLeadController);

export default router;
