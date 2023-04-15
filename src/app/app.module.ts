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

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ historyState: historyReducer }),
    BrowserAnimationsModule,
    NavModule,
  ],
  providers: [TwitchService,
    {
      provide: LOCAL_STORAGE,
      useValue: window.localStorage
    }],
  bootstrap: [AppComponent],
})
export class AppModule {}
