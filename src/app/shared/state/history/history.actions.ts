import { createAction, props } from '@ngrx/store';
import { AuditItem, AuditState } from './history-item.interface';

export const updateHistoryStatus = createAction(
  '[ HistoryState ] Updating history status',
  props<{ id: number; auditState: AuditState }>()
);

export const addHistory = createAction(
  '[ HistoryState ] Adding audit to history',
  props<{ audit: AuditItem }>()
);
