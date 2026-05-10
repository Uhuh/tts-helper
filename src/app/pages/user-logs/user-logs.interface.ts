export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface IUserLog {
  origin: string,
  message: string,
  level: LogLevel,
  createdAt: Date,
}