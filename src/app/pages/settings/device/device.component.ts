import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, take } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlaybackService } from 'src/app/shared/services/playback.service';
import { DeviceId, DeviceInfo, WithId } from 'src/app/shared/services/playback.interface';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import { TTSOption } from '../../../shared/components/tts-selector/tts-selector.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    MatSliderModule,
    LabelBlockComponent,
    SelectorComponent,
    InputComponent,
  ],
})
export class DeviceComponent {
  private readonly configService = inject(ConfigService);
  private readonly playbackService = inject(PlaybackService);

  readonly deviceOptions = signal<TTSOption[]>([]);
  readonly devices = signal<WithId<DeviceInfo, DeviceId>[]>([]);
  readonly selectedDevice = new FormControl(0, { nonNullable: true });
  readonly volume = new FormControl(100, { nonNullable: true });
  readonly audioDelay = new FormControl(0, { nonNullable: true, validators: [Validators.min(0)] });

  constructor() {
    this.playbackService.listOutputDevices().then((devices) => {
      this.devices.set(devices.outputDevices);
      this.deviceOptions.set(devices.outputDevices.map(d => ({ displayName: d.name, value: d.id })));
    });

    this.configService.selectedDevice$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe((device) =>
        this.selectedDevice.setValue(device, { emitEvent: false }),
      );

    this.configService.deviceVolume$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe((volume) =>
        this.volume.setValue(volume, { emitEvent: false }),
      );

    this.configService.audioDelay$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(audioDelay => this.audioDelay.setValue(audioDelay, { emitEvent: false }));

    this.selectedDevice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((device) => this.configService.updateSelectedDevice(device));

    this.volume.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(500))
      .subscribe((volume) => this.configService.updateDeviceVolume(volume));

    this.audioDelay.valueChanges
      .pipe(takeUntilDestroyed(), filter(() => this.audioDelay.valid))
      .subscribe(audioDelay => this.configService.updateAudioDelay(audioDelay));
  }
}
