import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import CryptoJS from 'crypto-js';

@Injectable()
export class VStreamApi {
  private readonly clientId = '018c3d0a-6e23-7000-b15f-3bf29bb3111d';
  private readonly redirectUri = 'http://localhost:12583/auth/vstream';
  private readonly url = 'https://api.vstream.com';
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
    authUrl.searchParams.append('scope', 'chat:write');
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return authUrl.toString();
  }

  validate(code: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code_verifier', this.#tokenVerifier)
      .set('code', code)
      .set('redirect_uri', this.redirectUri)
      .set('client_id', this.clientId);

    const url = `${this.url}/oidc/token`;

    this.http.post(url, params, {
      headers,
    }).subscribe({
      next: (c) => console.info(c),
      error: (e) => console.error(e),
    });
  }
}