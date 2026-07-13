import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { FormControl, FormRecord } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { LogService } from '../../shared/services/logs.service';
import { CONNECTION_REGISTRY, ConnectionKind } from '../../shared/state/app-settings/app-settings.feature';

@Component({
  selector: 'app-app-settings',
  imports: [CommonModule, LabelBlockComponent, ToggleComponent],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
})
export class AppSettingsComponent {
  readonly #appSettingsService = inject(AppSettingsService);
  readonly #logService = inject(LogService);

  readonly appVersion$ = fromPromise(getVersion());
  readonly tauriVersion$ = fromPromise(getTauriVersion());

  readonly isAutostartEnabled = new FormControl(false, { nonNullable: true });

  readonly connections = Object.values(CONNECTION_REGISTRY);

  readonly settings = new FormRecord<FormControl<boolean>>(
    Object.fromEntries(
      Object.keys(CONNECTION_REGISTRY).map((kind) => [
        kind,
        new FormControl(false, { nonNullable: true }),
      ]),
    ) as Record<ConnectionKind, FormControl<boolean>>,
  );

  constructor() {
    this.#appSettingsService.connections$
      .pipe(takeUntilDestroyed())
      .subscribe((connections) => {
        this.settings.reset(connections, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((settings) => {
        this.#appSettingsService.updateConnections(settings);
      });

    isEnabled()
      .then((enabled) => this.isAutostartEnabled.patchValue(enabled))
      .catch((e) => {
        this.isAutostartEnabled.patchValue(false);
        this.#logService.add(
          `Failed to determine if autostart is enabled. ${JSON.stringify(e)}`,
          'error',
          'AppSettingsComponent.constructor',
        );
      });

    this.isAutostartEnabled.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((enabled) => {
        if (enabled) {
          enable();
        } else {
          disable();
        }
      });
  }
}

export default AppSettingsComponent;