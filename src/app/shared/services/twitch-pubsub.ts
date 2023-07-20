import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient } from '@twurple/chat';
import { HistoryService } from './history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage, } from './twitch-pubsub.interface';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;

  bitInfo = toSignal(this.twitchService.bitInfo$);
  redeemInfo = toSignal(this.twitchService.redeemInfo$);
  subsInfo = toSignal(this.twitchService.subsInfo$);

  // Twurple doesn't expose the listener type for some reason.
  onMessageListener?: any;
  redeemListener?: any;
  bitsListener?: any;

  // Subs listener
  subsListener?: any;
  giftSubListener?: any;
  subMessageListener?: any;

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
          (cheer) => this.onBits(cheer)
        );

        this.subsListener = this.listener.onChannelSubscription(
          channelInfo.channelId ?? '',
          (sub) => this.onSub(sub)
        );

        this.giftSubListener = this.listener.onChannelSubscriptionGift(
          channelInfo.channelId ?? '',
          (gift) => this.onGiftSub(gift)
        );

        this.subMessageListener = this.listener.onChannelSubscriptionMessage(
          channelInfo.channelId ?? '',
          (message) => this.onSubMessage(message)
        );

        this.onMessageListener = this.chat.onMessage((_, user, text) =>
          this.onMessage(user, text)
        );
      });
  }

  onMessage(user: string, text: string) {
    /**
     * @TODO - Setup state for global command and prefix.
     */
    if (text.startsWith('!say')) {
      this.historyService.playTts(text.substring(4).trim(), user, 'twitch', 50);
    }
  }

  onSubMessage(message: TwitchSubMessage) {
    if (!this.subsInfo()?.enabled || !message.messageText || !this.subsInfo()) {
      return;
    }

    this.historyService.playTts(
      message.messageText,
      message.userDisplayName,
      'twitch',
      this.subsInfo()?.subCharacterLimit ?? 300
    );
  }

  onGiftSub(gift: TwitchGiftSub) {
    if (!this.subsInfo()?.enabled) {
      return;
    }

    const parsedInput = this.subsInfo()?.giftMessage
                            .replaceAll(/{username}/g, gift.gifterDisplayName)
                            .replaceAll(/{amount}/g, `${gift.amount}`);

    this.historyService.playTts(
      parsedInput ?? '',
      gift.gifterDisplayName,
      'twitch',
      999
    );
  }

  /**
   * @TODO - Figure out if on subs need to trigger TTS or have custom messages
   */
  onSub(sub: TwitchSub) {
    return;
    /**
     * Ignore users that received a gift sub
     */
    if (!this.subsInfo()?.enabled || sub.isGift) {
      return;
    }

    this.historyService.playTts(
      'Thanks for the sub',
      sub.userDisplayName,
      'twitch',
      999
    );
  }

  onBits(cheer: TwitchCheer) {
    if (
      !this.bitInfo()?.enabled ||
      cheer.bits < (this.bitInfo()?.minBits ?? 100) ||
      (this.bitInfo()?.exact && cheer.bits !== this.bitInfo()?.minBits)
    ) {
      return;
    }

    const cleanedInput = cheer.message.replaceAll(/Cheer[0-9]+/g, '');

    this.historyService.playTts(
      cleanedInput,
      cheer.userDisplayName ?? '[ANONYMOUS]',
      'twitch',
      this.bitInfo()?.bitsCharacterLimit ?? 300
    );
  }

  onRedeem(redeem: TwitchRedeem) {
    if (
      redeem.rewardId !== this.redeemInfo()?.redeem ||
      !this.redeemInfo()?.enabled
    ) {
      return;
    }

    this.historyService.playTts(
      redeem.input,
      redeem.userDisplayName,
      'twitch',
      this.redeemInfo()?.redeemCharacterLimit ?? 100
    );
  }

  cleanupListeners() {
    this.chat?.removeListener(this.onMessageListener);
    this.listener?.removeListener(this.redeemListener);
    this.listener?.removeListener(this.bitsListener);
    this.listener?.removeListener(this.subsListener);
    this.listener?.removeListener(this.giftSubListener);
    this.listener?.removeListener(this.subMessageListener);
    this.listener?.stop();
  }

  ngOnDestroy() {
    this.cleanupListeners();
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
