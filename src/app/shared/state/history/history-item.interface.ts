export enum AuditState {
  playing,
  skipped,
  finished,
}

export interface AuditItem {
  id: number;
  username: string;
  text: string;
  source: 'youtube' | 'twitch' | 'tts-helper';
  createdAt: Date;
  state: AuditState;
}
