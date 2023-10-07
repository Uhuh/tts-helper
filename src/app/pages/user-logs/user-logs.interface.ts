export type LogLevel = 'info' | 'error';

export interface IUserLog {
  origin: string,
  message: string,
  level: LogLevel,
  createdAt: Date,
}