import { DataGrid } from '@mui/x-data-grid';
import useLeads from '../../hooks/useLeads';
import styles from '../../styles/pages/leads-page.module.scss';
import { useReducer } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import useAgents from '../../hooks/useAgents';

const statusLabels = {
  new: 'Nuevo',
  in_progress: 'En progreso',
  contacted: 'Contactado',
  closed: 'Cerrado',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const columns = [
  {
    field: 'name',
    headerName: 'Nombre',
    flex: 1.5,
    minWidth: 180,
  },
  {
    field: 'phone',
    headerName: 'Teléfono',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'status',
    headerName: 'Estado',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => statusLabels[params.value],
  },
  {
    field: 'assigned_agent_name',
    headerName: 'Agente asignado',
    flex: 1.2,
    minWidth: 160,
    renderCell: (params) => params.value || '-',
  },
  {
    field: 'score',
    headerName: 'Score',
    width: 120,
    renderCell: (params) => (
      <span>
        {params.row.score} / {priorityLabels[params.row.priority]}
      </span>
    ),
  },
];

const initialState = {
  search: '',
  status: '',
  assignedAgentId: '',
};

const leadsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
      };
    case 'SET_STATUS_FILTER':
      return {
        ...state,
        status: action.payload,
      };
    case 'SET_AGENT_FILTER':
      return {
        ...state,
        assignedAgentId: action.payload,
      };

    default:
      return state;
  }
};

const LeadsPage = () => {
  const [state, dispatch] = useReducer(leadsReducer, initialState);
  const { search, status, assignedAgentId } = state;

  const { data, isLoading, isError, error } = useLeads({
    search: search,
    status: status,
    assignedAgentId: assignedAgentId,
  });

  const { data: agents = [] } = useAgents();

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  const handleChangeSearch = (e) => {
    dispatch({
      type: 'SET_SEARCH',
      payload: e.target.value,
    });
  };

  const handleChangeStatus = (e) => {
    dispatch({
      type: 'SET_STATUS_FILTER',
      payload: e.target.value,
    });
  };

  const handleChangeAssignedAgent = (e) => {
    dispatch({
      type: 'SET_AGENT_FILTER',
      payload: e.target.value,
    });
  };

  return (
    <div className={styles['leads-page']}>
      <header className={styles['header']}>
        <h1 className={styles['header__title']}>Leads</h1>
        <p className={styles['header__description']}>
          Gestiona y consulta tus leads comerciales. Total:{' '}
          {data?.pagination.total ?? 0}
        </p>
        <div className={styles['filters-group']}>
          <TextField
            label='Buscar lead'
            placeholder='Nombre o teléfono'
            value={search}
            onChange={handleChangeSearch}
            size='small'
            className={styles['filters-group__search']}
          />

          <TextField
            select
            label='Estado'
            value={status}
            onChange={handleChangeStatus}
            size='small'
            className={styles['filters-group__filter']}
          >
            <MenuItem value=''>Todos</MenuItem>
            <MenuItem value='new'>Nuevo</MenuItem>
            <MenuItem value='in_progress'>En progreso</MenuItem>
            <MenuItem value='contacted'>Contactado</MenuItem>
            <MenuItem value='closed'>Cerrado</MenuItem>
          </TextField>

          <TextField
            select
            label='Agente asignado'
            value={assignedAgentId}
            onChange={handleChangeAssignedAgent}
            size='small'
            className={styles['filters-group__filter']}
          >
            <MenuItem value=''>Todos</MenuItem>
            {agents.map((agent) => (
              <MenuItem key={agent.id} value={agent.id}>
                {agent.name}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </header>

      <DataGrid
        rows={data?.data ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={isLoading}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
        disableRowSelectionOnClick
        className={styles['data-grid']}
      />
    </div>
  );
};

export default LeadsPage;
