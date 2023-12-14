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
  ],
})
  .catch((err) => console.error(err));
