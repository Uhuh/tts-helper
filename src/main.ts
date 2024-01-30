import { AppComponent } from './app/app.component';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfigFeature } from './app/shared/state/config/config.feature';
import { TwitchFeature } from './app/shared/state/twitch/twitch.feature';
import { AudioFeature } from './app/shared/state/audio/audio.feature';
import { StoreModule } from '@ngrx/store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AzureFeature } from './app/shared/state/azure/azure.feature';
import { ElevenLabsFeature } from './app/shared/state/eleven-labs/eleven-labs.feature';
import { VTubeStudioFeature } from './app/shared/state/vtubestudio/vtubestudio.feature.';
import { OpenAIFeature } from './app/shared/state/openai/openai.feature';
import { VStreamFeature } from './app/shared/state/vstream/vstream.feature';
import { AzureSttService } from './app/shared/services/azure-stt.service';
import { AudioService } from './app/shared/services/audio.service';
import { ChatService } from './app/shared/services/chat.service';
import { CommandService } from './app/shared/services/command.service';
import { ElevenLabsService } from './app/shared/services/eleven-labs.service';
import { ConfigService } from './app/shared/services/config.service';
import { LogService } from './app/shared/services/logs.service';
import { OpenAIService } from './app/shared/services/openai.service';
import { ObsWebSocketService } from './app/shared/services/obs-websocket.service';
import { StreamDeckWebSocketService } from './app/shared/services/streamdeck-websocket.service';
import { PlaybackService } from './app/shared/services/playback.service';
import { StorageService } from './app/shared/services/storage.service';
import { TwitchPubSub } from './app/shared/services/twitch-pubsub';
import { TwitchService } from './app/shared/services/twitch.service';
import { VStreamService } from './app/shared/services/vstream.service';
import { VStreamPubSubService } from './app/shared/services/vstream-pubsub.service';
import { VTubeStudioService } from './app/shared/services/vtubestudio.service';
import { OpenAIFactory } from './app/shared/services/openai.factory';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule,
      // Inject reducer manager
      StoreModule.forRoot({}),
      StoreModule.forFeature(AudioFeature),
      StoreModule.forFeature(AzureFeature),
      StoreModule.forFeature(ConfigFeature),
      StoreModule.forFeature(ElevenLabsFeature),
      StoreModule.forFeature(OpenAIFeature),
      StoreModule.forFeature(TwitchFeature),
      StoreModule.forFeature(VTubeStudioFeature),
      StoreModule.forFeature(VStreamFeature),
      MatSnackBarModule,
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode(),
      })),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(routes),
    AzureSttService,
    AudioService,
    ChatService,
    CommandService,
    ElevenLabsService,
    ConfigService,
    LogService,
    OpenAIService,
    ObsWebSocketService,
    StreamDeckWebSocketService,
    PlaybackService,
    StorageService,
    TwitchPubSub,
    TwitchService,
    VStreamService,
    VStreamPubSubService,
    VTubeStudioService,
    OpenAIFactory,
  ],
})
  .catch((err) => console.error(err));
