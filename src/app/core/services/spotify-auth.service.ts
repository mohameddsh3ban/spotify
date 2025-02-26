import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class SpotifyAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // *** IMPORTANT: Add web-playback and streaming scopes ***
  private scopes = [
    'user-read-private',
    'playlist-read-private',
    'user-read-email',
    'user-top-read',
    'user-library-read',
    'playlist-modify-public',
    'playlist-modify-private',
    // 'web-playback-sdk', // Required for Web Playback SDK
    'streaming', // Required for playing audio
    'user-modify-playback-state', // required to play and pause
    'user-read-playback-state', //required to get player state
    'user-read-recently-played'
  ];

  private clientId = environment.Client_ID;
  private redirectUri = environment.Redirect_URI;
  private authorizeUrl = 'https://accounts.spotify.com/authorize';
  private tokenUrl = 'https://accounts.spotify.com/api/token';

  // Use a signal to manage the access token
  private accessTokenSignal = signal<string | null>(null);

  // Create a computed signal that checks if the user is logged in
  public userIsLoggedIn = computed(() => !!this.accessTokenSignal());

  private codeVerifierKey = 'spotify_code_verifier';
  private accessTokenKey = 'spotify_access_token';
  private refreshTokenKey = 'spotify_refresh_token';
  private tokenExpirationKey = 'spotify_token_expiration';

  constructor() {
    const storedToken = localStorage.getItem(this.accessTokenKey);
    if (storedToken) {
      this.setAccessToken(storedToken);
    }
  }

  async login(): Promise<void> {
    const { code_verifier, code_challenge } = await this.generateCodeChallenge();
    localStorage.setItem(this.codeVerifierKey, code_verifier);

    let params = new HttpParams()
      .set('response_type', 'code')
      .set('client_id', this.clientId)
      .set('scope', this.scopes.join(' '))
      .set('redirect_uri', this.redirectUri)
      .set('code_challenge_method', 'S256')
      .set('code_challenge', code_challenge);

    window.location.href = `${this.authorizeUrl}?${params.toString()}`;
  }

  private async generateCodeChallenge(): Promise<{ code_verifier: string; code_challenge: string }> {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    const code_verifier = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '');
    const data = new TextEncoder().encode(code_verifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);
    const code_challenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return { code_verifier, code_challenge };
  }

  async handleCallback(code: string, state: any): Promise<void> {
    const code_verifier = localStorage.getItem(this.codeVerifierKey);
    if (!code_verifier) {
      console.error('No code verifier found!');
      this.router.navigate(['/error']);
      return;
    }

    try {
      const tokenData = await this.getToken(code, code_verifier);
      this.setAccessToken(tokenData.access_token);
      localStorage.setItem(this.refreshTokenKey, tokenData.refresh_token);
      localStorage.setItem(this.tokenExpirationKey, (Date.now() + tokenData.expires_in * 1000).toString());
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error getting token:', error);
      this.router.navigate(['/error']);
    }
  }

  private async getToken(code: string, code_verifier: string): Promise<any> {
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', this.redirectUri);
    body.set('client_id', this.clientId);
    body.set('code_verifier', code_verifier);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    try {
      const res = await firstValueFrom(this.http.post(this.tokenUrl, body.toString(), { headers }));
      localStorage.removeItem(this.codeVerifierKey);
      return res;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) {
      console.error('No refresh token found!');
      this.logout();
      return;
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);
    body.set('client_id', this.clientId);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    try {
      const res: any = await firstValueFrom(this.http.post(this.tokenUrl, body.toString(), { headers }));
      this.setAccessToken(res.access_token);
      localStorage.setItem(this.tokenExpirationKey, (Date.now() + res.expires_in * 1000).toString());
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
    }
  }

  logout(): void {
    this.clearTokenStorage();
    this.router.navigate(['auth/login']);
  }

  isLoggedIn(): boolean {
    return this.userIsLoggedIn();
  }

  // *** IMPORTANT:  Add token refresh logic here ***
  async getAccessToken(): Promise<string | null> {
    let accessToken = this.accessTokenSignal();
    const expirationTime = localStorage.getItem(this.tokenExpirationKey);

    if (!accessToken || !expirationTime) {
      console.warn('No access token found, attempting to refresh.');
      try {
        await this.refreshToken(); // Try refreshing if no token
        accessToken = this.accessTokenSignal(); // Get the refreshed token
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        this.logout();
        return null; // Or re-throw the error
      }
    } else {
      const expiration = parseInt(expirationTime, 10);
      if (Date.now() >= expiration) {
        console.warn('Access token expired, attempting to refresh.');
        try {
          await this.refreshToken(); // Try refreshing if expired
          accessToken = this.accessTokenSignal(); // Get the refreshed token
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.logout();
          return null; // Or re-throw the error
        }
      }
    }

    return accessToken as string;
  }

  private setAccessToken(token: string): void {
    this.accessTokenSignal.set(token);
    localStorage.setItem(this.accessTokenKey, token);
  }

  private clearTokenStorage(): void {
    this.accessTokenSignal.set(null);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
    localStorage.removeItem(this.codeVerifierKey);
  }

  async ensureValidToken(): Promise<string> {
    const accessToken = this.getAccessToken();
    const expirationTime = localStorage.getItem(this.tokenExpirationKey);

    if (accessToken && expirationTime) {
      const expiration = parseInt(expirationTime, 10);
      if (Date.now() < expiration) {
        return accessToken as unknown as string;
      }
    }

    try {
      await this.refreshToken();
      return this.getAccessToken() as unknown as string;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }
}