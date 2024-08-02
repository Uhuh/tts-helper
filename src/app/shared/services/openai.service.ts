import { DestroyRef, inject, Injectable } from '@angular/core';
import { AudioService } from './audio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OpenAI } from 'openai';
import { loreTemplateGenerator } from '../util/lore';
import { LogService } from './logs.service';
import { Store } from '@ngrx/store';
import {
  GptChatState,
  GptPersonalityState,
  GptSettingsState,
  GptVisionState,
  OpenAIFeature,
} from '../state/openai/openai.feature';
import { OpenAIActions } from '../state/openai/openai.actions';
import { ChatPermissions } from './chat.interface';
import { BehaviorSubject, combineLatest, first, from, of, shareReplay, switchMap } from 'rxjs';
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { invoke } from '@tauri-apps/api/core';
import { DeviceId, DeviceInfo, MonitorDevice, WithId } from './playback.interface';

@Injectable()
export class OpenAIService {
  private readonly store = inject(Store);
  private readonly audioService = inject(AudioService);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly state$ = this.store.select(OpenAIFeature.selectOpenAIFeatureState);
  public readonly chatSettings$ = this.store.select(OpenAIFeature.selectChatSettings);
  public readonly settings$ = this.store.select(OpenAIFeature.selectSettings);
  public readonly personality$ = this.store.select(OpenAIFeature.selectPersonality);
  public readonly vision$ = this.store.select(OpenAIFeature.selectVision);
  public readonly token$ = this.store.select(OpenAIFeature.selectToken);
  public readonly enabled$ = this.store.select(OpenAIFeature.selectEnabled);

  private readonly monitorsSubject = new BehaviorSubject<MonitorDevice[]>([]);
  public readonly monitors$ = this.monitorsSubject.asObservable();

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

    this.getMonitorDevices();
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

  updateVisionSettings(settings: Partial<GptVisionState>) {
    this.store.dispatch(OpenAIActions.updateVision({ settings }));
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

  async updateGlobalHotKey(hotkey: string) {
    const isHotkeyRegistered = await isRegistered(hotkey);

    if (isHotkeyRegistered) {
      return this.logService.add(`Hotkey ${hotkey} is already registered.`, 'info', 'OpenAI.updateGlobalHotKey');
    }

    return await register(hotkey, () => this.captureScreen())
      .then(() => {
        this.logService.add(`Successfully registered hotkey ${hotkey}`, 'info', 'OpenAI.updateGlobalHotKey');
        this.updateVisionSettings({ globalHotkey: hotkey });
      })
      .catch((error) => this.logService.add(`Failed to register hotkey ${hotkey} due to error.\n${JSON.stringify(error, undefined, 2)}`, 'error', 'OpenAI.updateGlobalHotKey'));
  }

  async clearGlobalHotKoy(hotkey: string) {
    await unregister(hotkey);

    this.updateVisionSettings({ globalHotkey: '' });
  }

  async getMonitorDevices() {
    const monitors = await invoke('plugin:playback|list_monitors') as WithId<DeviceInfo, DeviceId>[];

    this.monitorsSubject.next(monitors);
  }

  async testMonitorCapture(monitorId: number) {
    this.logService.add(`Testing users selected monitor for capture`, 'info', 'PlaybackService.testMonitorCapture');
    const imageB64Data = await invoke('plugin:playback|snapshot_monitor', { monitorId });
    this.logService.add(`Captured users selected monitor`, 'info', 'PlaybackService.testMonitorCapture');

    return imageB64Data;
  }

  async captureScreen() {
    combineLatest([this.vision$, this.monitors$])
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        switchMap(([vision, monitors]) => {
          const { monitorId } = vision;

          if (!monitors.find(m => m.id === monitorId)) {
            this.logService.add(`Couldn't find users selected monitor to capture. Is it possible they unplugged? ${JSON.stringify({
              selectedMonitorId: monitorId,
              monitors,
            })}`, 'error', 'OpenAI.captureScreen');

            return of(null);
          }

          this.logService.add(`Capturing users selected monitor`, 'info', 'PlaybackService.captureScreen');
          return invoke<string>('plugin:playback|snapshot_monitor', { monitorId });
        }),
        switchMap(imageB64Data => {
          if (!imageB64Data) {
            this.logService.add(`Failed to encode data to B64, does users monitor exist?`, 'error', 'PlaybackService.captureScreen');
            return of(null);
          }

          this.logService.add(`Captured users selected monitor`, 'info', 'PlaybackService.captureScreen');
          return this.generateResponseToImage(imageB64Data);
        }),
      );
  }

  async generateResponseToImage(dataB64: string) {
    if (
      !this.settings ||
      !this.chatSettings ||
      !this.openAIApi
    ) {
      return;
    }

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
            content: [
              {
                type: 'text',
                text: `Give a short description about what's in this image, or a snarky remark about the contents of it.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataB64,
                },
              },
            ],
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
        content: 'some image lol',
      }, {
        role: 'assistant',
        content: message.content,
      });

      // Continue to slice the history to save the user tokens when making request.
      this.gptHistory = this.gptHistory.slice(-1 * (this.settings?.historyLimit ?? 0));

      this.audioService.playTts(message.content, 'ChatGPT', 'gpt', this.chatSettings.charLimit);

    } catch (e) {
      console.log(e);
    }
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