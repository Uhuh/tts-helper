import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StoreModule } from '@ngrx/store';
import { HistoryFeature } from './shared/state/history/history.feature';
import { TwitchService } from './shared/services/twitch.service';
import { TwitchFeature } from './shared/state/twitch/twitch.feature';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TwitchApi } from './shared/api/twitch.api';
import { HttpClientModule } from '@angular/common/http';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { HistoryService } from './shared/services/history.service';
import { ConfigService } from './shared/services/config.service';
import { ConfigFeature } from './shared/state/config/config.feature';
import { StorageService } from './shared/services/storage.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NavComponent } from './shared/components/nav/nav.component';
import { PlaybackService } from './shared/services/playback.service';
import { LogService } from './shared/services/logs.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    // Inject reducer manager
    StoreModule.forRoot({}),
    StoreModule.forFeature(HistoryFeature),
    StoreModule.forFeature(TwitchFeature),
    StoreModule.forFeature(ConfigFeature),
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
    LogService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
