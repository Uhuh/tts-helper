import { createFeature, createReducer, on } from '@ngrx/store';
import { HistoryActions } from './history.actions';

export interface HistoryState {
  auditItems: AuditItem[];
}

export enum AuditState {
  playing,
  skipped,
  finished,
}

export type AuditSource = 'youtube' | 'twitch' | 'tts-helper' | 'gpt';

export interface AuditItem {
  id: number;
  username: string;
  text: string;
  source: AuditSource;
  createdAt: Date;
  state: AuditState;
}
const initialState: HistoryState = {
  auditItems: [],
};

export const HistoryFeature = createFeature({
  name: 'HistoryState',
  reducer: createReducer(
    initialState,
    on(HistoryActions.updateAuditState, (state, { id, auditState }) => {
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
    on(HistoryActions.addAuditItem, (state, { audit }) => ({
      ...state,
      auditItems: [audit, ...state.auditItems],
    })),
    on(HistoryActions.removeAuditItem, (state, { auditId }) => {
      const item = state.auditItems.find((a) => a.id === auditId);

      if (!item) {
        return state;
      }

      const index = state.auditItems.indexOf(item);
      const items = [...state.auditItems.map((a) => ({ ...a }))];
      items.splice(index, 1);

      return {
        ...state,
        auditItems: [...items],
      };
    })
  ),
});
