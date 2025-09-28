import { inject, Injectable } from "@angular/core";
import { OutboundSource, TtsHelperApiFeature, TtsHelperApiFeatureState } from "../state/api/tts-helper-api.feature";
import { fetch } from '@tauri-apps/plugin-http';
import { LogService } from "./logs.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AudioService } from "./audio.service";
import { listen } from "@tauri-apps/api/event";
import { AudioSource } from "../state/audio/audio.feature";
import { OpenAIService } from "./openai.service";
import { PlaybackService } from "./playback.service";

@Injectable()
export class TtsHelperApiService {
  readonly store = inject(TtsHelperApiFeature);
  readonly #audioService = inject(AudioService);
  readonly #playbackService = inject(PlaybackService);
  readonly #openAIService = inject(OpenAIService);
  readonly #logService = inject(LogService);
  readonly #snackbar = inject(MatSnackBar);

  constructor() {
    /**
     * From the TTS Helper API
     * Users can trigger normal TTS.
     */
    listen('api:create_tts_audio', (event) => {
      const data = event.payload as { username: string, platform: AudioSource, text: string, char_limit: number };

      this.#logService.add(`Creating TTS audio form request: ${JSON.stringify(data, null, 2)}`, 'info', 'TtsHelperApiService.listen(api:create_tts_audio)');

      this.#audioService.playTts(data.text, data.username, data.platform, data.char_limit);
    }).catch(e => {
      this.#logService.add(`Failed to play tts for api request. ${JSON.stringify(e, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:create_tts_audio)');
    });

    /**
     * From the TTS Helper API
     * Users can toggle the pause status of the whole app.
     */
    listen('api:toggle_pause_status', () => {
      this.#logService.add(`Toggling pause.`, 'info', 'TtsHelperApiService.listen(api:toggle_pause_status)');

      this.#playbackService.togglePause();
    }).catch(e => {
      this.#logService.add(`Failed to toggle pause. ${JSON.stringify(e, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:toggle_pause_status)');
    });

    /**
     * From the TTS Helper API
     * Users can skip the currently playing TTS item.
     */
    listen('api:skip_current_playing', () => {
      this.#logService.add(`Skipping current playing audio item.`, 'info', 'TtsHelperApiService.listen(api:skip_current_playing)');

      this.#playbackService.skipCurrentlyPlaying();
    }).catch(e => {
      this.#logService.add(`Failed to skip current playing. ${JSON.stringify(e, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:skip_current_playing)');
    });

    /**
     * From the TTS Helper API
     * Users can trigger AI responses and have the response read as TTS.
     */
    listen('api:create_ai_tts_audio', event => {
      const data = event.payload as { username: string, platform: AudioSource, text: string, charLimit: number };
      this.#logService.add(`Creating AI TTS response + audio for request: ${JSON.stringify(data, null, 2)}`, 'info', 'TtsHelperApiService.listen(api:create_ai_tts_audio)');

      this.#openAIService.playOpenAIResponse(data.username, data.text);
    }).catch(error => {
      this.#logService.add(`Failed to listen for api:create_ai_tts_audio. ${JSON.stringify(error, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:create_ai_tts_audio)');
    });

    /**
     * From the TTS Helper API
     * Users can trigger AI responses and those responses will be sent to all sources.
     */
    listen('api:get_ai_response', async event => {
      const data = event.payload as { username: string, platform: AudioSource, text: string, charLimit: number };

      this.#logService.add(`Creating AI TTS response for request: ${JSON.stringify(data, null, 2)}`, 'info', 'TtsHelperApiService.listen(api:get_ai_response)');

      const response = await this.#openAIService.generateOpenAIResponse(data.username, data.text);

      this.sendToOutboundSources(response ?? 'My brain is all fuzzy ...');

      this.#logService.add(`Response: ${response}`, 'info', 'TtsHelperApiService.listen(api:get_ai_response)');
    }).catch(error => {
      this.#logService.add(`Failed to listen for api:get_ai_response. ${JSON.stringify(error, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:get_ai_response)');
    });

    /**
     * From the TTS Helper API
     * Users can trigger the vision feature and have AI respond to the provided prompt, if there is one.
     */
    listen('api:trigger_ai_vision', async event => {
      const data = event.payload as { username: string, platform: AudioSource, text: string, charLimit: number };

      this.#logService.add(`Creating AI image TTS response for request: ${JSON.stringify(data, null, 2)}`, 'info', 'TtsHelperApiService.listen(api:trigger_ai_vision)');

      this.#openAIService.captureScreen(data.text);
    }).catch(error => {
      this.#logService.add(`Failed to listen for api:trigger_ai_vision. ${JSON.stringify(error, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:trigger_ai_vision)');
    });

    /**
     * From the TTS Helper API
     * Users can pass an image for the vision feature and have AI respond to the provided prompt, if there is one.
     */
    listen('api:react_ai_image', async event => {
      // The image is represented as a b64 string
      const data = event.payload as { text: string, image: string };

      if (!data.image) {
        return this.#logService.add(`There was an attempt to create a response to no image.`, 'info', 'TtsHelperApiService.listen(api:react_ai_image)');
      }

      this.#logService.add(`Creating AI image TTS response for prompt: ${data.text}`, 'info', 'TtsHelperApiService.listen(api:react_ai_image)');

      this.#openAIService.generateResponseToImage(data.image, data.text);
    }).catch(error => {
      this.#logService.add(`Failed to listen for api:react_ai_image. ${JSON.stringify(error, null, 2)}`, 'error', 'TtsHelperApiService.listen(api:react_ai_image)');
    });
  }

  updateState(state: Partial<TtsHelperApiFeatureState>) {
    this.store.updateState(state);
  }

  createSource() {
    this.store.addResponseSource();
  }

  deleteSource(sourceId: string) {
    this.store.removeResponseSource(sourceId);
  }

  updateSource(sourceId: string, partial: Partial<OutboundSource>) {
    this.store.updateResponseSource(sourceId, partial);
  }

  async sendToOutboundSources(text: string) {
    const sources = this.store.ai_response_sources();

    for (const source of sources) {
      try {
        const body = source.body.replaceAll(/{text}/g, text);

        const response =  await fetch(source.uri, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 400) {
          this.#snackbar.open(
            `Received a 400 status code for ${source.uri}`,
            'Dismiss',
            {
              panelClass: 'notification-error',
            },
          );
        }

        this.#logService.add(`Source [${source.uri}] responded with status code [${response.status}]`, 'info', 'TtsHelperApiService.sendToOutboundSources');
      } catch (error) {
        console.error(error);
        this.#logService.add(`Failed to POST for [${source.uri}] | error: ${JSON.stringify(error, null, 2)}`, 'error', `TtsHelperApiService.sendToOutboundSources`);
      }
    }
  }
}