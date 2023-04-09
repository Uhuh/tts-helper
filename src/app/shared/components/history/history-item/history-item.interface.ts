export interface AuditItem {
  id: number;
  username: string;
  text: string;
  source: 'youtube' | 'twitch';
  createdAt: Date;
  skipped: boolean;
}
