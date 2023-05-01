import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ConfigService } from 'src/app/shared/services/config.service';
import { HistoryService } from 'src/app/shared/services/history.service';
import { TtsType } from 'src/app/shared/state/config/config.interface';
import { AuditItem } from 'src/app/shared/state/history/history-item.interface';
import { nonNullFormControl } from 'src/app/shared/utils/form';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  ttsControl = nonNullFormControl('');
  selectedTts = nonNullFormControl<TtsType>('stream-elements');
  history: AuditItem[] = [];

  constructor(
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.configService.configTts$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tts) => {
        this.selectedTts.patchValue(tts, {
          emitEvent: false,
        });
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  selectTts(tts: TtsType) {
    this.selectedTts.setValue(tts);

    this.configService.updateTts(tts);
    this.configService.updateUrl(tts);
  }

  speak(): void {
    const { value } = this.ttsControl;
    this.ttsControl.setValue('');

    this.historyService.playTts(
      value ?? 'Oops no rizz!',
      '',
      'tts-helper',
      1000
    );
  }

  get isDisabled() {
    return this.ttsControl.value === '';
  }
}
