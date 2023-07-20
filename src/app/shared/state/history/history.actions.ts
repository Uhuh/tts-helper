import { createActionGroup, props } from '@ngrx/store';
import { AuditItem, AuditState } from './history.feature';

export const HistoryActions = createActionGroup({
  source: 'HistoryState',
  events: {
    'Update Audit State': props<{ id: number; auditState: AuditState }>(),
    'Add Audit Item': props<{ audit: AuditItem }>(),
    'Remove Audit Item': props<{ auditId: number }>(),
  }
});