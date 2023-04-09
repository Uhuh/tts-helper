export interface AuditItem {
  username: string;
  text: string;
  source: 'youtube' | 'twitch';
  createdAt: Date;
}
