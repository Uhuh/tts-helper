import { inject, Injectable } from '@angular/core';
import { AudioService } from './audio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpenAI } from 'openai';
import { loreTemplateGenerator } from '../util/lore';
import { LogService } from './logs.service';
import { Store } from '@ngrx/store';
import { GptChatState, GptPersonalityState, GptSettingsState, OpenAIFeature } from '../state/openai/openai.feature';
import { OpenAIActions } from '../state/openai/openai.actions';
import { ChatPermissions } from './chat.interface';
import { from, shareReplay } from 'rxjs';

@Injectable()
export class OpenAIService {
  private readonly store = inject(Store);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);

  public readonly state$ = this.store.select(OpenAIFeature.selectOpenAIFeatureState);
  public readonly chatSettings$ = this.store.select(OpenAIFeature.selectChatSettings);
  public readonly settings$ = this.store.select(OpenAIFeature.selectSettings);
  public readonly personality$ = this.store.select(OpenAIFeature.selectPersonality);
  public readonly token$ = this.store.select(OpenAIFeature.selectToken);
  public readonly enabled$ = this.store.select(OpenAIFeature.selectEnabled);

  private chatSettings?: GptChatState;
  private settings?: GptSettingsState;
  private personality?: GptPersonalityState;
  private gptHistory: { role: 'user' | 'assistant', content: string }[] = [];

  apiKey = '';
  systemLorePrompt: { role: 'system', content: string }[] = [];
  openAIApi?: OpenAI;

  constructor() {
    this.chatSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(chatSettings => this.chatSettings = chatSettings);

    this.personality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => this.personality = personality);

    this.settings$
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.settings = settings);

    this.personality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => {
        this.systemLorePrompt = [{
          role: 'system',
          content: loreTemplateGenerator(personality),
        }];
      });

    this.token$
      .pipe(takeUntilDestroyed())
      .subscribe(apiKey => {
        if (!apiKey) {
          return console.info('Ignoring empty API key.');
        }

        this.apiKey = apiKey;
        /**
         * Since TTS Helper isn't running in a users normal browser and everything is stored locally, we can assure OpenAI
         * that we know what we're doing here.
         */
        this.openAIApi = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        this.logService.add('Configuring OpenAI API', 'info', 'OpenAIService.constructor');
      });
  }

  updateChatPermissions(permissions: Partial<ChatPermissions>) {
    this.store.dispatch(OpenAIActions.updateChatPermissions({ permissions }));
  }

  updatePersonality(personality: Partial<GptPersonalityState>) {
    this.store.dispatch(OpenAIActions.updatePersonality({ personality }));
  }

  updateSettings(settings: Partial<GptSettingsState>) {
    this.store.dispatch(OpenAIActions.updateSettings({ settings }));
  }

  updateChatSettings(chatSettings: Partial<GptChatState>) {
    this.store.dispatch(OpenAIActions.updateChatSettings({ chatSettings }));
  }

  getUserModels() {
    if (!this.openAIApi) {
      return from([]);
    }

    return from(this.openAIApi.models.list())
      .pipe(
        shareReplay(1),
      );
  }

  async generateOpenAIResponse(user: string, text: string, isCommand = false) {
    if (
      !this.settings ||
      !this.chatSettings ||
      !this.openAIApi
    ) {
      return;
    }

    this.logService.add(`Attempting to generate OpenAI content.`, 'info', 'OpenAI.generateOpenAIResponse');

    const trimmedText = isCommand ? text.substring(this.chatSettings.command.length).trim() : text;
    const content = `${user} says "${trimmedText}"`;
    try {
      const response = await this.openAIApi.chat.completions.create({
        model: this.settings.model,
        temperature: this.settings.temperature,
        presence_penalty: this.settings.presencePenalty,
        frequency_penalty: this.settings.frequencyPenalty,
        max_tokens: this.settings.maxTokens,
        messages: [
          ...this.systemLorePrompt,
          ...this.gptHistory,
          {
            role: 'user',
            content,
          },
        ],
      });

      const { message } = response.choices[0];

      if (!message || !message.content) {
        this.logService.add(`OpenAI failed to respond.\n${JSON.stringify(message, undefined, 2)}`, 'error', 'OpenAIService.gptHandler');
        return console.info('OpenAI failed to respond.');
      }

      this.logService.add(`Generated response: ${message.content}.`, 'info', 'OpenAI.generateOpenAIResponse');

      this.gptHistory.push({
        role: 'user',
        content,
      }, {
        role: 'assistant',
        content: message.content,
      });

      // Continue to slice the history to save the user tokens when making request.
      this.gptHistory = this.gptHistory.slice(-1 * (this.settings?.historyLimit ?? 0));

      this.audioService.playTts(message.content, 'ChatGPT', 'gpt', this.chatSettings.charLimit);
    } catch (e) {
      this.logService.add(`OpenAI failed to respond.\n${JSON.stringify(e, undefined, 2)}`, 'error', 'OpenAIService.gptHandler');

      // Anytime OpenAI might have API issues just respond with this.
      this.audioService.playTts('My brain is all fuzzy...', 'ChatGPT', 'gpt', this.chatSettings.charLimit);
    }
  }
}