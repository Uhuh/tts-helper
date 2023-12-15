import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { FormControl, Validators } from '@angular/forms';
import { VStreamService } from '../../../shared/services/vstream.service';
import { debounceTime, filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, InputComponent, LabelBlockComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  randomChance = new FormControl(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(100)] });
  username = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  channelID = signal('');

  constructor(private readonly vstreamService: VStreamService) {
    this.vstreamService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.randomChance.setValue(settings.randomChance, { emitEvent: false });
      });

    this.vstreamService.channelInfo$
      .pipe(takeUntilDestroyed())
      .subscribe(channelInfo => {
        this.username.setValue(channelInfo.username, { emitEvent: false });
        this.channelID.set(channelInfo.channelId);
      });

    this.randomChance.valueChanges
      .pipe(filter(() => this.randomChance.valid))
      .subscribe(randomChance => this.vstreamService.updateSettings({ randomChance }));

    this.username.valueChanges
      .pipe(
        filter(() => this.username.valid),
        debounceTime(500),
        switchMap(username => this.vstreamService.updateChannelId(username)),
      )
      .subscribe(data => this.channelID.set(data.data.id));
  }
}
