import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlaybackService } from 'src/app/shared/services/playback.service';
import { DeviceId, DeviceInfo, WithId, } from 'src/app/shared/services/playback.interface';

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
  ],
})
export class DeviceComponent {
  devices = signal<WithId<DeviceInfo, DeviceId>[]>([]);
  selectedDevice = new FormControl(0, { nonNullable: true });
  volume = new FormControl(100, { nonNullable: true });

  constructor(
    private readonly configService: ConfigService,
    private readonly playbackService: PlaybackService
  ) {
    this.playbackService.listOutputDevices().then((devices) => {
      this.devices.set(devices.outputDevices);
    });

    this.configService.selectedDevice$
      .pipe(takeUntilDestroyed())
      .subscribe((device) =>
        this.selectedDevice.patchValue(device, { emitEvent: false })
      );

    this.configService.deviceVolume$
      .pipe(takeUntilDestroyed())
      .subscribe((volume) =>
        this.volume.patchValue(volume, { emitEvent: false })
      );

    this.selectedDevice.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((device) => this.configService.updateSelectedDevice(device));

    this.volume.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(500))
      .subscribe((volume) => this.configService.updateDeviceVolume(volume));
  }
}
