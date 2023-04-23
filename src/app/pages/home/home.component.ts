import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuditItem } from 'src/app/shared/state/history/history-item.interface';
import { HistoryService } from 'src/app/shared/services/history.service';
import { nonNullFormControl } from 'src/app/shared/utils/form';
import { ConfigService } from 'src/app/shared/services/config.service';
import { Subject, takeUntil } from 'rxjs';
import { TtsType } from 'src/app/shared/state/config/config.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  ttsControl = nonNullFormControl('');
  selectedTts = nonNullFormControl<TtsType>('stream-elements');
  history: AuditItem[] = [];

  constructor(
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.configService.voiceSettingsTts$
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
