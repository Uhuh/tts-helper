import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Configuration, OpenAIApi } from 'openai';
import { loreTemplateGenerator } from '../util/lore';
import { LogService } from './logs.service';
import { Store } from '@ngrx/store';
import { GptChatState, GptPersonalityState, GptSettingsState, OpenAIFeature } from '../state/openai/openai.feature';
import { ChatPermissions } from '../state/config/config.feature';
import { OpenAIActions } from '../state/openai/openai.actions';

@Injectable({
  providedIn: 'root',
})
export class OpenAIService {
  public readonly state$ = this.store.select(OpenAIFeature.selectOpenAIFeatureState);
  public readonly chatSettings$ = this.store.select(OpenAIFeature.selectChatSettings);
  public readonly settings$ = this.store.select(OpenAIFeature.selectSettings);
  public readonly personality$ = this.store.select(OpenAIFeature.selectPersonality);
  public readonly token$ = this.store.select(OpenAIFeature.selectToken);
  public readonly enabled$ = this.store.select(OpenAIFeature.selectEnabled);

  chatSettings?: GptChatState;
  settings?: GptSettingsState;
  personality?: GptPersonalityState;
  gptHistory: { role: 'user' | 'assistant', content: string }[] = [];

  apiKey = '';
  systemLorePrompt: { role: 'system', content: string }[] = [];
  chatGptConfig?: Configuration;
  openAIApi?: OpenAIApi;

  constructor(
    private readonly store: Store,
    private readonly audioService: AudioService,
    private readonly logService: LogService,
  ) {
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

        this.chatGptConfig = new Configuration({ apiKey });
        this.openAIApi = new OpenAIApi(this.chatGptConfig);

        this.logService.add('Configuring OpenAI API', 'info', 'OpenAIService.constructor');
      });
  }

  updateChatPermissions(permissions: Partial<ChatPermissions>) {
    this.store.dispatch(OpenAIActions.updateChatPermissions({ permissions }));
  }

  updatePersonality(personality: Partial<GptPersonalityState>) {
    console.log(personality)
    this.store.dispatch(OpenAIActions.updatePersonality({ personality }));
  }

  updateSettings(settings: Partial<GptSettingsState>) {
    this.store.dispatch(OpenAIActions.updateSettings({ settings }));
  }

  updateChatSettings(chatSettings: Partial<GptChatState>) {
    this.store.dispatch(OpenAIActions.updateChatSettings({ chatSettings }));
  }

  async generateOpenAIResponse(user: string, text: string) {
    if (
      !this.chatSettings ||
      !this.openAIApi
    ) {
      return;
    }

    const trimmedText = text.substring(this.chatSettings.command.length).trim();
    const content = `${user} says "${trimmedText}"`;
    try {
      const response = await this.openAIApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        temperature: 1,
        presence_penalty: 1,
        frequency_penalty: 1,
        max_tokens: 90,
        messages: [
          ...this.systemLorePrompt,
          ...this.gptHistory,
          {
            role: 'user',
            content,
          },
        ],
      });

      const { message } = response.data.choices[0];

      if (!message || !message.content) {
        this.logService.add(`OpenAI failed to respond.\n${JSON.stringify(message, undefined, 2)}`, 'error', 'OpenAIService.gptHandler');
        return console.info('OpenAI failed to respond.');
      }

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