import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { VoiceSetting } from 'src/app/shared/state/config/config.interface';

@Component({
  selector: 'app-streamelement-tts',
  templateUrl: './streamelement-tts.component.html',
  styleUrls: ['./streamelement-tts.component.scss'],
})
export class StreamelementTtsComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  voiceControl = new FormControl('', { nonNullable: true });

  voiceOptions: VoiceSetting[] = [
    {
      url: '',
      voice: '',
      voiceQueryParam: '',
    },
  ];

  constructor(private readonly twitchService: TwitchService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
