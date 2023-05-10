import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StoreModule } from '@ngrx/store';
import { historyReducer } from './shared/state/history/history.reducers';
import { TwitchService } from './shared/services/twitch.service';
import { twitchReducer } from './shared/state/twitch/twitch.reducers';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TwitchApi } from './shared/api/twitch.api';
import { HttpClientModule } from '@angular/common/http';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { HistoryService } from './shared/services/history.service';
import { ConfigService } from './shared/services/config.service';
import { configReducer } from './shared/state/config/config.reducers';
import { StorageService } from './shared/services/storage.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NavComponent } from './shared/components/nav/nav.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({
      historyState: historyReducer,
      twitchState: twitchReducer,
      configState: configReducer,
    }),
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
