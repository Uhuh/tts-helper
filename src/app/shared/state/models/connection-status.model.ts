import { ConnectionStatus } from '../app-settings/app-settings.feature';

export interface ConnectionStatusSnapshot {
  status: ConnectionStatus;
  tooltip?: string;
}