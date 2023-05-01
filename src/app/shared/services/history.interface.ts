import { AuditSource } from '../state/history/history-item.interface';

export interface TtsOptions {
  id?: number;
  audioText: string;
  text: string;
  source: AuditSource;
  username: string;
  params?: [string, string][];
  auditId?: number;
}
