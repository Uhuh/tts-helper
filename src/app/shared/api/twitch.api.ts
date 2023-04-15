import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LOCAL_STORAGE } from "../tokens/localStorage.token";

@Injectable()
export class TwitchApi {
  private readonly url = 'https://api.twitch.tv/';
  private readonly headers: HttpHeaders;
  
  constructor(
    @Inject(LOCAL_STORAGE) private readonly localStorage: Storage,
    private readonly http: HttpClient
  ) {
  }
}