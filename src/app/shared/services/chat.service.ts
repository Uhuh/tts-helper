import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { OpenAIService } from './openai.service';
import { GeneralChatState } from '../state/config/config.feature';
import { GptChatState } from '../state/openai/openai.feature';
import { ChatPermissions, ChatUserMessage } from './chat.interface';
import { AudioService } from './audio.service';
import { AudioSource } from '../state/audio/audio.feature';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class ChatService {
  private readonly configService = inject(ConfigService);
  private readonly openaiService = inject(OpenAIService);
  private readonly audioService = inject(AudioService);

  generalChat!: GeneralChatState;
  openAIChat!: GptChatState;

  cooldowns = new Map<string, boolean>();

  constructor() {
    this.configService.generalChat$
      .pipe(takeUntilDestroyed())
      .subscribe(generalChat => this.generalChat = generalChat);

    this.openaiService.chatSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(chatSettings => this.openAIChat = chatSettings);
  }

  async onMessage(user: ChatUserMessage, source: AudioSource) {
    if (!this.generalChat.enabled && !this.openAIChat.enabled) {
      return;
    }

    const generalCooldownID = `${source}-general`;
    const gptCooldownID = `${source}-gpt`;
    const { text } = user;

    /**
     * Handle normal chat commands and their cooldowns
     */
    if (this.generalChat.enabled &&
      text.startsWith(this.generalChat.command) &&
      this.hasChatCommandPermissions(user, this.generalChat.permissions) &&
      !this.cooldowns.get(generalCooldownID)
    ) {
      const trimmedText = text.substring(this.generalChat.command.length).trim();
      this.audioService.playTts(trimmedText, user.displayName, source, this.generalChat.charLimit);
      const duration = this.generalChat.cooldown * 1000;

      // Handle cooldown if there is any.
      this.cooldowns.set(generalCooldownID, true);
      setTimeout(() => this.cooldowns.set(generalCooldownID, false), duration);

      return true;
    }

    /**
     * Handle GPT related chat commands and their cooldowns
     */
    if (this.openAIChat.enabled &&
      text.startsWith(this.openAIChat.command) &&
      this.hasChatCommandPermissions(user, this.openAIChat.permissions) &&
      !this.cooldowns.get(gptCooldownID)
    ) {
      this.openaiService.generateOpenAIResponse(user.displayName, text, true);
      const duration = this.openAIChat.cooldown * 1000;

      // Handle cooldown if there is any.
      this.cooldowns.set(gptCooldownID, true);
      setTimeout(() => this.cooldowns.set(gptCooldownID, false), duration);

      return true;
    }

    return false;
  }

  randomChance(user: Pick<ChatUserMessage, 'text' | 'displayName'>, chance: number, useOpenAI: boolean, source: AudioSource) {
    const diceRoll = Math.random() * 100;

    if (diceRoll > chance) {
      return;
    }

    const { text, displayName } = user;

    /**
     * If OpenAI is enabled then get the model to generate a response.
     */
    if (useOpenAI) {
      this.openaiService.generateOpenAIResponse(displayName, text);
    } else {
      this.audioService.playTts(text, displayName, source, this.generalChat.charLimit);
    }
  }

  hasChatCommandPermissions(user: Pick<ChatUserMessage, 'permissions'>, permissions: ChatPermissions) {
    if (user.permissions.isBroadcaster) {
      return true;
    } else if (permissions.allUsers) {
      return true;
    } else if (permissions.mods && user.permissions.isMod) {
      return true;
    } else if (permissions.payingMembers && user.permissions.isPayingMember) {
      return true;
    }

    return false;
  }
}