import type { IpcApi } from '../shared/types';

export const MISSING_DESKTOP_BRIDGE_MESSAGE =
  'TTS Helper desktop bridge is unavailable. Open the app through Electron or the packaged desktop app.';

export function getTtsHelper(): IpcApi | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return (window as Window & { ttsHelper?: IpcApi }).ttsHelper ?? null;
}
