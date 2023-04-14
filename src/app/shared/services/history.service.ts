import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuditItems } from '../state/history/history.selectors';
import { AuditItem, AuditState } from '../state/history/history-item.interface';
import {
  addHistory,
  updateHistoryStatus,
} from '../state/history/history.actions';
import { listen } from '@tauri-apps/api/event';

@Injectable()
export class HistoryService {
  public readonly auditItems$ = this.store.select(selectAuditItems);

  constructor(private readonly store: Store) {
    listen('audio-done', (item) => {
      this.store.dispatch(
        updateHistoryStatus({
          id: item.payload as number,
          auditState: AuditState.finished,
        })
      );
    });
  }

  addHistory(audit: AuditItem) {
    return this.store.dispatch(addHistory({ audit }));
  }

  updateHistory(id: number, auditState: AuditState) {
    return this.store.dispatch(updateHistoryStatus({ id, auditState }));
  }
}
