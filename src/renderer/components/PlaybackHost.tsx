import { useEffect, useRef } from 'react';
import { getTtsHelper } from '../api';

export function PlaybackHost() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentItemIdRef = useRef<string | null>(null);

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
      audio.src = item.audioUrl;
      void audio.play().catch((error) => {
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
