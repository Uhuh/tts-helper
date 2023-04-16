import { createReducer, on } from '@ngrx/store';
import { HistoryState } from './history.model';
import { addHistory, updateHistoryStatus } from './history.actions';
import { AuditState } from './history-item.interface';

const initialState: HistoryState = {
  auditItems: [],
};

export const historyReducer = createReducer(
  initialState,
  on(updateHistoryStatus, (state, { id, auditState }) => {
    const item = state.auditItems.find((a) => a.id === id);

    if (
      !item ||
      (item.state === AuditState.skipped && auditState === AuditState.finished)
    ) {
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
    auditItems: [audit, ...state.auditItems],
  }))
);
