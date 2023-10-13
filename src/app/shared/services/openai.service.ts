import { Injectable } from '@angular/core';
import { AudioService } from './audio.service';
import { ConfigService } from './config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GptChatState, GptPersonalityState, GptSettingsState } from '../state/config/config.feature';
import { Configuration, OpenAIApi } from 'openai';
import { loreTemplateGenerator } from '../util/lore';
import { LogService } from './logs.service';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  gptChat?: GptChatState;
  gptSettings?: GptSettingsState;
  gptPersonality?: GptPersonalityState;
  gptHistory: { role: 'user' | 'assistant', content: string }[] = [];

  apiKey = '';
  chatLore: { role: 'system', content: string }[] = [];
  chatGptConfig?: Configuration;
  chatGptApi?: OpenAIApi;
  
  constructor(
    private readonly audioService: AudioService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {
    this.configService.gptChat$
      .pipe(takeUntilDestroyed())
      .subscribe(gptChat => this.gptChat = gptChat);
    
    this.configService.gptPersonality$
      .pipe(takeUntilDestroyed())
      .subscribe(gptPersonality => this.gptPersonality = gptPersonality);

    this.configService.gptSettings$
      .pipe(takeUntilDestroyed())
      .subscribe(gptSettings => this.gptSettings = gptSettings);

    this.configService.gptPersonality$
      .pipe(takeUntilDestroyed())
      .subscribe(personality => {
        this.chatLore = [{
          role: 'system',
          content: loreTemplateGenerator(personality),
        }];
      });

    this.configService.gptToken$
      .pipe(takeUntilDestroyed())
      .subscribe(apiKey => {
        if (!apiKey) {
          return console.info('Ignoring empty API key.');
        }

        this.apiKey = apiKey;

        this.chatGptConfig = new Configuration({ apiKey });
        this.chatGptApi = new OpenAIApi(this.chatGptConfig);
        
        this.logService.add('Configuring OpenAI API', 'info', 'OpenAIService.constructor');
      });
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

      // Continue to slice the history to save the user tokens when making request.
      this.gptHistory = this.gptHistory.slice(-1 * (this.gptSettings?.historyLimit ?? 0));

      this.audioService.playTts(message.content, 'ChatGPT', 'gpt', this.gptChat.charLimit);
    } catch (e) {
      this.logService.add(`OpenAI failed to respond.\n${e}`, 'error', 'TwitchPubSub.gptHandler');
    }
  }
}