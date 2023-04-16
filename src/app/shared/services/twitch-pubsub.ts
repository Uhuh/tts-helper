import { StaticAuthProvider } from "@twurple/auth";
import { Injectable, OnDestroy } from "@angular/core";
import { TwitchService } from "./twitch.service";
import { Subject, switchMap, takeUntil } from "rxjs";
import { TwitchChannelInfo } from "../state/twitch/twitch.interface";
import { ApiClient } from "@twurple/api";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { ChatClient } from "@twurple/chat";
import { HistoryService } from "./history.service";

@Injectable()
export class TwitchPubSub implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // TTS Helper client ID. This isn't a sensitive code.
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  
  channelInfo?: TwitchChannelInfo;
  listener: EventSubWsListener | null = null;
  chat: ChatClient | null = null;
  onMessageListener?: any;

  constructor(private readonly twitchService: TwitchService, private readonly historyService: HistoryService) {
    this.twitchService.channelInfo$
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(channelInfo => {
          this.channelInfo = channelInfo;
          
          return this.twitchService.twitchToken$;
        })
      )
      .subscribe({
        next: (token) => {
          if (!token || !this.channelInfo?.channelId) {
            this.listener?.stop();
            this.chat?.removeListener(this.onMessageListener);
            this.listener = null;
            return;
          }
          
          const authProvider = new StaticAuthProvider(this.clientId, token);
          const apiClient = new ApiClient({ authProvider });
          
          this.listener = new EventSubWsListener({ apiClient });
          this.listener.start();
          
          this.listener.onChannelSubscription(this.channelInfo?.channelId ?? '', c => {
            console.log(`${c.userDisplayName} just subbed...`);
          });
          
          this.chat = new ChatClient({ authProvider, channels: [this.channelInfo.username] });
          this.chat.connect()
            .catch(e => {
              console.error(`Failed to connect to chat.`, this.channelInfo, e);
            });
          
          this.onMessageListener = this.chat.onMessage((_, user, text) => this.chatMessages(user, text));
          this.chat.onSub((_, user, info, msg) => {
            console.log(user, info, msg);
          })
        },
        error: (err) => {
          console.error(`Failed to get users Twitch token`, err);
        }
      });
  }
  
  chatMessages(user: string, text: string) {
    /**
     * @TODO - Setup state for global command and prefix.
     */
    if (text.startsWith('!say')) {
      this.historyService.playTts(text.substring(4).trim(), user, 'twitch');
    }
  }
  
  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}