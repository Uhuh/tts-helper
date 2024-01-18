import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUserLog, LogLevel } from '../../pages/user-logs/user-logs.interface';

@Injectable()
export class LogService {
  readonly logs$ = new BehaviorSubject<IUserLog[]>([]);

  add(message: string, level: LogLevel, origin: string) {
    this.logs$.next([
      ...this.logs$.value,
      { message, level, origin, createdAt: new Date() },
    ]);
  }

  /**
   * Delete all logs within the log service.
   */
  deleteLogs() {
    this.logs$.next([]);
  }
}