import { useEffect, useReducer } from 'react';
import { TextField, MenuItem, Button, Alert, Dialog } from '@mui/material';

import useAgents from '../../hooks/useAgents';
import useScoringConfig from '../../hooks/useScoringConfig';
import useCreateLead from '../../hooks/useCreateLead';
import useUpdateLead from '../../hooks/useUpdateLead';
import styles from '../../styles/components/create-lead-dialog.module.scss';

const initialFormData = {
  name: '',
  phone: '',
  status: 'new',
  assigned_agent_id: '',
  is_new_customer: 'true',
  commercial_interest_option_id: '',
  lead_source_option_id: '',
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SET_FORM':
      return {
        ...action.payload,
      };

    case 'RESET':
      return initialFormData;

    default:
      return state;
  }
};

const LeadDialog = ({ open, lead = null, handleClose }) => {
  const [formData, dispatch] = useReducer(formReducer, initialFormData);

  const isEditMode = Boolean(lead);

  const {
    data: agents = [],
    // isLoading: isLoadingAgents,
    isError: isAgentsError,
  } = useAgents();

  const {
    data: scoringConfig,
    // isLoading: isLoadingScoringConfig,
    isError: isScoringConfigError,
  } = useScoringConfig();

  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  const activeMutation = isEditMode ? updateLeadMutation : createLeadMutation;

  const handleChange = (event) => {
    const { name, value } = event.target;

    dispatch({
      type: 'SET_FIELD',
      field: name,
      value,
    });
  };

  const handleSubmit = () => {
    const leadData = {
      ...formData,
      assigned_agent_id: formData.assigned_agent_id || null,
      is_new_customer: formData.is_new_customer === 'true',
    };

    if (isEditMode) {
      updateLeadMutation.mutate(
        {
          id: lead.id,
          leadData: {
            ...leadData,
            version: lead.version,
          },
        },
        {
          onSuccess: handleClose,
        },
      );
    } else {
      createLeadMutation.mutate(leadData, {
        onSuccess: handleClose,
      });
    }
  };

  useEffect(() => {
    if (open) {
      if (lead) {
        dispatch({
          type: 'SET_FORM',
          payload: {
            name: lead.name ?? '',
            phone: lead.phone ?? '',
            status: lead.status ?? 'new',
            assigned_agent_id: lead.assigned_agent_id ?? '',
            is_new_customer: String(lead.is_new_customer),
            commercial_interest_option_id:
              lead.commercial_interest_option_id ?? '',
            lead_source_option_id: lead.lead_source_option_id ?? '',
          },
        });
      } else {
        dispatch({ type: 'RESET' });
      }

      createLeadMutation.reset();
      updateLeadMutation.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {activeMutation.isError && (
        <Alert severity='error'>{activeMutation.error.message}</Alert>
      )}

      {(isAgentsError || isScoringConfigError) && (
        <Alert severity='error'>
          No se pudieron cargar los datos del formulario.
        </Alert>
      )}

      <div className={styles['dialog']}>
        <h1 className={styles['heading']}>
          {isEditMode ? 'Editar lead' : 'Nuevo lead'}
        </h1>

        <main className={styles['main']}>
          <TextField
            name='name'
            label='Nombre'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            size='small'
          />

          <TextField
            name='phone'
            label='Teléfono'
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size='small'
          />

          <TextField
            select
            name='status'
            label='Estado'
            value={formData.status}
            onChange={handleChange}
            fullWidth
            size='small'
          >
            <MenuItem value='new'>Nuevo</MenuItem>
            <MenuItem value='in_progress'>En progreso</MenuItem>
            <MenuItem value='contacted'>Contactado</MenuItem>
            <MenuItem value='closed'>Cerrado</MenuItem>
          </TextField>

          <TextField
            select
            name='assigned_agent_id'
            label='Agente asignado'
            value={formData.assigned_agent_id}
            onChange={handleChange}
            fullWidth
            size='small'
          >
            <MenuItem value=''>Sin asignar</MenuItem>
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name='is_new_customer'
            label='¿Es cliente nuevo?'
            value={formData.is_new_customer}
            onChange={handleChange}
            fullWidth
            size='small'
          >
            <MenuItem value='true'>Sí</MenuItem>
            <MenuItem value='false'>No</MenuItem>
          </TextField>

          <TextField
            select
            name='commercial_interest_option_id'
            label='Interés comercial'
            value={formData.commercial_interest_option_id}
            onChange={handleChange}
            fullWidth
            size='small'
          >
            {scoringConfig?.commercialInterestOptions?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name='lead_source_option_id'
            label='Origen del lead'
            value={formData.lead_source_option_id}
            onChange={handleChange}
            fullWidth
            size='small'
          >
            {scoringConfig?.leadSourceOptions?.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </main>

        <footer className={styles['footer']}>
          <Button onClick={handleClose}>Cancelar</Button>

          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={
              !formData.name.trim() ||
              !formData.phone.trim() ||
              !formData.status ||
              formData.is_new_customer === undefined ||
              !formData.commercial_interest_option_id ||
              !formData.lead_source_option_id
            }
          >
            {isEditMode ? 'Editar lead' : 'Crear lead'}
          </Button>
        </footer>
      </div>
    </Dialog>
  );
};

export default LeadDialog;
