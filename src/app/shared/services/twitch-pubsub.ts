import { StaticAuthProvider } from '@twurple/auth';
import { Injectable, OnDestroy } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient, ChatUser } from '@twurple/chat';
import { HistoryService } from './history.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage, } from './twitch-pubsub.interface';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ConfigService } from './config.service';
import {
  ChatPermissions,
  GeneralChatState,
  GptChatState,
  GptPersonalityState,
  GptSettingsState
} from '../state/config/config.feature';
import { Configuration, OpenAIApi } from 'openai';
import { loreTemplateGenerator } from '../util/lore';

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

  // Default empty api key.
  apiKey = '';
  chatLore: { role: 'system', content: string }[] = [];
  chatGptConfig?: Configuration;
  chatGptApi?: OpenAIApi;
  gptHistory: { role: 'user' | 'assistant', content: string }[] = [];
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
    private readonly historyService: HistoryService,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar
  ) {
    this.configService.gptSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(gptSettings => this.gptSettings = gptSettings);

    this.configService.gptToken$
      .pipe(takeUntilDestroyed())
      .subscribe(apiKey => {
        if (!apiKey) {
          return console.info('Ignoring empty API key.');
        }

        this.apiKey = apiKey;

        this.chatGptConfig = new Configuration({ apiKey });
        this.chatGptApi = new OpenAIApi(this.chatGptConfig);
      });

    this.configService.gptPersonality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => {
        this.chatLore = [{
          role: 'system',
          content: loreTemplateGenerator(personality),
        }];
      });

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

        this.onMessageListener = this.chat.onMessage((_, _username, text, msg) => {
            this.onMessage(msg.userInfo, text);
          }
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

  async gptHandler(user: string, text: string) {
    if (
      !this.gptChat ||
      !this.chatGptApi
    ) {
      return;
    }

    const trimmedText = text.substring(this.gptChat.command.length).trim();
    const content = `${user} says "${trimmedText}"`;
    try {
      const response = await this.chatGptApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          ...this.chatLore,
          ...this.gptHistory,
          {
            role: 'user',
            content,
          },
        ],
      });

      const { message } = response.data.choices[0];

      if (!message || !message.content) {
        return console.info('OpenAI failed to respond.');
      }

      this.gptHistory.push({
        role: 'user',
        content,
      }, {
        role: 'assistant',
        content: message.content,
      });

      this.gptHistory = this.gptHistory.slice(-1 * (this.gptSettings?.historyLimit ?? 0));

      this.historyService.playTts(message.content, 'ChatGPT', 'gpt', this.gptChat.charLimit);
    } catch (e) {
      console.error(`Oopsies OpenAI died:`, e);
    }
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
      this.gptHandler(user.displayName, text)
        .catch(e => console.error(`Failed to handle GPT TTS.`, e));

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
        this.redeemInfo()?.redeemCharacterLimit ?? 100
      );
    }

    // If the streamer has GPT enabled, forward all TTS to ChatGPT.
    if (this.gptSettings?.enabled && this.redeemInfo()?.gptRedeem === rewardId) {
      this.gptHandler(userDisplayName, input || 'Haha! Someone forgot to say something.')
        .catch(e => console.error(`Failed to handle GPT redeem.`, e));
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
