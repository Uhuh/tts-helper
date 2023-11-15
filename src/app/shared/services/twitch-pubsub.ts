import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient, ChatUser } from '@twurple/chat';
import { AudioService } from './audio.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage } from './twitch-pubsub.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ConfigService } from './config.service';
import {
  ChatPermissions,
  GeneralChatState,
  GptChatState,
  GptPersonalityState,
  GptSettingsState,
} from '../state/config/config.feature';
import { LogService } from './logs.service';
import { OpenaiService } from './openai.service';

@Injectable()
export class TwitchPubSub implements OnDestroy {
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;

  bitInfo = toSignal(this.twitchService.bitInfo$);
  redeemInfo = toSignal(this.twitchService.redeemInfo$);
  subsInfo = toSignal(this.twitchService.subsInfo$);

  // Normal TTS chat command
  generalChat?: GeneralChatState;

  // ChatGPT Settings
  gptChat?: GptChatState;
  gptSettings?: GptSettingsState;
  gptPersonality?: GptPersonalityState;

  gptOnCooldown = false;
  generalOnCooldown = false;

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
    private readonly historyService: AudioService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
    private readonly openaiService: OpenaiService,
    private readonly snackbar: MatSnackBar,
  ) {
    this.configService.gptSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(gptSettings => this.gptSettings = gptSettings);

    this.configService.generalChat$
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => this.generalChat = generalChat);

    this.configService.gptChat$
      .pipe(takeUntilDestroyed())
      .subscribe(gptChat => this.gptChat = gptChat);

    this.configService.gptPersonality$
      .pipe(takeUntilDestroyed())
      .subscribe(gptPersonality => this.gptPersonality = gptPersonality);

    combineLatest([
      this.twitchService.twitchToken$,
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

  hasChatCommandPermissions(user: ChatUser, permissions: ChatPermissions) {
    if (permissions.allUsers) {
      return true;
    } else if (permissions.mods && user.badges.has('moderator')) {
      return true;
    } else if (permissions.payingMembers && user.isSubscriber) {
      return true;
    }

    return false;
  }

  async onMessage(user: ChatUser, text: string) {
    // If both chat commands are disabled ignore.
    if (!this.generalChat?.enabled && !this.gptChat?.enabled) {
      return;
    }

    if (this.generalChat?.enabled &&
      text.startsWith(this.generalChat.command) &&
      this.hasChatCommandPermissions(user, this.generalChat.permissions) &&
      !this.generalOnCooldown
    ) {
      const trimmedText = text.substring(this.generalChat.command.length).trim();
      this.historyService.playTts(trimmedText, user.displayName, 'twitch', this.generalChat.charLimit);

      // Handle cooldown if there is any.
      this.generalOnCooldown = true;
      setTimeout(() => this.generalOnCooldown = false, this.generalChat.cooldown * 1000);
    } else if (this.gptChat?.enabled &&
      text.startsWith(this.gptChat.command) &&
      this.hasChatCommandPermissions(user, this.gptChat.permissions) &&
      !this.gptOnCooldown
    ) {
      this.openaiService.gptHandler(user.displayName, text)
        .catch(e => {
          this.logService.add(
            `Failed to handle GPT request { user: ${user.displayName}, text: '${text}' } \n ${e}`,
            'error',
            'TwitchPubSub.onMessage.gptHandler',
          );
        });

      // Handle cooldown if there is any.
      this.gptOnCooldown = true;
      setTimeout(() => this.gptOnCooldown = false, this.gptChat.cooldown * 1000);
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

    this.historyService.playTts(
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

    this.historyService.playTts(
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

    this.historyService.playTts(
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
      this.historyService.playTts(
        input || 'Haha! Someone forgot to say something.',
        userDisplayName,
        'twitch',
        this.redeemInfo()?.redeemCharacterLimit ?? 100,
      );
    }

    // If the streamer has GPT enabled, forward all TTS to ChatGPT.
    if (this.gptSettings?.enabled && this.redeemInfo()?.gptRedeem === rewardId) {
      this.openaiService.gptHandler(userDisplayName, input || 'Haha! Someone forgot to say something.')
        .catch(e => {
          this.logService.add(`Failed to generate OpenAI response for Twitch redeem.\n${e}`, 'error', 'TwitchPubSub.onRedeem');
        });
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
