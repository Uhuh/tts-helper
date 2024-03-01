import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppSettingsActions,
  AppSettingsFeature,
  AppSettingsFeatureState,
} from '../state/app-settings/app-settings.feature';

@Injectable()
export class AppSettingsService {
  private readonly store = inject(Store);
  readonly state$ = this.store.select(AppSettingsFeature.selectAppSettingsState);
  readonly connections$ = this.store.select(AppSettingsFeature.selectConnections);

  updateConnections(partialConnections: Partial<AppSettingsFeatureState['connections']>) {
    this.store.dispatch(AppSettingsActions.updateConnections({ partialConnections }));
  }
}