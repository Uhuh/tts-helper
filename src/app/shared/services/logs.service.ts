import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Logger } from "@smithy/types";
import { IUserLog, LogLevel } from '../../pages/user-logs/user-logs.interface';

@Injectable()
export class LogService implements Logger {
  readonly logs$ = new BehaviorSubject<IUserLog[]>([]);

  add(message: string, level: LogLevel, origin: string) {
    this.logs$.next([
      ...this.logs$.value,
      { message, level, origin, createdAt: new Date() },
    ]);
  }

  trace(message: string, origin?: string) {
    this.add(message, 'trace', origin ?? '');
  }

  debug(message: string, origin?: string) {
    this.add(message, 'debug', origin ?? '');
  }

  info(message: string, origin?: string) {
    this.add(message, 'info', origin ?? '');
  }

  warn(message: string, origin?: string) {
    this.add(message, 'warn', origin ?? '');
  }

  error(message: string, origin?: string) {
    this.add(message, 'error', origin ?? '');
  }

  /**
   * Delete all logs within the log service.
   */
  deleteLogs() {
    this.logs$.next([]);
  }
}
