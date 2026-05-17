import { useEffect, useRef } from 'react';
import type { TtsSettings } from '../../shared/types';
import { getTtsHelper } from '../api';

interface Props {
  settings?: TtsSettings;
}

type SinkAudioElement = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
  sinkId?: string;
};

export function PlaybackHost({ settings }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentItemIdRef = useRef<string | null>(null);
  const settingsRef = useRef<TtsSettings | null>(settings ?? null);

  useEffect(() => {
    settingsRef.current = settings ?? null;
    const audio = audioRef.current;
    if (audio) {
      void applyAudioSettings(audio, settingsRef.current);
    }
  }, [settings]);

  useEffect(() => {
    const api = getTtsHelper();
    if (!api) {
      return undefined;
    }

    const removeItemListener = api.onPlaybackItem(({ item }) => {
      const audio = audioRef.current;
      if (!audio || !item.audioUrl) {
        void api.rendererFailed({
          itemId: item.id,
          reason: 'No audio element or audio URL available.',
        });
        return;
      }

      currentItemIdRef.current = item.id;
      void playAudio(audio, item.audioUrl, settingsRef.current).catch((error) => {
        void api.rendererFailed({
          itemId: item.id,
          reason: error instanceof Error ? error.message : String(error),
        });
      });
    });

    const removeControlListener = api.onPlaybackControl(({ command }) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      if (command === 'pause') {
        audio.pause();
      } else if (command === 'resume') {
        void audio.play().catch(() => undefined);
      } else if (command === 'stop') {
        currentItemIdRef.current = null;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    });

    return () => {
      removeItemListener();
      removeControlListener();
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      hidden
      onEnded={() => {
        const itemId = currentItemIdRef.current;
        currentItemIdRef.current = null;
        const api = getTtsHelper();
        if (itemId && api) {
          void api.rendererFinished({ itemId });
        }
      }}
      onError={() => {
        const itemId = currentItemIdRef.current;
        currentItemIdRef.current = null;
        const api = getTtsHelper();
        if (itemId && api) {
          void api.rendererFailed({ itemId, reason: 'Audio element failed to play the file.' });
        }
      }}
    />
  );
}

async function playAudio(audio: HTMLAudioElement, src: string, settings: TtsSettings | null): Promise<void> {
  await applyAudioSettings(audio, settings);
  audio.src = src;
  await audio.play();
}

async function applyAudioSettings(audio: HTMLAudioElement, settings: TtsSettings | null): Promise<void> {
  audio.muted = settings ? !settings.monitorAudioEnabled : false;

  const sinkId = settings?.monitorOutputDeviceId || 'default';
  const sinkAudio = audio as SinkAudioElement;
  if (typeof sinkAudio.setSinkId === 'function' && sinkAudio.sinkId !== sinkId) {
    try {
      await sinkAudio.setSinkId(sinkId);
    } catch {
      // Keep playback alive even if the selected output device disappears.
    }
  }
}
