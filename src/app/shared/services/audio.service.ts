import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from './config.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlaybackService } from './playback.service';
import { RequestAudioData } from './playback.interface';

import { getSynthesizeSpeechUrl } from '@aws-sdk/polly-request-presigner';
import { PollyClient } from '@aws-sdk/client-polly';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { AudioFeature, AudioItem, AudioSource, AudioStatus } from '../state/audio/audio.feature';
import {
  AmazonPollyData,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType
} from '../state/config/config.feature';
import { AudioActions } from '../state/audio/audio.actions';
import { LogService } from './logs.service';
import { combineLatest, map } from 'rxjs';

@Injectable()
export class AudioService {
  public readonly audioItems$ = this.store.select(AudioFeature.selectAudioItems);
  public readonly queuedItems$ = this.audioItems$
    .pipe(map(items => items.filter(i => i.state === AudioStatus.queued)));

  bannedWords: string[] = [];

  tts: TtsType = 'stream-elements';
  streamElements!: StreamElementsData;
  ttsMonster!: TtsMonsterData;
  amazonPolly!: AmazonPollyData;
  tikTok!: TikTokData;

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar,
    private readonly playback: PlaybackService,
    private readonly logService: LogService,
  ) {

    combineLatest([
      this.configService.configTts$,
      this.configService.bannedWords$,
      this.configService.streamElements$,
      this.configService.ttsMonster$,
      this.configService.amazonPolly$,
      this.configService.tikTok$,
    ]).pipe(takeUntilDestroyed())
      .subscribe(([tts, bannedWords, streamElements, ttsMonster, amazonPolly, tikTok]) => {
        this.tts = tts;
        this.bannedWords = bannedWords;
        this.streamElements = streamElements;
        this.ttsMonster = ttsMonster;
        this.amazonPolly = amazonPolly;
        this.tikTok = tikTok;
      });

    this.playback.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(id => this.store.dispatch(AudioActions.updateAudioState({ id, audioState: AudioStatus.playing })));

    this.playback.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(id => this.store.dispatch(AudioActions.updateAudioState({ id, audioState: AudioStatus.finished })));
  }

  requeue(audio: AudioItem) {
    /**
     * @TODO - Determine if not having a character limit on requeue is good or bad.
     */
    this.playTts(audio.text, audio.username, audio.source, 1000);
  }

  async playTts(
    text: string,
    username: string,
    source: AudioSource,
    charLimit: number
  ) {
    if (this.bannedWords.find((w) => text.toLowerCase().includes(w))) {
      return;
    }

    // Trim played audio down, but keep full message in case stream wants to requeue it.
    const audioText = text.substring(0, charLimit);
    const data = await this.getRequestData(audioText);

    if (!data) {
      this.snackbar.open(
        'Hey! You tried playing audio to a TTS service we don\'t support!',
        'Dismiss',
        {
          panelClass: 'notification-error',
        }
      );
      return console.error(
        `Tried to get request data for invalid TTS: ${this.tts}`
      );
    }

    this.playback
      .playAudio({ data })
      .then((id) => {
        this.logService.add(`Played TTS.\n${JSON.stringify({
          ...data,
          username,
          audioText,
          charLimit
        }, null, 1)}`, 'info', 'HistoryService.playTts');

        this.addAudio({
          id,
          createdAt: new Date(),
          source,
          text,
          username,
          state: AudioStatus.queued,
        });
      })
      .catch((e) => {
        this.logService.add(`Failed to play TTS. \n ${JSON.stringify(e)}`, 'error', 'AudioService.playTts');

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
        const url = await this.handleAmazonPolly(text);

        // If there was an issue getting the audio url.
        if (!url) {
          return null;
        }

        return {
          type: 'amazonPolly',
          url,
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

  addAudio(audio: AudioItem) {
    return this.store.dispatch(AudioActions.addAudioItem({ audio }));
  }

  removeAudio(audioId: number) {
    return this.store.dispatch(AudioActions.removeAudioItem({ audioId }));
  }

  updateAudio(id: number, audioState: AudioStatus) {
    return this.store.dispatch(AudioActions.updateAudioState({ id, audioState }));
  }
}