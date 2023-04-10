import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HistoryState } from './history.model';

export const _selectHistoryState =
  createFeatureSelector<Readonly<HistoryState>>('historyState');

export const selectAuditItems = createSelector(
  _selectHistoryState,
  (state) => state.auditItems
);
