import { createFeature, createReducer } from '@ngrx/store';

export interface VStreamState {
  verifier: string;
  token: string;
  channelInfo: {
    username: string;
  };
}

const initialState: VStreamState = {
  verifier: '',
  token: '',
  channelInfo: {
    username: '',
  },
};

export const VStreamFeature = createFeature({
  name: 'VStreamFeature',
  reducer: createReducer(initialState),
});