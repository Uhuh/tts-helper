import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavModule } from './shared/components/nav/nav.module';
import { StoreModule } from '@ngrx/store';
import { historyReducer } from './shared/state/history/history.reducers';
import { TwitchService } from "./shared/services/twitch.service";
import { LOCAL_STORAGE } from "./shared/tokens/localStorage.token";
import { twitchReducer } from "./shared/state/twitch/twitch.reducers";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TwitchApi } from "./shared/api/twitch.api";
import { HttpClientModule } from "@angular/common/http";
import { TwitchPubSub } from "./shared/services/twitch-pubsub";
import { HistoryService } from "./shared/services/history.service";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({ historyState: historyReducer, twitchState: twitchReducer }),
    BrowserAnimationsModule,
    MatSnackBarModule,
    NavModule,
  ],
  providers: [
    TwitchService,
    TwitchApi,
    TwitchPubSub,
    HistoryService,
    {
      provide: LOCAL_STORAGE,
      useValue: window.localStorage
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
