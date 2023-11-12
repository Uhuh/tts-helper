import { createFeature, createReducer, on } from '@ngrx/store';
import { AudioActions } from './audio.actions';
import { klona } from 'klona';

export interface AudioState {
  audioItems: AudioItem[];
}

export enum AudioStatus {
  queued,
  playing,
  skipped,
  finished,
}

export type AudioSource = 'youtube' | 'twitch' | 'tts-helper' | 'gpt' | 'azure';

export interface AudioItem {
  id: number;
  username: string;
  text: string;
  source: AudioSource;
  createdAt: Date;
  state: AudioStatus;
}

const initialState: AudioState = {
  audioItems: [],
};

export const AudioFeature = createFeature({
  name: 'AudioState',
  reducer: createReducer(
    initialState,
    on(AudioActions.updateAudioState, (state, { id, audioState }) => {
      const item = state.audioItems.find((a) => a.id === id);
      const items = klona(state.audioItems);

      if (!item) {
        return state;
      }

      const index = state.audioItems.indexOf(item);
      items[index].state = audioState;

      return {
        ...state,
        audioItems: [...items],
      };
    }),
    on(AudioActions.addAudioItem, (state, { audio }) => ({
      ...state,
      audioItems: [audio, ...state.audioItems],
    })),
    on(AudioActions.removeAudioItem, (state, { audioId }) => {
      const item = state.audioItems.find((a) => a.id === audioId);
      const items = klona(state.audioItems);

      if (!item) {
        return state;
      }

      const index = state.audioItems.indexOf(item);
      items.splice(index, 1);

      return {
        ...state,
        audioItems: [...items],
      };
    }),
  ),
});
