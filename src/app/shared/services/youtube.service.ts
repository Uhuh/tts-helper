import { effect, inject, Injectable, signal } from '@angular/core';
import { YoutubeFeature, YoutubeFeatureState } from '../state/youtube/youtube.feature';
import { LogService } from './logs.service';
import { LiveChat } from '../util/youtube-chat';
import { ChatService } from './chat.service';
import { ChatItem, EmojiItem } from '../util/youtube-chat/types/data';
import { AudioService } from './audio.service';
import { MessageText } from '../util/youtube-chat/types/yt-response';
import { ObsWebSocketService } from './obs-websocket.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  readonly #logService = inject(LogService);
  readonly #chatService = inject(ChatService);
  readonly #audioService = inject(AudioService);
  readonly #obsWebSocketService = inject(ObsWebSocketService);
  readonly store = inject(YoutubeFeature);
  readonly connectionStatus$ = toObservable(this.store.connectionStatus);
  readonly liveId = signal<string | null>(null);
  readonly hasError = signal(false);
  #liveChat: LiveChat | null = null;

  constructor() {
    effect(() => {
      const channelId = this.store.channelId();

      this.#liveChat?.removeAllListeners();

      this.#liveChat = new LiveChat({ channelId });

      this.#initializeListeners();
    });
  }

  updateState(partial: Partial<YoutubeFeatureState>) {
    this.store.updateState(partial);
  }

  updateSuperChat(partial: Partial<YoutubeFeatureState['superChat']>) {
    this.store.updateSuperChat(partial);
  }

  updateChannelId(channelId: string) {
    this.store.updateChannelId(channelId);
  }

  async #initializeListeners() {
    this.#liveChat?.on('chat', (chatItem) => {
      const superchatSettings = this.store.superChat();

      if (superchatSettings.enabled && !!chatItem.superchat) {
        return this.handleSuperChat(chatItem);
      }

      const messages = chatItem.message;
      const text = messages.map(m => {
        if (this.isMessageText(m)) {
          return m.text;
        } else {
          return m.emojiText;
        }
      }).join(' ');

      // Generate unique chat message ID using YouTube's message ID
      const chatMessageId = `youtube-${chatItem.id}`;

      // Send all chat messages to the overlay
      this.#obsWebSocketService.sendChatMessage(chatItem.author.name, text, 'youtube', false, chatMessageId);

      this.#chatService.onMessage(
        {
          text,
          displayName: chatItem.author.name,
          permissions: {
            isMod: chatItem.isModerator,
            isBroadcaster: chatItem.isOwner,
            isPayingMember: !!chatItem.superchat,
          },
        },
        'youtube',
        chatMessageId,
      );
    });

    this.#liveChat?.on('error', (error) => {
      // We don't care about errors related to failing to find the chat.
      if (
        typeof error === 'string' && (
          error.toLowerCase().includes('was not found') ||
          error.toLowerCase().includes('404')
        )
      ) {
        return;
      }

      // Prevent multiple errors from being emitted, such as 403 (like making a video private)
      if (this.hasError()) {
        return;
      }

      this.hasError.set(true);
      this.#logService.add(`Live chat encountered an error: ${error}`, 'error', 'YouTubeService.LiveChat');
    });

    this.#liveChat?.on('start', (liveId) => {
      this.liveId.set(liveId);
      this.hasError.set(false);
      this.#logService.add(`YouTube stream started! LiveID: ${liveId}`, 'info', 'YouTubeService.LiveChat');
    });

    this.#liveChat?.on('end', (reason) => {
      this.liveId.set(null);
      this.hasError.set(false);
      this.#logService.add(`YouTube stream ended! Reason: ${reason}`, 'info', 'YouTubeService.LiveChat');
    });

    /**
     * If the user has a populated channel ID, we want to see if they're live
     * Start checks for the live page.
     */
    while (!(await this.#liveChat?.start())) {
      await new Promise((res) => setTimeout(() => res(''), 3000));
    }

    this.hasError.set(false);
  }

  isMessageText(message: MessageText | EmojiItem): message is MessageText {
    return 'text' in message;
  }

  handleSuperChat(chatItem: ChatItem) {
    const superchatSettings = this.store.superChat();

    if (!superchatSettings.enabled) {
      return;
    }

    const parsedInput = superchatSettings.customMessage
      .replaceAll(/{username}/g, chatItem.author.name)
      .replaceAll(/{amount}/g, chatItem.superchat?.amount ?? 'NOTHING');

    this.#audioService.playTts(
      parsedInput,
      chatItem.author.name,
      'youtube',
      999,
    );
  }
}
