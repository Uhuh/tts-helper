import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogService } from './logs.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AzureFeature, AzureState } from '../state/azure/azure.feature';
import { combineLatest, skip } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfanityOption, SpeechConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { TwitchService } from './twitch.service';
import { AzureActions } from '../state/azure/azure.actions';

/**
 * This service is more-or-less being used to access the data that's from the Azure STT side since they use the same credentials.
 * This is my lazy solution to get around the circular dependencies while not having this logic in AudioService
 */
@Injectable({ providedIn: 'root' })
export class AzureTtsService {
  private readonly store = inject(Store);
  private readonly snackbar = inject(MatSnackBar);
  private readonly logService = inject(LogService);
  private readonly twitchService = inject(TwitchService);

  public readonly subscriptionKey$ = this.store.select(AzureFeature.selectSubscriptionKey);
  public readonly region$ = this.store.select(AzureFeature.selectRegion);
  public readonly language$ = this.store.select(AzureFeature.selectLanguage);
  public readonly state$ = this.store.select(AzureFeature.selectAzureStateState);

  twitchUsername = '';
  speechConfig?: SpeechConfig;

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
          })}`, 'error', 'AzureTts.constructor');

          return this.snackbar.open(
            `Missing required values for Azure TTS.`,
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

        console.log(this.speechConfig);
      });

    this.twitchService.channelInfo$
      .pipe(takeUntilDestroyed())
      .subscribe(channelInfo => this.twitchUsername = channelInfo.username);
  }

  updatePartialState(partialState: Partial<AzureState>) {
    this.store.dispatch(AzureActions.updateAzureState({ partialState }));
  }
}