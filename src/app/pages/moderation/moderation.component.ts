import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogService } from '../../shared/services/logs.service';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { User } from 'microsoft-cognitiveservices-speech-sdk';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, ToggleComponent, LabelBlockComponent],
})
export class ModerationComponent {
  private readonly configService = inject(ConfigService);
  private readonly logService = inject(LogService);

  // Just to prevent streamers from showing bad words on stream
  readonly hideBannedWords = new FormControl(true, { nonNullable: true });
  readonly bannedWords = new FormControl('', { nonNullable: true });

  readonly userListSettings = new FormGroup({
    usernames: new FormControl('', { nonNullable: true }),
    shouldBlockUser: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
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

    this.configService.userListState$
      .pipe(takeUntilDestroyed())
      .subscribe(userListState => {
        this.userListSettings.setValue({
          shouldBlockUser: userListState.shouldBlockUser,
          usernames: userListState.usernames.join(','),
        });
      });

    this.userListSettings.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(500))
      .subscribe(() => {
        const settings = this.userListSettings.getRawValue();

        this.configService.updateUserList(settings);
      });
  }

  protected readonly User = User;
}

export default ModerationComponent;
