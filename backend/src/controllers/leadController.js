import {
  getAllLeads,
  getLeadById,
  createLead,
} from '../services/leadService.js';

export const getAllLeadsController = async (req, res, next) => {
  try {
    const { sortBy = 'created_at', order = 'desc' } = req.query;

    const allowedSortFields = ['created_at', 'score'];
    const allowedOrders = ['asc', 'desc'];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid sortBy parameter. Allowed values: created_at, score.',
      });
    }

    if (!allowedOrders.includes(order)) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid order parameter. Allowed values: asc, desc.',
      });
    }

    const leads = await getAllLeads({ sortBy, order });

    res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};

export const getLeadByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await getLeadById(id);

    if (!lead) {
      return res.status(404).json({
        status: 'Error',
        message: 'Lead not found',
      });
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};

export const createLeadController = async (req, res, next) => {
  try {
    const newLead = await createLead(req.body);

    res.status(201).json(newLead);
  } catch (error) {
    next(error);
  }
};
