import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuditItems } from '../state/history/history.selectors';
import {
  AuditItem,
  AuditSource,
  AuditState,
} from '../state/history/history-item.interface';
import {
  addHistory,
  removeHistory,
  updateHistoryStatus,
} from '../state/history/history.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from './config.service';
import {
  AmazonPollyData,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType,
} from '../state/config/config.interface';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlaybackService } from './playback.service';
import { RequestAudioData } from './playback.interface';
import { getSynthesizeSpeechUrl } from '@aws-sdk/polly-request-presigner';
import { PollyClient } from '@aws-sdk/client-polly';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

@Injectable()
export class HistoryService {
  public readonly auditItems$ = this.store.select(selectAuditItems);
  bannedWords: string[] = [];

  tts: TtsType = 'stream-elements';
  deviceId = '';
  deviceVolume = 100;
  streamElements!: StreamElementsData;
  ttsMonster!: TtsMonsterData;
  amazonPolly!: AmazonPollyData;
  tikTok!: TikTokData;

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar,
    private readonly playback: PlaybackService
  ) {
    this.configService.configTts$
      .pipe(takeUntilDestroyed())
      .subscribe((tts) => (this.tts = tts));

    this.configService.deviceVolume$
      .pipe(takeUntilDestroyed())
      .subscribe((volume) => (this.deviceVolume = volume));

    this.configService.selectedDevice$
      .pipe(takeUntilDestroyed())
      .subscribe((device) => (this.deviceId = device));

    this.configService.bannedWords$
      .pipe(takeUntilDestroyed())
      .subscribe((bannedWords) => (this.bannedWords = bannedWords));

    this.configService.streamElements$
      .pipe(takeUntilDestroyed())
      .subscribe((streamElements) => (this.streamElements = streamElements));

    this.configService.ttsMonster$
      .pipe(takeUntilDestroyed())
      .subscribe((ttsMonster) => (this.ttsMonster = ttsMonster));

    this.configService.amazonPolly$
      .pipe(takeUntilDestroyed())
      .subscribe((amazonPolly) => (this.amazonPolly = amazonPolly));

    this.configService.tikTok$
      .pipe(takeUntilDestroyed())
      .subscribe((tikTok) => (this.tikTok = tikTok));

    this.playback.audioFinished$.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.store.dispatch(
        updateHistoryStatus({
          id,
          auditState: AuditState.finished,
        })
      );
    });
  }

  requeue(audit: AuditItem) {
    /**
     * @TODO - Determine if not having a character limit on requeue is good or bad.
     */
    this.playTts(audit.text, audit.username, audit.source, 1000);
  }

  async playTts(
    text: string,
    username: string,
    source: AuditSource,
    charLimit: number
  ) {
    if (this.bannedWords.find((w) => text.toLowerCase().includes(w))) {
      return;
    }

    // Trim played audio down, but keep full message in case stream wants to requeue it.
    const audioText = text.substring(0, charLimit);
    const data = await this.getRequestData(audioText);

    if (!data) {
      return console.error(
        `Tried to get request data for invalid TTS: ${this.tts}`
      );
    }

    this.playback
      .playAudio({ data })
      .then((id) => {
        this.addHistory({
          id,
          createdAt: new Date(),
          source,
          text,
          username,
          state: AuditState.playing,
        });
      })
      .catch((e) => {
        console.error(`Error playing TTS`, e);
        this.snackbar.open(
          'Oops! We encountered an error while playing that.',
          'Dismiss',
          {
            panelClass: 'notification-error',
          }
        );
      });
  }

  private async getRequestData(text: string): Promise<RequestAudioData | null> {
    switch (this.tts) {
      case 'stream-elements':
        return {
          type: 'streamElements',
          voice: this.streamElements.voice,
          text,
        };
      case 'tiktok':
        return {
          type: 'tikTok',
          voice: this.tikTok.voice,
          text,
        };
      case 'amazon-polly':
        return {
          type: 'amazonPolly',
          url: await this.handleAmazonPolly(text),
        };
      default:
        return null;
    }
  }

  async handleAmazonPolly(audioText: string) {
    if (!this.amazonPolly.poolId) {
      this.snackbar.open(
        `Oops! You didn't provide a Pool ID for Amazon Polly.`,
        'Dismiss',
        {
          panelClass: 'notification-error',
        }
      );
      return;
    }

    const pollyParams = {
      OutputFormat: 'mp3',
      SampleRate: '22050',
      Text: audioText,
      TextType: 'text',
      VoiceId: this.amazonPolly.voice,
    };

    try {
      const url = await getSynthesizeSpeechUrl({
        client: new PollyClient({
          region: this.amazonPolly.region,
          credentials: fromCognitoIdentityPool({
            clientConfig: {
              region: this.amazonPolly.region,
            },
            identityPoolId: this.amazonPolly.poolId,
          }),
        }),
        params: pollyParams,
      });

      return url.toString();
    } catch (e) {
      this.snackbar.open(
        `Oops! We had issues communicating with Polly!`,
        'Dismiss',
        {
          panelClass: 'notification-error',
        }
      );

      console.error('Failed to get Amazon Polly url', e);

      return null;
    }
  }

  addHistory(audit: AuditItem) {
    return this.store.dispatch(addHistory({ audit }));
  }

  removeHistory(auditId: number) {
    return this.store.dispatch(removeHistory({ auditId }));
  }

  updateHistory(id: number, auditState: AuditState) {
    return this.store.dispatch(updateHistoryStatus({ id, auditState }));
  }
}
