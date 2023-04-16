export enum AuditState {
  playing,
  skipped,
  finished,
}

export type AuditSource = 'youtube' | 'twitch' | 'tts-helper';

export interface AuditItem {
  id: number;
  username: string;
  text: string;
  source: AuditSource;
  createdAt: Date;
  state: AuditState;
}
