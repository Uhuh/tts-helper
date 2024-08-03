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
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  first,
  from,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { invoke } from '@tauri-apps/api/core';
import { DeviceInfo, MonitorDevice, WithId } from './playback.interface';

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

  private readonly viewingDeviceSubject = new BehaviorSubject<MonitorDevice[]>([]);
  public readonly viewingDevices$ = this.viewingDeviceSubject.asObservable();

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

    this.vision$
      .pipe(
        takeUntilDestroyed(),
        map(v => v.globalHotkey),
        filter(h => !!h),
        distinctUntilChanged(),
      )
      .subscribe(hotkey => this.checkHotKey(hotkey));

    this.getViewingDevices();
  }

  async checkHotKey(hotkey: string) {
    /**
     * Due to the user being able to CTRL + R we need to re register it or else it'll break if they CTRL + R.
     */
    await unregister(hotkey)
      .catch(e => console.error(`Failed to unregister hotkey for screen capture: [${hotkey}] ${JSON.stringify(e)}`));

    await register(hotkey, (event) => {
      if (event.state === 'Pressed') {
        this.captureScreen();
      }
    }).then(() => {
      this.logService.add(`Successfully checked hotkey ${hotkey}`, 'info', 'OpenAI.checkHotKey');
      this.updateVisionSettings({ globalHotkey: hotkey });
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

  async getViewingDevices() {
    const monitors = await invoke('plugin:playback|list_viewing_devices') as WithId<DeviceInfo, string>[];

    this.viewingDeviceSubject.next(monitors);
  }

  async testMonitorCapture(captureName: string) {
    this.logService.add(`Testing users selected monitor for capture`, 'info', 'PlaybackService.testMonitorCapture');
    const imageB64Data = await invoke('plugin:playback|snapshot_monitor', { captureName });
    this.logService.add(`Captured users selected monitor`, 'info', 'PlaybackService.testMonitorCapture');

    return imageB64Data;
  }

  async captureScreen() {
    combineLatest([this.vision$, this.viewingDevices$])
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        switchMap(([vision, viewingDevices]) => {
          const { viewingDevice } = vision;

          if (!viewingDevices.find(m => m.id === viewingDevice)) {
            this.logService.add(`Couldn't find users selected monitor to capture. Is it possible they unplugged? ${JSON.stringify({
              selectedMonitorId: viewingDevice,
              viewingDevices,
            })}`, 'error', 'OpenAI.captureScreen');

            return of(null);
          }

          this.logService.add(`Capturing users selected monitor`, 'info', 'PlaybackService.captureScreen');
          return invoke<string>('plugin:playback|snapshot_monitor', { captureName: viewingDevice });
        }),
        switchMap(imageB64Data => {
          if (!imageB64Data) {
            this.logService.add(`Failed to encode data to B64, does users monitor exist?`, 'error', 'PlaybackService.captureScreen');
            return of(null);
          }

          this.logService.add(`Captured users selected monitor`, 'info', 'PlaybackService.captureScreen');
          return this.generateResponseToImage(imageB64Data);
        }),
      )
      .subscribe();
  }

  async generateResponseToImage(dataB64: string) {
    this.vision$
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(async (vision) => {
        if (
          !this.settings ||
          !this.chatSettings ||
          !this.openAIApi
        ) {
          return this.logService.add(`Missing config required for OpenAI image.`, 'error', 'OpenAI.generateResponseToImage');
        }

        const promptsLength = vision.potentialPrompts.length;
        const imageContext = vision.potentialPrompts[Math.floor(Math.random() * promptsLength)] ?? `Give a short description about what's in this image, or a snarky remark about the contents of it.`;

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
                  text: imageContext,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64, ${dataB64}`,
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
          content: 'I sent an image, remember it.',
        }, {
          role: 'assistant',
          content: message.content,
        });

        // Continue to slice the history to save the user tokens when making request.
        this.gptHistory = this.gptHistory.slice(-1 * (this.settings?.historyLimit ?? 0));

        this.audioService.playTts(message.content, 'ChatGPT', 'gpt', this.chatSettings.charLimit);
      });
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