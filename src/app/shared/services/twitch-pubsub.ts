import { StaticAuthProvider } from '@twurple/auth';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { TwitchService } from './twitch.service';
import { combineLatest, filter, first, map, tap } from 'rxjs';
import { ApiClient } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatClient, ChatUser } from '@twurple/chat';
import { AudioService } from './audio.service';
import { TwitchCheer, TwitchGiftSub, TwitchRedeem, TwitchSub, TwitchSubMessage } from './twitch-pubsub.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogService } from './logs.service';
import { OpenAIService } from './openai.service';
import { ChatService } from './chat.service';
import { ConfigService } from './config.service';
import { TtsType } from '../state/config/config.feature';
import stream_elements from '../json/stream-elements.json';
import tiktok_voices from '../json/tiktok.json';

@Injectable()
export class TwitchPubSub {
  private readonly twitchService = inject(TwitchService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly openaiService = inject(OpenAIService);
  private readonly chatService = inject(ChatService);
  private readonly configService = inject(ConfigService);

  private readonly destroyRef = inject(DestroyRef);

  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';

  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;
  apiClient: ApiClient | null = null;
  isStreamerLive = false;

  private readonly bitsSettings$ = this.twitchService.bitInfo$;
  private readonly redeemsSettings$ = this.twitchService.redeemInfo$;

  private readonly subscriptions$ = this.twitchService.subscriptions$;
  private readonly giftSettings$ = this.subscriptions$.pipe(map(s => s.gift));
  private readonly renewSettings$ = this.subscriptions$.pipe(map(s => s.renew));
  private readonly follower$ = this.twitchService.follower$;

  private readonly twitchSettings$ = this.twitchService.settings$;
  private readonly gptSettings$ = this.openaiService.settings$;

  constructor() {
    combineLatest([
      this.twitchService.token$,
      this.twitchService.channelInfo$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(async ([token, channelInfo]) => {
        this.cleanupListeners();
        if (!token || !channelInfo.channelId) {
          return;
        }

        const { channelId } = channelInfo;

        this.logService.add(`Attempting to connect to Twitch chat.`, 'info', 'TwitchPubSub.constructor');

        const authProvider = new StaticAuthProvider(this.clientId, token);
        const apiClient = new ApiClient({ authProvider });
        // This will be used to send messages as the streamer.
        this.apiClient = apiClient;

        this.listener = new EventSubWsListener({ apiClient });
        this.listener.start();

        this.chat = new ChatClient({
          authProvider,
          channels: [channelInfo.username],
        });

        this.chat.connect();

        const streamer = await apiClient.users.getUserByName(channelInfo.username).catch();
        const stream = await streamer?.getStream();

        /**
         * If the user decides to open TTS Helper AFTER they started streaming, let's see if they're live to record
         * the stream date.
         */
        if (stream?.type === 'live') {
          this.chatService.logStreamStart();
          this.isStreamerLive = true;
        }

        this.chat.onMessage((_, _u, text, msg) => {
          /**
           * Only record user messages when the streamer is actually streaming.
           */
          if (this.isStreamerLive) {
            this.chatService.handleWatchStreak({
              id: msg.userInfo.userId,
              displayName: msg.userInfo.displayName,
              isSubscriber: msg.userInfo.isSubscriber || msg.userInfo.isVip,
            });
          }

          this.handleMessage(msg.userInfo, text);
        });
        this.listener.onChannelCheer(channelId, (cheer) => this.handleBits(cheer));
        this.listener.onChannelFollow(channelId, channelId, (user) => this.handleFollow(user));
        this.listener.onChannelRedemptionAdd(channelId, (c) => this.handleRedeem(c));
        this.listener.onChannelSubscription(channelId, (sub) => this.handleSub(sub));
        this.listener.onChannelSubscriptionGift(channelId, (gift) => this.handleGiftSub(gift));
        this.listener.onChannelSubscriptionMessage(channelId, (message) => this.handleSubMessage(message));
        this.listener.onStreamOnline(channelId, () => {
          this.isStreamerLive = true;
          this.chatService.logStreamStart();
        });
      });
  }

  async handleMessage(user: ChatUser, text: string) {
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

    // chatService.onMessage already checks this but it's not exposed here so...
    const canProceed = await this.audioService.canProcessMessage(text, user.displayName);

    // If the users message was a chat command, we don't want to potentially read it twice.
    if (playedMessage || !canProceed) {
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

  handleFollow(user: { userName: string, userDisplayName: string }) {
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

  handleSubMessage(message: TwitchSubMessage) {
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

  handleGiftSub(gifter: TwitchGiftSub) {
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

  handleSub(sub: TwitchSub) {
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

  handleBits(cheer: TwitchCheer) {
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

  handleRedeem(redeem: TwitchRedeem) {
    this.handleCustomUserVoiceRedeem(redeem);
    this.handleRedeemTts(redeem);
    this.handleRedeemVision(redeem);
  }

  private handleRedeemVision(redeem: TwitchRedeem) {
    const { rewardId, userDisplayName: username } = redeem;

    this.openaiService.vision$
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        tap(vision => {
          const { twitchRedeemId } = vision;

          if (rewardId !== twitchRedeemId) {
            return;
          }

          this.logService.add(`User [${username}] redeemed vision.`, 'info', 'TwitchPubSub.handleRedeemVision');

          this.openaiService.captureScreen();
        }),
      )
      .subscribe();
  }

  /**
   * If set, users from a stream can setup their own TTS voice options.
   * @param redeem Any redeem coming from Twitch
   * @private
   */
  private handleCustomUserVoiceRedeem(redeem: TwitchRedeem) {
    const { rewardId, userDisplayName: username, input } = redeem;

    combineLatest([
      this.configService.customUserVoiceRedeem$,
      this.configService.customUserVoices$,
    ])
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        map(([redeemId, voices]) => ({
          redeemId,
          existingVoiceSettings: voices.find(v => v.username.toLowerCase() === username.toLowerCase()),
        })),
      )
      .subscribe(userVoicesOptions => {
        const { redeemId, existingVoiceSettings } = userVoicesOptions;

        if (rewardId !== redeemId) {
          return;
        }

        const [tts, userLang, userVoice] = input.split(/\s*,\s*/g);
        let ttsType: TtsType = 'stream-elements';

        this.logService.add(`User is setting custom voice. ${JSON.stringify({
          tts,
          userLang,
          userVoice,
        })}`, 'info', 'TwitchPubSub.handleCustomUserVoiceRedeem');

        if (!userLang || !userVoice) {
          return this.logService.add(`User passed in invalid lang or voice options: ${JSON.stringify({
              tts,
              userLang,
              userVoice,
            })}`,
            'error',
            'TwitchPubSub.handleCustomUserVoiceRedeem',
          );
        }

        // Default to SE for now, might ignore request in the future.
        switch (tts.toLowerCase()) {
          case 'tiktok':
          case 'tik-tok':
            ttsType = 'tiktok';
            break;
          case 'stream-elements':
          case 'streamelements':
          default:
            ttsType = 'stream-elements';
        }

        // Never trust users, validate it and get either default or assumed values
        const voices = ttsType === 'tiktok' ? tiktok_voices : stream_elements;
        const { language, voice } = this.validateTtsSelection(voices, userLang, userVoice);

        this.logService.add(`Validated TTS selection: ${JSON.stringify({
          ttsType,
          language,
          voice,
        })}`, 'info', 'TwitchPubSub.handleCustomUserVoiceRedeem');

        const options = {
          ttsType,
          voice,
          language,
          username,
        };

        if (existingVoiceSettings) {
          this.configService.updateCustomUserVoice(existingVoiceSettings.id, options);
        } else {
          this.configService.createCustomUserVoice(options);
        }
      });
  }

  private validateTtsSelection(
    voices: {
      language: string,
      options: { displayName: string, value: string }[]
    }[],
    langToCheck: string,
    voiceToCheck: string,
  ) {
    // StreamElements doesn't have English first... but meh.
    const defaultLang = voices[0].language;
    const defaultVoice = voices[0].options[0].value;

    for (const { language, options } of voices) {
      if (!language.toLowerCase().startsWith(langToCheck.toLowerCase())) {
        continue;
      }

      const voice = options.find(o =>
        o.displayName.toLowerCase().startsWith(voiceToCheck.toLowerCase()),
      )?.value;

      // If the voice is somehow wrong, break out and just give the user the default.
      if (!voice) {
        break;
      }

      return {
        language,
        voice,
      };
    }

    return {
      language: defaultLang,
      voice: defaultVoice,
    };
  }

  private handleRedeemTts(redeem: TwitchRedeem) {
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
