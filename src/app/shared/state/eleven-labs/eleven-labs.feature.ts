import { createFeature, createReducer, on } from '@ngrx/store';
import { ElevenLabsActions } from './eleven-labs.actions';
import { ElevenLabsModel, ElevenLabsVoice } from '../../api/eleven-labs/eleven-labs.interface';

export interface ElevenLabsState {
  apiKey: string;
  voiceId: string;
  voices: ElevenLabsVoice[];
  modelId: string;
  models: ElevenLabsModel[];
}

const initialState: ElevenLabsState = {
  apiKey: '',
  voiceId: '',
  voices: [],
  modelId: '',
  models: [],
};

export const ElevenLabsFeature = createFeature({
  name: 'ElevenLabs',
  reducer: createReducer(
    initialState,
    on(ElevenLabsActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
  ),
});