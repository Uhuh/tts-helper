import { StaticAuthProvider } from '@twurple/auth';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient, ChatUser } from '@twurple/chat';
import { AudioService } from './audio.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage } from './twitch-pubsub.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LogService } from './logs.service';
import { OpenAIService } from './openai.service';
import { GptSettingsState } from '../state/openai/openai.feature';
import { TwitchSettingsState } from '../state/twitch/twitch.feature';
import { ChatService } from './chat.service';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly twitchService = inject(TwitchService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly openaiService = inject(OpenAIService);
  private readonly chatService = inject(ChatService);
  private readonly snackbar = inject(MatSnackBar);

  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;

  readonly bitInfo = toSignal(this.twitchService.bitInfo$);
  readonly redeemInfo = toSignal(this.twitchService.redeemInfo$);
  readonly subsInfo = toSignal(this.twitchService.subsInfo$);

  // Normal TTS chat command
  twitchSettings!: TwitchSettingsState;

  // ChatGPT Settings
  gptSettings!: GptSettingsState;

  // Twurple doesn't expose the listener type for some reason.
  onMessageListener?: any;
  redeemListener?: any;
  bitsListener?: any;

  // Subs listener
  subsListener?: any;
  giftSubListener?: any;
  subMessageListener?: any;

  constructor() {
    this.openaiService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.gptSettings = settings);

    this.twitchService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.twitchSettings = settings);

    combineLatest([
      this.twitchService.token$,
      this.twitchService.channelInfo$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([token, channelInfo]) => {
        this.cleanupListeners();
        if (!token || !channelInfo.channelId) {
          return;
        }

        this.logService.add(`Attempting to connect to Twitch chat.`, 'info', 'TwitchPubSub.constructor');

        const authProvider = new StaticAuthProvider(this.clientId, token);
        const apiClient = new ApiClient({ authProvider });

        this.listener = new EventSubWsListener({ apiClient });
        this.listener.start();

        this.chat = new ChatClient({
          authProvider,
          channels: [channelInfo.username],
        });

        this.chat.connect().catch((e) => {
          this.logService.add(`Failed to connect to Twitch chat.\n${e}`, 'error', 'TwitchPubSub.chat.connect');

          this.snackbar.open(
            'Oops! We encountered an error connecting to Twitch.',
            'Dismiss',
            {
              panelClass: 'notification-error',
            },
          );
        });

        this.redeemListener = this.listener.onChannelRedemptionAdd(
          channelInfo.channelId ?? '',
          (c) => this.onRedeem(c),
        );

        this.bitsListener = this.listener.onChannelCheer(
          channelInfo.channelId ?? '',
          (cheer) => this.onBits(cheer),
        );

        this.subsListener = this.listener.onChannelSubscription(
          channelInfo.channelId ?? '',
          (sub) => this.onSub(sub),
        );

        this.giftSubListener = this.listener.onChannelSubscriptionGift(
          channelInfo.channelId ?? '',
          (gift) => this.onGiftSub(gift),
        );

        this.subMessageListener = this.listener.onChannelSubscriptionMessage(
          channelInfo.channelId ?? '',
          (message) => this.onSubMessage(message),
        );

        this.onMessageListener = this.chat.onMessage((_, _username, text, msg) => {
            this.onMessage(msg.userInfo, text);
          },
        );
      });
  }

  async onMessage(user: ChatUser, text: string) {
    const playedMessage = await this.chatService.onMessage(
      {
        text,
        displayName: user.displayName,
        permissions: {
          isBroadcaster: user.isBroadcaster,
          isMod: user.badges.has('moderator'),
          isPayingMember: user.isSubscriber,
        },
      },
      'twitch',
    );

    const { randomChance } = this.twitchSettings;

    if (!playedMessage && randomChance) {
      this.chatService.randomChance(
        {
          text,
          displayName: user.displayName,
        },
        randomChance,
        this.gptSettings.enabled,
        'twitch',
      );
    }
  }

  onSubMessage(message: TwitchSubMessage) {
    if (!this.subsInfo()?.enabled || !message.messageText || !this.subsInfo()) {
      return;
    }

    this.audioService.playTts(
      message.messageText,
      message.userDisplayName,
      'twitch',
      this.subsInfo()?.subCharacterLimit ?? 300,
    );
  }

  onGiftSub(gift: TwitchGiftSub) {
    if (!this.subsInfo()?.enabled) {
      return;
    }

    const parsedInput = this.subsInfo()?.giftMessage
      .replaceAll(/{username}/g, gift.gifterDisplayName)
      .replaceAll(/{amount}/g, `${gift.amount}`);

    this.audioService.playTts(
      parsedInput ?? '',
      gift.gifterDisplayName,
      'twitch',
      999,
    );
  }

  /**
   * @TODO - Figure out if on subs need to trigger TTS or have custom messages
   */
  onSub(sub: TwitchSub) {
    /**
     * Ignore users that received a gift sub
     */
    if (!this.subsInfo()?.enabled || sub.isGift) {
      return;
    }

    this.audioService.playTts(
      'Thanks for the sub',
      sub.userDisplayName,
      'twitch',
      999,
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

    this.audioService.playTts(
      cleanedInput,
      cheer.userDisplayName ?? '[ANONYMOUS]',
      'twitch',
      this.bitInfo()?.bitsCharacterLimit ?? 300,
    );
  }

  onRedeem(redeem: TwitchRedeem) {
    const { rewardId, userDisplayName, input } = redeem;

    // Normal TTS.
    if (
      rewardId === this.redeemInfo()?.redeem &&
      this.redeemInfo()?.enabled
    ) {
      this.audioService.playTts(
        input || 'Haha! Someone forgot to say something.',
        userDisplayName,
        'twitch',
        this.redeemInfo()?.redeemCharacterLimit ?? 100,
      );
    }

    // If the streamer has GPT enabled, forward all TTS to ChatGPT.
    if (this.gptSettings?.enabled && this.redeemInfo()?.gptRedeem === rewardId) {
      this.openaiService.generateOpenAIResponse(userDisplayName, input, true);
    }
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
  }
}
