const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_STATUSES = ['new', 'in_progress', 'contacted', 'closed'];

const validateLead = (req, res, next) => {
  const {
    name,
    phone,
    status,
    assigned_agent_id,
    is_new_customer,
    commercial_interest_option_id,
    lead_source_option_id,
  } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      status: 'Error',
      message: 'Name is required',
    });
  }

  if (typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({
      status: 'Error',
      message: 'Phone is required',
    });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      status: 'Error',
      message: 'Invalid lead status',
    });
  }

  if (
    assigned_agent_id !== null &&
    (typeof assigned_agent_id !== 'string' ||
      !UUID_REGEX.test(assigned_agent_id))
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'Invalid assigned agent ID',
    });
  }

  if (typeof is_new_customer !== 'boolean') {
    return res.status(400).json({
      status: 'Error',
      message: 'New customer value must be a boolean',
    });
  }

  if (
    typeof commercial_interest_option_id !== 'string' ||
    !UUID_REGEX.test(commercial_interest_option_id)
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'Invalid commercial interest option ID',
    });
  }

  if (
    typeof lead_source_option_id !== 'string' ||
    !UUID_REGEX.test(lead_source_option_id)
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'Invalid lead source option ID',
    });
  }

  next();
};

export default validateLead;
