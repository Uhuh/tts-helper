import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient } from '@twurple/chat';
import { HistoryService } from './history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchCheer, TwitchRedeem } from './twitch-pubsub.interface';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;

  selectedRedeem: string | null = null;
  redeemCharLimit = 0;

  minBits = 0;
  bitsCharLimit = 0;

  // Twurple doesn't expose the listener type for some reason.
  onMessageListener?: any;
  redeemListener?: any;
  bitsListener?: any;

  constructor(
    private readonly twitchService: TwitchService,
    private readonly historyService: HistoryService,
    private readonly snackbar: MatSnackBar
  ) {
    combineLatest([
      this.twitchService.twitchToken$,
      this.twitchService.channelInfo$,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([token, channelInfo]) => {
        this.cleanupListeners();
        if (!token || !channelInfo.channelId) {
          return;
        }

        const authProvider = new StaticAuthProvider(this.clientId, token);
        const apiClient = new ApiClient({ authProvider });

        this.listener = new EventSubWsListener({ apiClient });
        this.listener.start();

        this.chat = new ChatClient({
          authProvider,
          channels: [channelInfo.username],
        });

        this.chat.connect().catch((e) => {
          console.error(`Failed to connect to chat.`, channelInfo, e);

          this.snackbar.open(
            'Oops! We encountered an error connecting to Twitch.',
            'Dismiss',
            {
              panelClass: 'notification-error',
            }
          );
        });

        this.redeemListener = this.listener.onChannelRedemptionAdd(
          channelInfo.channelId ?? '',
          (c) => this.onRedeem(c)
        );

        this.bitsListener = this.listener.onChannelCheer(
          channelInfo.channelId ?? '',
          (cheer) => this.onBits(cheer as TwitchCheer)
        );

        this.onMessageListener = this.chat.onMessage((_, user, text) =>
          this.onMessage(user, text)
        );
      });

    this.twitchService.redeem$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((redeem) => (this.selectedRedeem = redeem));

    this.twitchService.redeemCharLimit$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((charLimit) => (this.redeemCharLimit = charLimit));

    this.twitchService.minBits$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((minBits) => (this.minBits = minBits));

    this.twitchService.bitsCharLimit$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((bitsCharLimit) => (this.bitsCharLimit = bitsCharLimit));
  }

  onMessage(user: string, text: string) {
    /**
     * @TODO - Setup state for global command and prefix.
     */
    if (text.startsWith('!say')) {
      this.historyService.playTts(text.substring(4).trim(), user, 'twitch', 50);
    }
  }

  onBits(cheer: TwitchCheer) {
    if (cheer.bits >= this.minBits) {
      const cleanedInput = cheer.message.replaceAll(/Cheer[0-9]+/g, '');

      this.historyService.playTts(
        cleanedInput,
        cheer.userDisplayName,
        'twitch',
        this.bitsCharLimit ?? 300
      );
    }
  }

  onRedeem(redeem: TwitchRedeem) {
    if (redeem.rewardId === this.selectedRedeem) {
      this.historyService.playTts(
        redeem.input,
        redeem.userDisplayName,
        'twitch',
        this.redeemCharLimit ?? 300
      );
    }
  }

  cleanupListeners() {
    this.chat?.removeListener(this.onMessageListener);
    this.listener?.removeListener(this.redeemListener);
    this.listener?.stop();
  }

  ngOnDestroy() {
    this.cleanupListeners();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
