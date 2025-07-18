import { DestroyRef, inject, Injectable } from '@angular/core';
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
  CustomUserVoice,
  MultiVoice,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType,
} from '../state/config/config.feature';
import { AudioActions } from '../state/audio/audio.actions';
import { LogService } from './logs.service';
import { combineLatest, first, firstValueFrom, map } from 'rxjs';
import { ElevenLabsState } from '../state/eleven-labs/eleven-labs.feature';
import { ElevenLabsService } from './eleven-labs.service';
import { TwitchSettingsState } from '../state/twitch/twitch.feature';
import { TwitchService } from './twitch.service';
import { SynthesizeSpeechInput } from '@aws-sdk/client-polly/dist-types/models/models_0';
import { listen } from '@tauri-apps/api/event';

@Injectable()
export class AudioService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly playback = inject(PlaybackService);
  private readonly elevenLabsService = inject(ElevenLabsService);
  private readonly twitchService = inject(TwitchService);
  private readonly logService = inject(LogService);
  private readonly userListState$ = this.configService.userListState$;
  private readonly customUserVoices$ = this.configService.customUserVoices$;
  private readonly multiVoices$ = this.configService.multiVoices$;

  public readonly audioItems$ = this.store.select(AudioFeature.selectAudioItems);

  bannedWords: string[] = [];

  chaosMode = false;

  tts: TtsType = 'stream-elements';
  streamElements!: StreamElementsData;
  ttsMonster!: TtsMonsterData;
  amazonPolly!: AmazonPollyData;
  tikTok!: TikTokData;
  elevenLabs!: ElevenLabsState;
  twitchSettings!: TwitchSettingsState;

  constructor() {
    this.configService.audioSettings$
      .pipe(takeUntilDestroyed())
      .subscribe((audioSettings) => {
        const { tts, bannedWords, streamElements, ttsMonster, amazonPolly, tikTok } = audioSettings;
        this.tts = tts;
        this.bannedWords = bannedWords;
        this.streamElements = streamElements;
        this.ttsMonster = ttsMonster;
        this.amazonPolly = amazonPolly;
        this.tikTok = tikTok;
      });

    this.configService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(({ chaosMode }) => this.chaosMode = chaosMode);

    this.twitchService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.twitchSettings = settings);

    this.elevenLabsService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(elevenLabs => this.elevenLabs = elevenLabs);

    this.playback.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(id => this.store.dispatch(AudioActions.updateAudioState({ id, audioState: AudioStatus.playing })));

    this.playback.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(id => this.store.dispatch(AudioActions.updateAudioState({ id, audioState: AudioStatus.finished })));

    listen('api:play_tts', (event) => {
      const data = event.payload as { username: string, platform: AudioSource, text: string, charLimit: number };

      this.playTts(data.text, data.username, data.platform, data.charLimit);
    }).catch(e => {
      this.logService.add(`Failed to play tts for api request. ${JSON.stringify(e, null, 2)}`, 'error', 'AudioService.listen(api:play_tts)');
    });
  }

  requeue(audio: AudioItem) {
    /**
     * @TODO - Determine if not having a character limit on requeue is good or bad.
     */
    this.playTts(audio.text, audio.username, audio.source, 1000, true);
  }

  playTts(
    text: string,
    username: string,
    source: AudioSource,
    charLimit: number,
    canPlayOverride = false,
  ) {
    combineLatest([this.customUserVoices$, this.multiVoices$, this.audioItems$])
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(async ([customUserVoices, allowedMultiVoices]) => {
        const canProceed = canPlayOverride ? canPlayOverride : await this.canProcessMessage(text, username);

        if (!canProceed) {
          return;
        }

        if (this.chaosMode) {
          this.playback.skipCurrentlyPlaying();
        }

        // Trim played audio down, but kept a full message in case stream wants to requeue it.
        const audioText = text.substring(0, charLimit);
        const multiVoices = this.parseMultiVoices(audioText, allowedMultiVoices);
        const customUserVoice = customUserVoices.find(u => u.username.toLowerCase() === username.toLowerCase());

        // If we couldn't parse out any multi voices, let's assume it's a normal TTS request.
        if (!multiVoices.length) {
          const data = await this.getRequestData(audioText, customUserVoice);

          return await this.playAudio(data, {
            username,
            text,
            source,
            charLimit,
          });
        }

        // Otherwise... let's hope it WAS a multivoice request.
        for (const { text, voice, ttsType } of multiVoices) {
          const data = await this.getRequestData(text, { voice, ttsType });

          await this.playAudio(data, {
            username,
            text,
            source,
            charLimit,
          });
        }
      });
  }

  canProcessMessage(text: string, username: string) {
    return firstValueFrom(
      this.userListState$
        .pipe(
          first(),
          takeUntilDestroyed(this.destroyRef),
          map(userListState => {
            if (this.bannedWords.find((w) => text.toLowerCase().includes(w))) {
              this.logService.add(`Ignoring message as it contained a banned word. Username: ${username} | Content: ${text}`, 'info', 'AudioService.playTts');
              return false;
            }

            const isUserInList = userListState.usernames.includes(username.toLowerCase());
            if (userListState.shouldBlockUser && isUserInList ||
              !userListState.shouldBlockUser && !isUserInList
            ) {
              this.logService.add(`Ignoring message as the user is not valid for the block/allow list. Username: ${username}`, 'info', 'AudioService.playTts');
              return false;
            }

            return true;
          }),
        ),
    );
  }

  private async playAudio(
    data: RequestAudioData | null,
    { username, charLimit, source, text }: { username: string, charLimit: number, source: AudioSource, text: string },
  ) {
    if (!data) {
      this.snackbar.open(
        `Failed to grab the required data for TTS service: ${this.tts}!`,
        'Dismiss',
        {
          panelClass: 'notification-error',
        },
      );

      return this.logService.add(`Tried to get request data for invalid TTS: ${this.tts}`, 'error', 'AudioService.playTts');
    }

    return this.playback
      .playAudio({ data })
      .then((id) => {
        this.logService.add(`Played TTS.\n${JSON.stringify({
          ...data,
          username,
          charLimit,
        }, null, 1)}`, 'info', 'AudioService.playTts');

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
          },
        );
      });
  }

  private parseMultiVoices(text: string, allowedMultiVoices: MultiVoice[]) {
    /**
     * To handle users doing the following:
     * (brian): Hello world I'm Brian! (ivy): My name is Ivy. (shadow): And I'm Shadow!
     */
    const regex = /\((?<speaker>\w+)\):\s*(?<message>[^(]*)/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      /**
       * What if a user want to use the default voice at the start?
       * EX: Hello world I'm default! (brian): Hello world I'm Brian!
       */
      if (!matches.length && match.index > 0) {
        matches.push({
          voice: undefined,
          text: text.substring(0, match.index),
        });
      }

      const speaker = match.groups?.['speaker'].toLowerCase();
      const multiVoice = allowedMultiVoices.find(m => m.customName.toLowerCase() === speaker);

      const voice = speaker === 'default' || !multiVoice ? undefined : multiVoice.voice;

      matches.push({ voice, text: match.groups?.['message'] ?? '', ttsType: multiVoice?.ttsType });
    }

    return matches;
  }

  playSoundFile(fileURL: string) {
    const base64EncodedPart = fileURL.split(',')[1];

    this.playback.playAudio({
      data: {
        type: 'raw',
        data: base64EncodedPart,
      },
    }).catch(e => {
      this.logService.add(`Failed to play sound file. \n ${JSON.stringify(e)}`, 'error', 'AudioService.playSoundFile');

      this.snackbar.open(
        'Oops! Issue playing sound file.',
        'Dismiss',
        {
          panelClass: 'notification-error',
        },
      );
    });
  }

  private async getRequestData(text: string, customUserVoice?: Partial<CustomUserVoice>): Promise<RequestAudioData | null> {
    const tts = customUserVoice?.ttsType ?? this.tts;

    switch (tts) {
      case 'stream-elements':
        return {
          type: 'streamElements',
          voice: customUserVoice?.voice ?? this.streamElements.voice,
          text,
        };
      case 'tiktok':
        return {
          type: 'tikTok',
          voice: customUserVoice?.voice ?? this.tikTok.voice,
          text,
        };
      case 'amazon-polly': {
        const url = await this.handleAmazonPolly(text);

        // If there was an issue getting the audio url.
        if (!url) {
          return null;
        }

        return {
          type: 'amazonPolly',
          url,
        };
      }
      case 'eleven-labs': {
        const url = `${this.elevenLabsService.apiUrl}/text-to-speech/${customUserVoice?.voice ?? this.elevenLabs.voiceId}`;

        return {
          type: 'elevenLabs',
          url,
          text,
          api_key: this.elevenLabs.apiKey,
          model_id: this.elevenLabs.modelId,
          // default values
          stability: 0.5,
          similarity_boost: 0.5,
        };
      }
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
        },
      );
      return;
    }

    const pollyParams = {
      OutputFormat: 'mp3',
      SampleRate: '22050',
      Text: audioText,
      TextType: 'text',
      VoiceId: this.amazonPolly.voice,
    } satisfies SynthesizeSpeechInput;

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
        },
      );

      this.logService.add(`Failed to get Amazon Polly url.\n${JSON.stringify(e)}`, 'error', 'AudioService.handleAmazonPolly');

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
