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
import { TwitchApi } from './app/shared/api/twitch.api';
import { TwitchService } from './app/shared/services/twitch.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule,
      // Inject reducer manager
      StoreModule.forRoot({}),
      StoreModule.forFeature(AudioFeature),
      StoreModule.forFeature(TwitchFeature),
      StoreModule.forFeature(ConfigFeature),
      MatSnackBarModule,
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode()
      })),
    TwitchService,
    TwitchApi,
    TwitchPubSub,
    StorageService,
    ConfigService,
    AudioService,
    PlaybackService,
    LogService,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(routes)
  ]
})
  .catch((err) => console.error(err));
