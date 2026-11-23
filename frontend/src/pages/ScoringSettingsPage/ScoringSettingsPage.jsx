import { useEffect, useReducer } from 'react';
import { Alert, Button, CircularProgress, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import styles from '../../styles/pages/scoring-settings-page.module.scss';
import useScoringConfig from '../../hooks/useScoringConfig';
import useUpdateScoringConfig from '../../hooks/useUpdateScoringConfig';

const initialState = {
  weights: {
    new_customer_weight: 0,
    commercial_interest_weight: 0,
    lead_source_weight: 0,
    age_weight: 0,
  },
  version: null,
  showAlert: false,
};

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        weights: {
          new_customer_weight: action.payload.weights.new_customer_weight,
          commercial_interest_weight:
            action.payload.weights.commercial_interest_weight,
          lead_source_weight: action.payload.weights.lead_source_weight,
          age_weight: action.payload.weights.age_weight,
        },
        version: action.payload.version,
      };

    case 'SET_WEIGHT':
      return {
        ...state,
        weights: {
          ...state.weights,
          [action.payload.field]: Number(action.payload.value),
        },
      };

    case 'SET_SHOW_ALERT':
      return {
        ...state,
        showAlert: action.payload,
      };

    default:
      return state;
  }
};

const ScoringSettingsPage = () => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { weights, version, showAlert } = state;

  const {
    data: scoringConfig,
    isLoading: isLoadingScoringCofig,
    isError: isErrorScoringConfig,
  } = useScoringConfig();

  const updateMutation = useUpdateScoringConfig();

  useEffect(() => {
    if (!isLoadingScoringCofig) {
      dispatch({
        type: 'SET_CONFIG',
        payload: {
          weights: scoringConfig.weights,
          version: scoringConfig.weights.version,
        },
      });
    }
  }, [scoringConfig, isLoadingScoringCofig]);

  const handleChangeWeight = (id, value) => {
    dispatch({
      type: 'SET_WEIGHT',
      payload: { field: id, value },
    });
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...weights,
      version,
    });
  };

  const totalWeight = Object.values(weights).reduce(
    (total, weight) => total + weight,
    0,
  );

  const isValid =
    totalWeight === 100 &&
    Object.values(weights).every(
      (weight) => Number.isInteger(weight) && weight >= 0 && weight <= 100,
    );

  const columns = [
    {
      field: 'criterion',
      headerName: 'Criterio',
      flex: 1,
      sortable: false,
    },
    {
      field: 'weight',
      headerName: 'Peso (%)',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <TextField
          type='number'
          size='small'
          value={weights[params.row.id]}
          onChange={(e) => handleChangeWeight(params.row.id, e.target.value)}
          fullWidth
        />
      ),
    },
  ];

  const rows = [
    {
      id: 'new_customer_weight',
      criterion: 'Cliente nuevo',
    },
    {
      id: 'commercial_interest_weight',
      criterion: 'Interés comercial',
    },
    {
      id: 'lead_source_weight',
      criterion: 'Origen del lead',
    },
    {
      id: 'age_weight',
      criterion: 'Antigüedad',
    },
  ];

  useEffect(() => {
    if (!updateMutation.isSuccess && !updateMutation.isError) {
      return;
    }

    dispatch({ type: 'SET_SHOW_ALERT', payload: true });

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'SET_SHOW_ALERT', payload: false });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [updateMutation.isSuccess, updateMutation.isError]);

  if (isLoadingScoringCofig) {
    return <CircularProgress />;
  }

  if (isErrorScoringConfig) {
    return <Alert severity='error'>No se pudo cargar la configuración.</Alert>;
  }

  return (
    <div className={styles['scoring-settings-page']}>
      <header className={styles['header']}>
        <h1 className={styles['header__title']}>Configuración de pesos</h1>
        <p className={styles['header__description']}>
          Ajusta el peso de cada criterio para determinar su importancia en la
          puntuación final de los leads.
        </p>
      </header>

      <main className={styles['table-container']}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableRowSelectionOnClick
          autoHeight
          className={styles['data-grid']}
        />
        <footer className={styles['footer']}>
          <p
            className={`${styles['footer__sum']} ${!isValid ? styles['footer__sum--invalid'] : ''}`}
          >
            Total: {totalWeight} %
          </p>
          <Button variant='contained' disabled={!isValid} onClick={handleSave}>
            Guardar pesos
          </Button>
        </footer>
      </main>

      {showAlert && updateMutation.isError && (
        <Alert severity='error'>{updateMutation.error.message}</Alert>
      )}
      {showAlert && updateMutation.isSuccess && (
        <Alert severity='success'>
          Configuración actualizada correctamente.
        </Alert>
      )}
    </div>
  );
};

export default ScoringSettingsPage;
