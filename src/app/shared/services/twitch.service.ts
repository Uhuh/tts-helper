import { Injectable } from "@angular/core";
import { listen } from "@tauri-apps/api/event";
import { Store } from "@ngrx/store";

@Injectable()
export class TwitchService {
  public readonly authToken$ = ';';
  constructor(private readonly store: Store) {
    listen('access-token', (authData) => {
      console.log(authData.payload);
    })
  }
  
  getChannelInfo() {
    
  }
  
  validateToken() {
    
  }
}
