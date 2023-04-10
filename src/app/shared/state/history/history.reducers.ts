import { createReducer, on } from '@ngrx/store';
import { HistoryState } from './history.model';
import { addHistory, updateHistoryStatus } from './history.actions';

const initialState: HistoryState = {
  auditItems: [],
};

export const historyReducer = createReducer(
  initialState,
  on(updateHistoryStatus, (state, { id, auditState }) => {
    const item = state.auditItems.find((a) => a.id === id);

    if (!item) {
      return state;
    }

    const index = state.auditItems.indexOf(item);
    const items = [...state.auditItems.map((a) => ({ ...a }))];
    items[index].state = auditState;

    return {
      ...state,
      auditItems: items,
    };
  }),
  on(addHistory, (state, { audit }) => ({
    ...state,
    auditItems: [...state.auditItems, audit],
  }))
);
