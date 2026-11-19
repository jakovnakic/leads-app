import { getAllAgents } from '../services/agentService.js';

export const getAllAgentsController = async (req, res, next) => {
  try {
    const agents = await getAllAgents();

    res.status(200).json(agents);
  } catch (error) {
    next(error);
  }
};
