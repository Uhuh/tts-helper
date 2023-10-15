import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { NgClass } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogService } from '../../shared/services/logs.service';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, ToggleComponent, LabelBlockComponent],
})
export class ModerationComponent {
  // Just to prevent streamers from showing bad words on stream
  hideBannedWords = new FormControl(true, { nonNullable: true });
  bannedWords = new FormControl('', { nonNullable: true });

  constructor(private readonly configService: ConfigService, private readonly logService: LogService) {
    this.configService.bannedWords$
      .pipe(takeUntilDestroyed())
      .subscribe((bannedWords) => {
        this.bannedWords.patchValue(bannedWords.join(','), {
          emitEvent: false,
        });
      });

    this.bannedWords.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(1000))
      .subscribe((bannedWords) => {
        this.logService.add(`Updating banned words list: ${bannedWords}`, 'info', 'ModerationComponent.bannedWords.valueChanges');
        this.configService.updateBannedWords(bannedWords.toLowerCase());
      });
  }
}

export default ModerationComponent;
