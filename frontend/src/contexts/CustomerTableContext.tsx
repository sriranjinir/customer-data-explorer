import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {CustomerFilters} from '../types/customer-types';

interface CustomerTableState {
  page: number;
  pageSize: number;
  filters: CustomerFilters;
  tempFilters: CustomerFilters;
}

interface CustomerTableActions {
  setPage: (page: number) => void;
  updateTempFilter: (field: keyof CustomerFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

interface CustomerTableContextType {
  state: CustomerTableState;
  actions: CustomerTableActions;
}

const initialState: CustomerTableState = {
  page: 1,
  pageSize: 10,
  filters: {
    id: '',
    fullName: '',
    email: '',
    registrationDate: '',
  },
  tempFilters: {
    id: '',
    fullName: '',
    email: '',
    registrationDate: '',
  },
};

type Action =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'UPDATE_TEMP_FILTER'; payload: { field: keyof CustomerFilters; value: string } }
  | { type: 'APPLY_FILTERS' }
  | { type: 'CLEAR_FILTERS' };

function customerTableReducer(state: CustomerTableState, action: Action): CustomerTableState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'UPDATE_TEMP_FILTER':
      return {
        ...state,
        tempFilters: {
          ...state.tempFilters,
          [action.payload.field]: action.payload.value,
        },
      };
    case 'APPLY_FILTERS':
      return {
        ...state,
        filters: { ...state.tempFilters },
        page: 1,
      };
    case 'CLEAR_FILTERS':
      const emptyFilters = {
        id: '',
        fullName: '',
        email: '',
        registrationDate: '',
      };
      return {
        ...state,
        filters: emptyFilters,
        tempFilters: emptyFilters,
        page: 1,
      };
    default:
      return state;
  }
}

const CustomerTableContext = createContext<CustomerTableContextType | undefined>(undefined);

export function CustomerTableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(customerTableReducer, initialState);

  const actions: CustomerTableActions = {
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
    updateTempFilter: (field: keyof CustomerFilters, value: string) =>
      dispatch({ type: 'UPDATE_TEMP_FILTER', payload: { field, value } }),
    applyFilters: () => dispatch({ type: 'APPLY_FILTERS' }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
  };

  return (
    <CustomerTableContext.Provider value={{ state, actions }}>
      {children}
    </CustomerTableContext.Provider>
  );
}

export function useCustomerTable() {
  const context = useContext(CustomerTableContext);
  if (!context) {
    throw new Error('useCustomerTable must be used within a CustomerTableProvider');
  }
  return context;
}
