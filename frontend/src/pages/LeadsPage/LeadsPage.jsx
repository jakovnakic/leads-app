import { DataGrid } from '@mui/x-data-grid';
import useLeads from '../../hooks/useLeads';
import styles from '../../styles/pages/leads-page.module.scss';
import { useReducer } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import useAgents from '../../hooks/useAgents';
import Button from '@mui/material/Button';
import LeadDialog from '../../components/leads/LeadDialog';

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

const sortingOptions = {
  created_at_desc: {
    sortBy: 'created_at',
    order: 'desc',
  },
  created_at_asc: {
    sortBy: 'created_at',
    order: 'asc',
  },
  score_desc: {
    sortBy: 'score',
    order: 'desc',
  },
  score_asc: {
    sortBy: 'score',
    order: 'asc',
  },
};

const initialState = {
  search: '',
  status: '',
  assignedAgentId: '',
  page: 0,
  pageSize: 10,
  sortOption: '',
  isDialogOpen: false,
  selectedLead: null,
};

const leadsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
        page: 0,
      };

    case 'SET_STATUS_FILTER':
      return {
        ...state,
        status: action.payload,
        page: 0,
      };

    case 'SET_AGENT_FILTER':
      return {
        ...state,
        assignedAgentId: action.payload,
        page: 0,
      };

    case 'SET_PAGE':
      return {
        ...state,
        page: action.payload,
      };

    case 'SET_PAGE_SIZE':
      return {
        ...state,
        page: 0,
        pageSize: action.payload,
      };

    case 'SET_SORT_OPTION':
      return {
        ...state,
        sortOption: action.payload,
        page: 0,
      };

    case 'OPEN_CREATE_DIALOG':
      return {
        ...state,
        isDialogOpen: true,
        selectedLead: null,
      };

    case 'OPEN_EDIT_DIALOG':
      return {
        ...state,
        isDialogOpen: true,
        selectedLead: action.payload,
      };

    case 'CLOSE_DIALOG':
      return {
        ...state,
        isDialogOpen: false,
      };

    default:
      return state;
  }
};

const LeadsPage = () => {
  const [state, dispatch] = useReducer(leadsReducer, initialState);
  const {
    search,
    status,
    assignedAgentId,
    page,
    pageSize,
    sortOption,
    isDialogOpen,
    selectedLead,
  } = state;
  const sorting = sortingOptions[sortOption] ?? {};

  const { data, isLoading, isError, error } = useLeads({
    search: search,
    status: status,
    assignedAgentId: assignedAgentId,
    page: page + 1,
    pageSize: pageSize,
    ...sorting,
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

  const handlePaginationModelChange = (model) => {
    if (model.pageSize !== pageSize) {
      dispatch({
        type: 'SET_PAGE_SIZE',
        payload: model.pageSize,
      });
    } else {
      dispatch({
        type: 'SET_PAGE',
        payload: model.page,
      });
    }
  };

  const handleChangeSortOption = (e) => {
    dispatch({
      type: 'SET_SORT_OPTION',
      payload: e.target.value,
    });
  };

  const handleOpenCreateDialog = () => {
    dispatch({ type: 'OPEN_CREATE_DIALOG' });
  };

  const handleOpenEditDialog = (lead) => {
    console.log(lead);
    dispatch({ type: 'OPEN_EDIT_DIALOG', payload: lead });
  };

  const handleCloseDialog = () => {
    dispatch({ type: 'CLOSE_DIALOG' });
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
    {
      field: 'actions',
      headerName: 'Acción',
      sortable: false,
      filterable: false,
      width: 120,
      renderCell: (params) => (
        <Button
          size='small'
          variant='outlined'
          onClick={() => handleOpenEditDialog(params.row)}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className={styles['leads-page']}>
      <header className={styles['header']}>
        <h1 className={styles['header__title']}>Leads</h1>
        <p className={styles['header__description']}>
          Gestiona y consulta tus leads comerciales. Total:{' '}
          {data?.pagination.total ?? 0}
        </p>
        <div className={styles['buttons-split']}>
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

            <TextField
              select
              label='Ordenar por'
              value={sortOption}
              onChange={handleChangeSortOption}
              size='small'
              className={styles['filters-group__sort-filter']}
            >
              <MenuItem value=''>Sin ordenar</MenuItem>
              <MenuItem value='created_at_desc'>
                Fecha de creación: más recientes
              </MenuItem>
              <MenuItem value='created_at_asc'>
                Fecha de creación: más antiguos
              </MenuItem>
              <MenuItem value='score_desc'>Puntuación: mayor a menor</MenuItem>
              <MenuItem value='score_asc'>Puntuación: menor a mayor</MenuItem>
            </TextField>
          </div>
          <Button variant='contained' onClick={handleOpenCreateDialog}>
            + Nuevo
          </Button>
        </div>
      </header>

      <DataGrid
        rows={data?.data ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={isLoading}
        paginationMode='server'
        rowCount={data?.pagination.total ?? 0}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={{
          page: page,
          pageSize: pageSize,
        }}
        onPaginationModelChange={handlePaginationModelChange}
        disableRowSelectionOnClick
        disableColumnSorting
        className={styles['data-grid']}
      />

      <LeadDialog
        open={isDialogOpen}
        lead={selectedLead}
        handleClose={handleCloseDialog}
      />
    </div>
  );
};

export default LeadsPage;
