import { createFeature, createReducer, on } from '@ngrx/store';
import { AzureActions } from './azure.actions';

export interface AzureState {
  enabled: boolean;
  subscriptionKey: string;
  region: string;
  language: string;
  hotkey: string;
  thirdPartyUrl: string;
}

export const initialState: AzureState = {
  enabled: false,
  hotkey: '',
  region: '',
  language: '',
  subscriptionKey: '',
  thirdPartyUrl: '',
};

export const AzureFeature = createFeature({
  name: 'AzureState',
  reducer: createReducer(
    initialState,
    on(AzureActions.updateAzureState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
  ),
});