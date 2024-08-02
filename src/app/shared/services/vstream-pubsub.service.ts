import { DestroyRef, inject, Injectable } from '@angular/core';
import { VStreamService } from './vstream.service';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import {
  VStreamEventChatCreated,
  VStreamEventLivestreamStartedEvent,
  VStreamEventMeteorShower,
  VStreamEventNewFollower,
  VStreamEvents,
  VStreamEventSubscriptionGifted,
  VStreamEventSubscriptionRenew,
  VStreamEventUpLift,
} from './vstream-pubsub.interface';
import { ChatService } from './chat.service';
import {
  VStreamChannelState,
  VStreamCustomMessageState,
  VStreamSettingsState,
  VStreamSubscriptionSettingsState,
} from '../state/vstream/vstream.feature';
import { OpenAIService } from './openai.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GptSettingsState } from '../state/openai/openai.feature';
import { LogService } from './logs.service';
import { AudioService } from './audio.service';
import { CommandService } from './command.service';
import { Commands } from './command.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class VStreamPubSubService {
  private readonly vstreamService = inject(VStreamService);
  private readonly commandService = inject(CommandService);
  private readonly openaiService = inject(OpenAIService);
  private readonly chatService = inject(ChatService);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  private socketUrl = 'wss://events.vstream.com/channels';
  vstreamSocket$ = webSocket(this.socketUrl);

  vstreamOverlaysSocket$ = webSocket(`ws://localhost:37391`);

  commands$ = this.vstreamService.commands$;

  channelInfo!: VStreamChannelState;

  vstreamSettings!: VStreamSettingsState;
  upliftSettings!: VStreamCustomMessageState;
  subscriptionSettings!: VStreamSubscriptionSettingsState;
  meteorShowerSettings!: VStreamCustomMessageState;
  followerSettings!: VStreamCustomMessageState;

  // ChatGPT Settings
  gptSettings!: GptSettingsState;

  constructor() {
    combineLatest([
      this.vstreamService.meteorShowerSettings$,
      this.vstreamService.subscriptionSettings$,
      this.vstreamService.upliftSettings$,
      this.vstreamService.followerSettings$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([meteorShower, subscription, uplift, follower]) => {
        this.meteorShowerSettings = meteorShower;
        this.subscriptionSettings = subscription;
        this.upliftSettings = uplift;
        this.followerSettings = follower;
      });

    this.openaiService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.gptSettings = settings);

    this.vstreamService.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.vstreamSettings = settings);

    combineLatest([this.vstreamService.token$, this.vstreamService.channelInfo$])
      .pipe(
        takeUntilDestroyed(),
        filter(([token, channelInfo]) => (!!token.accessToken && token.expireDate > Date.now()) && !!channelInfo.channelId),
        switchMap(([token, channelInfo]) => {
          this.channelInfo = channelInfo;

          return this.vstreamService.authenticatePubSub(token.accessToken);
        }),
      )
      .subscribe({
        next: token => {
          this.logService.add(`Authenticated PubSub, attempted WS connection.`, 'info', 'VStreamPubSub.socket.authenticatePubSub');

          this.vstreamSocket$.unsubscribe();

          this.vstreamSocket$ = webSocket(`${this.socketUrl}/${this.channelInfo.channelId}/events?authorization=${token.data.token}`);

          this.vstreamSocket$.subscribe({
            next: (event) => this.handleEvent(event as VStreamEvents),
            error: e => this.logService.add(`VStreamPubSub socket error: ${JSON.stringify(e, null, 2)}`, 'error', 'VStreamPubSub.socket.subscribe'),
          });
        },
        error: err => {
          this.logService.add(`Failed to authenticate with pubsub. ${JSON.stringify(err, null, 2)}`, 'error', 'VStreamPubSub.authenticatePubSub');
        },
      });

    this.connect();
  }

  private connect() {
    this.vstreamOverlaysSocket$ = webSocket(`ws://localhost:37391`);

    this.vstreamOverlaysSocket$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          setTimeout(() => this.connect(), 3000);
        },
      });
  }

  handleEvent(event: VStreamEvents) {
    this.logService.add(`Message received: ${JSON.stringify(event, undefined, 2)}`, 'info', 'VStreamPubSub.onEvent');

    switch (event.type) {
      case 'chat_created':
        this.handleChatMessage(event);
        break;
      case 'uplifting_chat_sent':
        this.handleUpLift(event);
        break;
      case 'new_follower':
        this.handleFollower(event);
        break;
      case 'subscriptions_gifted':
        this.handleGiftSub(event);
        break;
      case 'subscription_renewed':
        this.handleSubRenew(event);
        break;
      case 'shower_received':
        this.handleMeteorShower(event);
        break;
      case 'livestream_started':
        this.handleLiveStream(event);
        break;
      default:
        return;
    }
  }

  handleCustomMessage(text: string, username: string, settings: Pick<VStreamCustomMessageState, 'enabled' | 'enabledChat' | 'enabledGpt'>) {
    const { enabledChat, enabledGpt, enabled } = settings;

    if (!text) {
      return;
    }

    if (enabledGpt) {
      this.openaiService.generateOpenAIResponse(username, text);
    } else if (enabled) {
      this.audioService.playTts(
        text,
        username,
        'vstream',
        99999,
      );
    }

    if (enabledChat) {
      this.vstreamService.postChannelMessage(text);
    }
  }

  async handleUpLift(uplift: VStreamEventUpLift) {
    const { customMessage } = this.upliftSettings;
    const { amount: { formatted }, sender: { username }, message: { text } } = uplift.data;

    const parsedInput = customMessage
      .replaceAll(/{formatted}/g, formatted)
      .replaceAll(/{text}/g, text)
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput ?? text, username, this.upliftSettings);

    const event = {
      id: 'tts-helper',
      event: 'uplifting_chat_sent',
      eventData: {
        username,
        formatted,
        text,
      },
    };

    this.vstreamOverlaysSocket$.next(event);
  }

  async handleFollower(follower: VStreamEventNewFollower) {
    const { customMessage } = this.followerSettings;
    const { username } = follower.data;

    const parsedInput = customMessage
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput, username, this.followerSettings);

    const event = {
      id: 'tts-helper',
      event: 'new_follower',
      eventData: {
        username,
      },
    };

    this.vstreamOverlaysSocket$.next(event);
  }

  async handleGiftSub(gift: VStreamEventSubscriptionGifted) {
    const { customMessage } = this.subscriptionSettings.gifted;
    const { tier, gifter: { username }, subscribers } = gift.data;

    const amount = subscribers.length;

    const parsedInput = customMessage
      .replaceAll(/{tier}/g, `${tier}`)
      .replaceAll(/{amount}/g, `${amount}`)
      .replaceAll(/{gifter}/g, username);

    this.handleCustomMessage(parsedInput, username, this.subscriptionSettings.gifted);

    const event = {
      id: 'tts-helper',
      event: 'subscriptions_gifted',
      eventData: {
        tier,
        amount,
        gifter: username,
      },
    };

    this.vstreamOverlaysSocket$.next(event);
  }

  async handleSubRenew(renew: VStreamEventSubscriptionRenew) {
    const { customMessage } = this.subscriptionSettings.renew;
    const { tier, streakMonth, renewalMonth, message, subscriber: { username } } = renew.data;

    const subMessage = message?.text ?? '';
    const parsedInput = customMessage
      .replaceAll(/{tier}/g, `${tier}`)
      .replaceAll(/{streakMonth}/g, `${streakMonth}`)
      .replaceAll(/{renewalMonth}/g, `${renewalMonth}`)
      .replaceAll(/{text}/g, subMessage)
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput ?? subMessage, username, this.subscriptionSettings.renew);

    const event = {
      id: 'tts-helper',
      event: 'subscription_renewed',
      eventData: {
        tier,
        streakMonth,
        renewalMonth,
        text: subMessage,
        username,
      },
    };

    this.vstreamOverlaysSocket$.next(event);
  }

  async handleMeteorShower(meteorShower: VStreamEventMeteorShower) {
    const { customMessage } = this.meteorShowerSettings;
    const { data: { audienceSize, sender: { username }, senderVideo: { title, description } } } = meteorShower;

    const parsedInput = customMessage
      .replaceAll(/{username}/g, username)
      .replaceAll(/{size}/g, `${audienceSize}`)
      .replaceAll(/{title}/g, title)
      .replaceAll(/{description}/g, description);

    this.handleCustomMessage(parsedInput, username, this.meteorShowerSettings);

    const event = {
      id: 'tts-helper',
      event: 'shower_received',
      eventData: {
        username,
        size: audienceSize,
        title,
        description,
      },
    };

    this.vstreamOverlaysSocket$.next(event);
  }

  async handleChatMessage(chat: VStreamEventChatCreated) {
    const {
      data: {
        badges,
        text,
        chatter,
      },
    } = chat;

    const isBroadcaster = !!badges.find(b => b.id === 'streamer');
    const isPayingMember = !!badges.find(b => b.type === 'channel');
    const isMod = !!badges.find(b => b.id === 'moderator');

    const permissions = {
      isBroadcaster,
      isPayingMember,
      isMod,
    };

    /**
     * If the users message was a !say or !ask command, this checks if it was played or not.
     */
    const playedMessage = await this.chatService.onMessage(
      {
        text,
        displayName: chatter.displayName,
        permissions,
      },
      'vstream',
    );

    const { randomChance } = this.vstreamSettings;

    if (!playedMessage && randomChance && !isBroadcaster) {
      this.chatService.randomChance(
        {
          text,
          displayName: chatter.displayName,
        },
        randomChance,
        this.gptSettings.enabled,
        'vstream',
      );
    }

    this.commands$
      .pipe(
        first(),
        map(commands => commands.filter(c => !!c.command).find(c => text.startsWith(c.command))),
        filter((command): command is Commands => !!command && !!command.command && command.enabled),
      )
      .subscribe(command => {
        this.logService.add(`User "${chatter.displayName}" ran a chat command "${command.command}"`, 'info', 'VStreamPubSub.handleChatMessage');

        this.commandService.handleCommand(command, permissions, text);
      });
  }

  async handleLiveStream(livestream: VStreamEventLivestreamStartedEvent) {
    // This isn't a great validator
    if (!this.vstreamSettings.discordWebhook) {
      return;
    }

    const { data } = livestream;

    const thumbnailURL = `https://images.vstream.com/videos/${data.id}.png`;
    const tags = data.tags.length ? `\n\n${data.tags.map(t => `#${t}`).join(' ')}` : '';
    const description = data.description ?? `Come watch me.`;

    const params = {
      username: `VStream live notification.`,
      embeds: [
        {
          title: data.title ?? `I'm live on VStream!`,
          type: 'rich',
          description: description + tags,
          color: 15258703,
          url: data.url,
          footer: {
            text: 'Sent from TTS Helper.',
          },
          image: {
            url: thumbnailURL,
            // Not what proxy is for, but we'll keep it for now.
            proxy_url: 'https://vstream.com/build/_assets/default-preview-MUL2QTIW.png',
          },
        },
      ],
    };

    this.http.post(this.vstreamSettings.discordWebhook, params)
      .subscribe({
        next: () => {
          this.logService.add(`Sent livestream notification through webhook.`, 'info', 'VStreamPubSubService.handleLiveStream');
        },
        error: (err) => {
          this.logService.add(`Failed to send webhook message: ${JSON.stringify(err, null, 2)}.`, 'error', 'VStreamPubSubService.handleLiveStream');
        },
      });
  }

  testOverlays() {
    const shower = {
      id: 'tts-helper',
      event: 'shower_received',
      eventData: {
        username: 'Alphyx',
        size: 5,
        title: 'Blah',
        description: 'yurr',
      },
    };

    const sub = {
      id: 'tts-helper',
      event: 'subscription_renewed',
      eventData: {
        tier: 1,
        streakMonth: 1,
        renewalMonth: 1,
        text: 'Hello',
        username: 'Alphyx',
      },
    };

    const gift = {
      id: 'tts-helper',
      event: 'subscriptions_gifted',
      eventData: {
        tier: 1,
        amount: 3,
        gifter: 'Alphyx',
      },
    };

    const follow = {
      id: 'tts-helper',
      event: 'new_follower',
      eventData: {
        username: 'Alphyx',
      },
    };

    const uplift = {
      id: 'tts-helper',
      event: 'uplifting_chat_sent',
      eventData: {
        username: 'Alphyx',
        formatted: '$10',
        text: 'Thanks for streaming!',
      },
    };

    this.vstreamOverlaysSocket$.next(shower);
    this.vstreamOverlaysSocket$.next(sub);
    this.vstreamOverlaysSocket$.next(gift);
    this.vstreamOverlaysSocket$.next(follow);
    this.vstreamOverlaysSocket$.next(uplift);
  }
}
