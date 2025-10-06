import { inject, Injectable } from '@angular/core';
import {
  AudioConfig,
  CancellationDetails,
  CancellationReason,
  ProfanityOption,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { LogService } from './logs.service';
import { Store } from '@ngrx/store';
import { AzureFeature, AzureState } from '../state/azure/azure.feature';
import { AzureActions } from '../state/azure/azure.actions';
import { combineLatest, filter, skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OpenAIService } from './openai.service';
import { TwitchService } from './twitch.service';

@Injectable()
export class AzureSttService {
  private readonly store = inject(Store);
  private readonly openaiService = inject(OpenAIService);
  private readonly logService = inject(LogService);
  private readonly twitchService = inject(TwitchService);
  private readonly snackbar = inject(MatSnackBar);

  public readonly subscriptionKey$ = this.store.select(AzureFeature.selectSubscriptionKey);
  public readonly region$ = this.store.select(AzureFeature.selectRegion);
  public readonly hotkey$ = this.store.select(AzureFeature.selectHotkey);
  public readonly thirdPartyUrl$ = this.store.select(AzureFeature.selectThirdPartyUrl);
  public readonly enabled$ = this.store.select(AzureFeature.selectEnabled);
  public readonly language$ = this.store.select(AzureFeature.selectLanguage);
  public readonly state$ = this.store.select(AzureFeature.selectAzureStateState);

  twitchUsername = '';
  speechConfig?: SpeechConfig;
  isEnabled = false;
  isCurrentlyListening = false;

  constructor() {
    combineLatest([
      this.subscriptionKey$,
      this.region$,
      this.language$,
    ]).pipe(takeUntilDestroyed(), skip(3))
      .subscribe(([
key,
region,
language,
]) => {
        if (!key || !region || !language) {
          this.logService.add(`Missing required values for speechConfig. ${JSON.stringify({
            key,
            region,
            language,
          })}`, 'error', 'AzureStt.constructor');

          return this.snackbar.open(
            `Missing required values for Azure STT.`,
            'Dismiss',
            {
              panelClass: 'notification-error',
            },
          );
        }

        this.snackbar.dismiss();
        this.speechConfig = SpeechConfig.fromSubscription(key, region);
        this.speechConfig.speechRecognitionLanguage = language;

        // This should be a setting eventually, but it lets swear words be caught in STT.
        this.speechConfig.setProfanity(ProfanityOption.Raw);
      });

    this.enabled$
      .pipe(takeUntilDestroyed())
      .subscribe(enabled => this.isEnabled = enabled);

    this.twitchService.channelInfo$
      .pipe(takeUntilDestroyed())
      .subscribe(channelInfo => this.twitchUsername = channelInfo.username);

    this.hotkey$
      .pipe(takeUntilDestroyed(), filter(hotkey => hotkey !== ''))
      .subscribe(hotkey => this.checkHotKey(hotkey));
  }

  async checkHotKey(hotkey: string) {
    /**
     * Due to the user being able to CTRL + R we need to re register it or else it'll break if they CTRL + R.
     */
    await unregister(hotkey);

    await register(hotkey, () => {
      this.captureSpeech();
    });
  }

  captureSpeech() {
    if (!this.isEnabled) {
      return this.logService.add(
        `HotKey triggered but Azure STT is currently not enabled.`,
        'info',
        'AzureStt.captureSpeech',
      );
    }

    if (this.isCurrentlyListening) {
      return this.logService.add(
        `Ignoring hotkey trigger, already listening to user.`,
        'info',
        'AzureStt.captureSpeech',
      );
    }

    if (!this.speechConfig) {
      this.logService.add(
        `Even though hotkey is registered, the Azure speechConfig is not initialized.`,
        'error',
        'AzureStt.captureSpeech',
      );

      return this.snackbar.open(
        `Missing required values for Azure STT.`,
        'Dismiss',
        {
          panelClass: 'notification-error',
        },
      );
    }

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const speechRecognizer = new SpeechRecognizer(this.speechConfig, audioConfig);

    // We're listening to the user.
    this.isCurrentlyListening = true;
    speechRecognizer.recognizeOnceAsync(result => {
      switch (result.reason) {
        case ResultReason.RecognizedSpeech: {
          const { text } = result;
          this.logService.add(`Recognized speech: Text => ${text}`, 'info', 'AzureStt.captureSpeech');

          this.sendRecognizedText(text);
          break;
        }
        case ResultReason.NoMatch: {
          this.logService.add(`Speech could not be recognized`, 'info', 'AzureStt.captureSpeech');
          break;
        }
        case ResultReason.Canceled: {
          const cancellation = CancellationDetails.fromResult(result);
          this.logService.add(`Speech canceled. Reason => ${cancellation.reason}`, 'info', 'AzureStt.captureSpeech');

          if (cancellation.reason == CancellationReason.Error) {
            this.logService.add(
              `Encountered an error, did you set the speech resource key and region values?.\n${JSON.stringify(cancellation, undefined, 2)}`,
              'error',
              'AzureStt.captureSpeech',
            );
          }
          break;
        }
      }

      // Close this immediately to prevent any running audio charges.
      speechRecognizer.close();
      this.isCurrentlyListening = false;
    }, (e) => {
      console.error(e);
      this.isCurrentlyListening = false;
      this.logService.add(`Failed to recognize users speech. ${JSON.stringify(e, null, 2)}`, 'error', 'AzureStt.captureSpeech');
    });
  }

  updateAzureState(partialState: Partial<AzureState>) {
    this.store.dispatch(AzureActions.updateAzureState({ partialState }));
  }

  async updateGlobalHotKey(hotkey: string) {
    const isHotkeyRegistered = await isRegistered(hotkey);

    if (isHotkeyRegistered) {
      return this.logService.add(`Hotkey ${hotkey} is already registered.`, 'info', 'AzureStt.updateGlobalHotKey');
    }

    return await register(hotkey, () => this.captureSpeech())
      .then(() => {
        this.logService.add(`Successfully registered hotkey ${hotkey}`, 'info', 'AzureStt.updateGlobalHotKey');
        this.store.dispatch(AzureActions.updateAzureState({
          partialState: {
            hotkey,
          },
        }));
      })
      .catch((error) => this.logService.add(`Failed to register hotkey ${hotkey} due to error.\n${JSON.stringify(error, undefined, 2)}`, 'error', 'AzureStt.updateGlobalHotKey'));
  }

  async clearGlobalHotKoy(hotkey: string) {
    await unregister(hotkey);

    this.updateAzureState({ hotkey: '' });
  }

  /**
   * Send Azure's recognized text to OpenAI to generate a response to the user.
   * @param text Azure's "recognized" text.
   * @private
   */
  private sendRecognizedText(text: string) {
    this.openaiService.playOpenAIResponse(this.twitchUsername, text);
  }
}