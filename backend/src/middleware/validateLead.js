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
      message: 'El nombre es obligatorio',
    });
  }

  if (typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({
      status: 'Error',
      message: 'El teléfono es obligatorio',
    });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      status: 'Error',
      message: 'Estado del lead no válido',
    });
  }

  if (
    assigned_agent_id !== null &&
    (typeof assigned_agent_id !== 'string' ||
      !UUID_REGEX.test(assigned_agent_id))
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'ID de agente asignado no válido',
    });
  }

  if (typeof is_new_customer !== 'boolean') {
    return res.status(400).json({
      status: 'Error',
      message: 'El valor de cliente nuevo debe ser un booleano',
    });
  }

  if (
    typeof commercial_interest_option_id !== 'string' ||
    !UUID_REGEX.test(commercial_interest_option_id)
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'ID de la opción de interés comercial no válido',
    });
  }

  if (
    typeof lead_source_option_id !== 'string' ||
    !UUID_REGEX.test(lead_source_option_id)
  ) {
    return res.status(400).json({
      status: 'Error',
      message: 'ID de la opción de origen del lead no válido',
    });
  }

  next();
};

export default validateLead;
