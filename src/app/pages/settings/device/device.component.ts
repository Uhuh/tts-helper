import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { MatSliderModule } from '@angular/material/slider';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  devices: MediaDeviceInfo[] = [];
  selectedDevice = nonNullFormControl('');
  volume = nonNullFormControl(100);

  constructor(private readonly configService: ConfigService) {
    /**
     * @TODO - Handle user denies...
     * This should prompt the user once, if they accept it should remember
     */
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioDevices = devices.filter((d) => d.kind === 'audiooutput');
        this.devices = audioDevices;
      });
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
