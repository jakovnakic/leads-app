import { getAllLeads, getLeadById } from '../services/leadService.js';

export const getAllLeadsController = async (req, res, next) => {
  try {
    const leads = await getAllLeads();

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
