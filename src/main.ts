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
import { LogService } from './app/shared/services/logs.service';
import { PlaybackService } from './app/shared/services/playback.service';
import { AudioService } from './app/shared/services/audio.service';
import { ConfigService } from './app/shared/services/config.service';
import { StorageService } from './app/shared/services/storage.service';
import { TwitchPubSub } from './app/shared/services/twitch-pubsub';
import { TwitchService } from './app/shared/services/twitch.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { VTubeStudioService } from './app/shared/services/vtubestudio.service';
import { AzureFeature } from './app/shared/state/azure/azure.feature';
import { AzureSttService } from './app/shared/services/azure-stt.service';
import { ElevenLabsService } from './app/shared/services/eleven-labs.service';
import { ElevenLabsFeature } from './app/shared/state/eleven-labs/eleven-labs.feature';
import { TwitchApi } from './app/shared/api/twitch/twitch.api';
import { ElevenLabsApi } from './app/shared/api/eleven-labs/eleven-labs.api';
import { VTubeStudioFeature } from './app/shared/state/vtubestudio/vtubestudio.feature.';
import { OpenAIFeature } from './app/shared/state/openai/openai.feature';
import { ObsWebSocketService } from './app/shared/services/obs-websocket.service';
import { StreamDeckWebSocketService } from './app/shared/services/streamdeck-websocket.service';
import { VStreamApi } from './app/shared/api/vstream/vstream.api';
import { VStreamService } from './app/shared/services/vstream.service';

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
      MatSnackBarModule,
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode(),
      })),
    AudioService,
    AzureSttService,
    ConfigService,
    ElevenLabsApi,
    ElevenLabsService,
    LogService,
    TwitchService,
    ObsWebSocketService,
    StreamDeckWebSocketService,
    PlaybackService,
    StorageService,
    TwitchApi,
    TwitchPubSub,
    VTubeStudioService,
    VStreamApi,
    VStreamService,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(routes),
  ],
})
  .catch((err) => console.error(err));
