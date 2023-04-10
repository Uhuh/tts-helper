import { createAction, props } from '@ngrx/store';
import { AuditItem, AuditState } from './history-item.interface';

export const updateHistoryStatus = createAction(
  '[ History ] Updating history status',
  props<{ id: number; auditState: AuditState }>()
);

export const addHistory = createAction(
  '[ History ] Adding audit to history',
  props<{ audit: AuditItem }>()
);
