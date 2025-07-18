﻿import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { OpenAIService } from './openai.service';
import { GeneralChatState } from '../state/config/config.feature';
import { GptChatState } from '../state/openai/openai.feature';
import { ChatPermissions, ChatUserMessage, WatchStreakUser } from './chat.interface';
import { AudioService } from './audio.service';
import { AudioSource } from '../state/audio/audio.feature';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { WatchStreakActions } from '../state/watch-streak/watch-streak.actions';
import { WatchStreakFeature, WatchStreakFeatureState } from '../state/watch-streak/watch-streak.feature';

@Injectable()
export class ChatService {
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly openaiService = inject(OpenAIService);
  private readonly audioService = inject(AudioService);

  public readonly watchStreakState$ = this.store.select(WatchStreakFeature.selectWatchStreakFeatureState);

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

  /**
   * Check if user has chat settings enabled or GPT chat settings enabled.
   * @param user The user that sent the message
   * @param source Platform that the message came from
   * @return boolean If user message was played as TTS
   */
  async onMessage(user: ChatUserMessage, source: AudioSource) {
    const canProceed = await this.audioService.canProcessMessage(user.text, user.displayName);

    if (!canProceed || !this.generalChat.enabled && !this.openAIChat.enabled) {
      return false;
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

  updateWatchStreak(partialState: Partial<WatchStreakFeatureState>) {
    this.store.dispatch(WatchStreakActions.updateState({ partialState }));
  }

  handleWatchStreak(user: WatchStreakUser) {
    /**
     * Handle modifiers here potentially?
     */

    this.store.dispatch(WatchStreakActions.updateUsersWatchDate({
      user: {
        userName: user.displayName,
        userId: user.id,
      },
    }));
  }

  logStreamStart() {
    this.store.dispatch(WatchStreakActions.logStreamStart());
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