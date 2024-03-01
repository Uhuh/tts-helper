import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, ToggleComponent],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
})
export class AppSettingsComponent {
  private readonly appSettingsService = inject(AppSettingsService);

  readonly appVersion$ = fromPromise(getVersion());
  readonly tauriVersion$ = fromPromise(getTauriVersion());

  readonly settings = new FormGroup({
    vstreamEnabled: new FormControl(false, { nonNullable: true }),
    twitchEnabled: new FormControl(false, { nonNullable: true }),
    vtubestudioEnabled: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.appSettingsService.connections$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.settings.reset(settings, { emitEvent: false }));

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.appSettingsService.updateConnections(settings));
  }
}

export default AppSettingsComponent;