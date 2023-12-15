import { Injectable } from '@angular/core';
import { VStreamService } from './vstream.service';
import { combineLatest, filter, switchMap } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import {
  VStreamEventChatCreated,
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

@Injectable({
  providedIn: 'root',
})
export class VStreamPubSubService {
  private socketUrl = 'wss://events.vstream.com/channels';
  vstreamSocket = webSocket(this.socketUrl);

  channelInfo!: VStreamChannelState;

  vstreamSettings!: VStreamSettingsState;
  upliftSettings!: VStreamCustomMessageState;
  subscriptionSettings!: VStreamSubscriptionSettingsState;
  meteorShowerSettings!: VStreamCustomMessageState;
  followerSettings!: VStreamCustomMessageState;

  // ChatGPT Settings
  gptSettings!: GptSettingsState;

  constructor(
    private readonly vstreamService: VStreamService,
    private readonly openaiService: OpenAIService,
    private readonly chatService: ChatService,
    private readonly audioService: AudioService,
    private readonly logService: LogService,
  ) {
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
        filter(([token, channelInfo]) => (!!token.accessToken && token.expireDate > Date.now()) && !!channelInfo.channelId),
        switchMap(([token, channelInfo]) => {
          this.channelInfo = channelInfo;

          return this.vstreamService.authenticatePubSub(token.accessToken);
        }),
      )
      .subscribe(token => {
        this.vstreamSocket.complete();

        this.vstreamSocket = webSocket(`${this.socketUrl}/${this.channelInfo.channelId}/events?authorization=${token.data.token}`);

        this.vstreamSocket.subscribe({
          next: (event) => this.handleEvent(event as VStreamEvents),
          error: e => console.error(e),
        });
      });
  }

  handleEvent(event: VStreamEvents) {
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
      default:
        return;
    }

    this.logService.add(`Message received: ${JSON.stringify(event, undefined, 2)}`, 'info', 'VStreamPubSub.onEvent');
  }

  handleCustomMessage(text: string, enabled: boolean, enabledGpt: boolean, username: string) {
    // If no custom message is setup, or if both TTS options are disabled, ignore the event.
    if (!text || (!enabled && !enabledGpt)) {
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
  }

  async handleUpLift(uplift: VStreamEventUpLift) {
    const { customMessage, enabled, enabledGpt } = this.upliftSettings;
    const { amount: { formatted }, sender: { username }, message: { text } } = uplift.data;

    const parsedInput = customMessage
      .replaceAll(/{formatted}/g, formatted)
      .replaceAll(/{text}/g, text)
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput, enabled, enabledGpt, username);
  }

  async handleFollower(follower: VStreamEventNewFollower) {
    console.log(follower);

    const { customMessage, enabled, enabledGpt } = this.followerSettings;
    const { username } = follower.data;

    const parsedInput = customMessage
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput, enabled, enabledGpt, username);
  }

  async handleGiftSub(gift: VStreamEventSubscriptionGifted) {
    const { customMessage, enabled, enabledGpt } = this.subscriptionSettings.gifted;
    const { tier, gifter: { username }, subscribers } = gift.data;

    const amount = subscribers.length;

    const parsedInput = customMessage
      .replaceAll(/{tier}/g, `${tier}`)
      .replaceAll(/{amount}/g, `${amount}`)
      .replaceAll(/{gifter}/g, username);

    this.handleCustomMessage(parsedInput, enabled, enabledGpt, username);
  }

  async handleSubRenew(renew: VStreamEventSubscriptionRenew) {
    const { customMessage, enabled, enabledGpt } = this.subscriptionSettings.renew;
    const { tier, streakMonth, renewalMonth, message: { text }, subscriber: { username } } = renew.data;

    const parsedInput = customMessage
      .replaceAll(/{tier}/g, `${tier}`)
      .replaceAll(/{streakMonth}/g, `${streakMonth}`)
      .replaceAll(/{renewalMonth}/g, `${renewalMonth}`)
      .replaceAll(/{text}/g, text)
      .replaceAll(/{username}/g, username);

    this.handleCustomMessage(parsedInput, enabled, enabledGpt, username);
  }

  async handleChatMessage(chat: VStreamEventChatCreated) {
    const {
      data: {
        text,
        chatter,
      },
    } = chat;

    const playedMessage = await this.chatService.onMessage(
      {
        text,
        displayName: chatter.displayName,
        isBroadcaster: false,
        isPayingMember: false,
        isMod: false,
      },
      'vstream',
    );

    const { randomChance } = this.vstreamSettings;

    if (!playedMessage && randomChance) {
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
  }
}