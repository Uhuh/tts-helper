import { StaticAuthProvider } from '@twurple/auth';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest, filter, first, map } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient, ChatUser } from '@twurple/chat';
import { AudioService } from './audio.service';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage } from './twitch-pubsub.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService } from './logs.service';
import { OpenAIService } from './openai.service';
import { ChatService } from './chat.service';

@Injectable()
export class TwitchPubSub {
  private readonly twitchService = inject(TwitchService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly openaiService = inject(OpenAIService);
  private readonly chatService = inject(ChatService);

  private readonly destroyRef = inject(DestroyRef);

  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;

  private readonly bitsSettings$ = this.twitchService.bitInfo$;
  private readonly redeemsSettings$ = this.twitchService.redeemInfo$;

  private readonly subscriptions$ = this.twitchService.subscriptions$;
  private readonly giftSettings$ = this.subscriptions$.pipe(map(s => s.gift));
  private readonly renewSettings$ = this.subscriptions$.pipe(map(s => s.renew));
  private readonly follower$ = this.twitchService.follower$;

  twitchSettings$ = this.twitchService.settings$;
  gptSettings$ = this.openaiService.settings$;

  constructor() {
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

        const { channelId } = channelInfo;

        this.logService.add(`Attempting to connect to Twitch chat.`, 'info', 'TwitchPubSub.constructor');

        const authProvider = new StaticAuthProvider(this.clientId, token);
        const apiClient = new ApiClient({ authProvider });

        this.listener = new EventSubWsListener({ apiClient });
        this.listener.start();

        this.chat = new ChatClient({
          authProvider,
          channels: [channelInfo.username],
        });

        this.chat.connect();

        this.chat.onMessage((_, _u, text, msg) => this.onMessage(msg.userInfo, text));
        this.listener.onChannelCheer(channelId, (cheer) => this.onBits(cheer));
        this.listener.onChannelFollow(channelId, channelId, (user) => this.onFollow(user));
        this.listener.onChannelRedemptionAdd(channelId, (c) => this.onRedeem(c));
        this.listener.onChannelSubscription(channelId, (sub) => this.onSub(sub));
        this.listener.onChannelSubscriptionGift(channelId, (gift) => this.onGiftSub(gift));
        this.listener.onChannelSubscriptionMessage(channelId, (message) => this.onSubMessage(message));
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

    // If the users message was a chat command, we don't want to potentially read it twice.
    if (playedMessage) {
      return;
    }

    combineLatest([this.twitchSettings$, this.gptSettings$])
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(([twitch, gpt]) => {
        const { randomChance } = twitch;

        this.chatService.randomChance(
          {
            text,
            displayName: user.displayName,
          },
          randomChance,
          gpt.enabled,
          'twitch',
        );
      });
  }

  onFollow(user: { userName: string, userDisplayName: string }) {
    this.follower$
      .pipe(first(), filter(f => f.enabled), takeUntilDestroyed(this.destroyRef))
      .subscribe(follower => {
        const parsedInput = follower.customMessage
          .replaceAll(/{username}/g, user.userName);

        this.audioService.playTts(
          parsedInput ?? '',
          user.userDisplayName,
          'twitch',
          999,
        );
      });
  }

  onSubMessage(message: TwitchSubMessage) {
    this.renewSettings$
      .pipe(first(), filter(renew => renew.enabled && !!message.messageText), takeUntilDestroyed(this.destroyRef))
      .subscribe(renew => {
        this.audioService.playTts(
          message.messageText,
          message.userDisplayName,
          'twitch',
          renew.characterLimit,
        );
      });
  }

  onGiftSub(gifter: TwitchGiftSub) {
    this.giftSettings$
      .pipe(first(), filter(gift => gift.enabled), takeUntilDestroyed())
      .subscribe(gift => {
        const parsedInput = gift.customMessage
          .replaceAll(/{username}/g, gifter.gifterDisplayName)
          .replaceAll(/{amount}/g, `${gifter.amount}`)
          .replaceAll(/{cumulative}/g, `${gifter.cumulativeAmount ?? `That's a secret!`}`);

        this.audioService.playTts(
          parsedInput ?? '',
          gifter.gifterDisplayName,
          'twitch',
          999,
        );
      });
  }

  onSub(sub: TwitchSub) {
    /**
     * Ignore users that received a gift sub
     */
    if (sub.isGift) {
      return;
    }

    this.renewSettings$
      .pipe(first(), filter(settings => settings.enabled))
      .subscribe(renew => {
        const parsedInput = renew.customMessage
          .replaceAll(/{username}/g, sub.userName)
          .replaceAll(/{tier}/g, `${sub.tier}`);

        this.audioService.playTts(
          parsedInput,
          sub.userDisplayName,
          'twitch',
          999,
        );
      });
  }

  onBits(cheer: TwitchCheer) {
    this.bitsSettings$
      .pipe(
        first(),
        filter(
          settings =>
            settings.enabled &&
            settings.exact
              ? cheer.bits === settings.minBits
              : settings.minBits <= cheer.bits,
        ),
      )
      .subscribe(bits => {
        const cleanedInput = cheer.message.replaceAll(/Cheer[0-9]+/g, '');

        this.audioService.playTts(
          cleanedInput,
          cheer.userDisplayName ?? '[ANONYMOUS]',
          'twitch',
          bits.bitsCharacterLimit,
        );
      });
  }

  onRedeem(redeem: TwitchRedeem) {
    const { rewardId, userDisplayName, input } = redeem;

    combineLatest([
      this.redeemsSettings$,
      this.gptSettings$,
    ])
      .pipe(first(), filter(([redeems, gpt]) => redeems.enabled || gpt.enabled))
      .subscribe(([redeems, gpt]) => {
        // Normal TTS.
        if (redeems.enabled && rewardId === redeems.redeem) {
          this.audioService.playTts(
            input || 'Haha! Someone forgot to say something.',
            userDisplayName,
            'twitch',
            redeems.redeemCharacterLimit,
          );
        }

        // If the streamer has GPT enabled, forward all TTS to ChatGPT.
        if (gpt.enabled && redeems.gptRedeem === rewardId) {
          this.openaiService.generateOpenAIResponse(userDisplayName, input);
        }
      });
  }

  cleanupListeners() {
    this.listener?.stop();
  }
}
