import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StoreModule } from '@ngrx/store';
import { historyFeature } from './shared/state/history/history.feature';
import { TwitchService } from './shared/services/twitch.service';
import { twitchFeature } from './shared/state/twitch/twitch.feature';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TwitchApi } from './shared/api/twitch.api';
import { HttpClientModule } from '@angular/common/http';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { HistoryService } from './shared/services/history.service';
import { ConfigService } from './shared/services/config.service';
import { configFeature } from './shared/state/config/config.feature';
import { StorageService } from './shared/services/storage.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NavComponent } from './shared/components/nav/nav.component';
import { PlaybackService } from './shared/services/playback.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    // Inject reducer manager
    StoreModule.forRoot({}),
    StoreModule.forFeature(historyFeature),
    StoreModule.forFeature(twitchFeature),
    StoreModule.forFeature(configFeature),
    BrowserAnimationsModule,
    MatSnackBarModule,
    NavComponent,
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [
    TwitchService,
    TwitchApi,
    TwitchPubSub,
    StorageService,
    ConfigService,
    HistoryService,
    PlaybackService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
