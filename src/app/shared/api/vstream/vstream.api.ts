import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import CryptoJS from 'crypto-js';
import { VStreamTokenResponse } from '../../state/vstream/vstream.feature';
import { VStreamChannelID, VStreamVideoID } from '../../services/vstream-pubsub.interface';
import { VStreamAPIChannelVideoLiveStream } from './vstream.interface';

@Injectable({
  providedIn: 'root',
})
export class VStreamApi {
  private readonly clientId = '018c3d0a-6e23-7000-b15f-3bf29bb3111d';
  private readonly redirectUri = 'http://localhost:12583/auth/vstream';
  private readonly url = 'https://api.vstream.com';
  private readonly scopes = ['chat:write', 'openid', 'offline_access', 'profile'];
  #tokenVerifier = '';

  constructor(private readonly http: HttpClient) {}

  generateCodeVerifier(): string {
    // Generate 96 random bytes
    const randomNumber = CryptoJS.lib.WordArray.random(96);
    return CryptoJS.enc.Base64url.stringify(randomNumber);
  }

  generateCodeChallenge(verifier: string): string {
    // Hash the verifier using SHA-256
    const hash = CryptoJS.SHA256(verifier);
    return hash.toString(CryptoJS.enc.Base64url);
  }

  async generateAuthURL() {
    const verifier = this.generateCodeVerifier();
    this.#tokenVerifier = verifier;
    const challenge = this.generateCodeChallenge(verifier);

    const authUrl = new URL(`${this.url}/oidc/auth`);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    /**
     * Default scope, I doubt I'll ever need this but we'll see.
     */
    authUrl.searchParams.append('scope', this.scopes.join(' '));
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    // This gives us the users claims, like profile/picture/channelId
    authUrl.searchParams.append('prompt', 'consent');

    return authUrl.toString();
  }

  refreshAccessToken(refreshToken: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const url = `${this.url}/oidc/token`;
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', this.clientId);

    return this.http.post<VStreamTokenResponse>(url, params, {
      headers,
    });
  }

  validate(code: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const url = `${this.url}/oidc/token`;
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code_verifier', this.#tokenVerifier)
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId);


    return this.http.post<VStreamTokenResponse>(url, params, {
      headers,
    });
  }

  getUsersChannelId(username: string, token: string) {
    const url = `${this.url}/channels/lookup?username=${username}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<{ data: { id: VStreamChannelID } }>(url, {
      headers,
    });
  }

  authenticatePubSub(token: string) {
    const url = `${this.url}/events/connect`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<{
      data: { token: string }
    }>(url, undefined, {
      headers,
    });
  }

  postChannelMessage(text: string, token: string, channelId: VStreamChannelID, videoId: VStreamVideoID) {
    const url = `${this.url}/channels/${channelId}/videos/${videoId}/chats`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(url, { text }, { headers });
  }

  findStream(token: string, channelID: VStreamChannelID) {
    const url = `${this.url}/channels/${channelID}/live`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<{ data: VStreamAPIChannelVideoLiveStream | null }>(url, {
      headers,
    });
  }
}