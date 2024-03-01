import { TestBed } from '@angular/core/testing';

import { AppSettingsService } from './app-settings.service';
import { StoreModule } from '@ngrx/store';
import { AppSettingsFeature } from '../state/app-settings/app-settings.feature';

describe('AppSettingsService', () => {
  let service: AppSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(AppSettingsFeature),
      ],
      providers: [AppSettingsService],
    });
    service = TestBed.inject(AppSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
