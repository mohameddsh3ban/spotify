/// <reference types="spotify-web-playback-sdk" />

import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, from, of, Subject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { SpotifyApiService } from './spotify-api.service';
import { SpotifyAuthService } from './spotify-auth.service';
import { ITrack } from '../model/ITrack.model';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: typeof Spotify; // or Spotify: typeof SpotifyExport if you import it
    }
}
interface ISpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  getCurrentState(): Promise<any>; // Replace 'any' with a more specific type
  addListener(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback: (data: any) => void): void;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
}

interface WebPlaybackState {
    repeat_mode: number;
    shuffle: boolean;
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
        current_track: any;
        next_tracks: any[];
    };
}

@Injectable({ providedIn: 'root' })
export class SpotifyPlayerService {
 

    private apiService = inject(SpotifyApiService);
    private authService = inject(SpotifyAuthService);
    private ngZone = inject(NgZone);

    private player : ISpotifyPlayer | null | any; // Ideally, use a more specific type if available
    private currentState = new BehaviorSubject<WebPlaybackState | null>(null);
    private deviceId = new BehaviorSubject<string | null>(null);
    private playerReady = new BehaviorSubject<boolean>(false);
    private errors = new BehaviorSubject<string | null>(null);
    private volumeLevel = new BehaviorSubject<number>(0.8); // Initial volume
    private trackChanged = new Subject<void>();  // Subject to notify track changes
    private initialVolumeSet = false; // flag

    // Expose observables
    currentState$ = this.currentState.asObservable();
    deviceId$ = this.deviceId.asObservable();
    playerReady$ = this.playerReady.asObservable();
    errors$ = this.errors.asObservable();
    trackChanged$ = this.trackChanged.asObservable();
    // volume$ = this.volumeLevel.asObservable();


    initializePlayer(): void {

        if (window.Spotify) {
            this.createPlayer();
        } else {
            this.ngZone.runOutsideAngular(() => {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    this.ngZone.run(() => {
                        this.createPlayer();
                    });
                };
            });
        }
        
    }

    private async createPlayer(): Promise<void> {
        try {
            const token = await this.authService.getAccessToken();
            if (!token) throw new Error('No access token found!');
            this.player = new window.Spotify.Player({ // Access through window
                name: 'Angular Spotify Player',
                getOAuthToken: (cb: (token: string) => void) => cb(token), // Explicitly type cb
                volume: this.volumeLevel.value // Use the behavior Subject;
            });

            this.setupEventListeners();
            this.connectPlayer();
        } catch (error) {
            this.handleError('Failed to initialize player', error);
        }
    }

    private connectPlayer(): void {
        from(this.player.connect()).pipe(
            tap(success => {
                if (success) {
                    this.playerReady.next(true);
                }
            }),
            catchError(error => {
                this.handleError('Connection failed', error);
                return of(false);
            })
        ).subscribe();
    }

    private setupEventListeners(): void {
        this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
            this.ngZone.run(() => {
                this.deviceId.next(device_id);
            });
        });

        this.player.addListener('player_state_changed', (state: WebPlaybackState) => {
            this.ngZone.run(() => {
                this.currentState.next(state);

                 if (state) {  // Notify of track changes
                    this.trackChanged.next();
                 }
            });
        });

        this.player.addListener('autoplay_failed', () => {
            this.ngZone.run(() => {
                this.errors.next('Autoplay blocked by browser. Click to initialize playback.');
            });
        });

        // Error listeners
        const errorHandler = (type: string) => ({ message }: { message: string }) => {
            this.ngZone.run(() => {
                this.handleError(`${type} error`, message);
            });
        };

        this.player.addListener('initialization_error', errorHandler('Initialization'));
        this.player.addListener('authentication_error', errorHandler('Authentication'));
        this.player.addListener('account_error', errorHandler('Account'));
        this.player.addListener('playback_error', errorHandler('Playback'));
    }

    // Player controls
    async togglePlay(): Promise<void> {
        try {
            await this.player.togglePlay();
        } catch (error) {
            this.handleError('Toggle play failed', error);
        }
    }

    async playTrack(uri: string): Promise<void> {
        await this.play(uri);
    }
    async playTracks(trackUris: string[], offset: number = 0): Promise<void> {
        const deviceId = this.deviceId.getValue();
        if (!deviceId) {
          this.handleError('Failed to play tracks', 'No device ID available.');
          return;
        }
    
        try {
          await this.apiService.spotifyApiCall('put', `me/player/play?device_id=${deviceId}`, {
            body: {
              uris: trackUris,
              offset: { position: offset }
            }
          });
        } catch (error) {
          this.handleError('Failed to play tracks', error);
        }
      }
    async playAlbum(albumUri: string, offset: number = 0): Promise<void> {
        await this.play(albumUri, "context_uri", offset);
      }

    private async play(
        uri: string,
        type: string = "uris",
        offset?: number
    ): Promise<void> {
        const deviceId = this.deviceId.getValue();
        if (!deviceId) {
            this.handleError('Failed to play track', 'No device ID available.');
            return;
        }

        const body: any = {};
        if (type === "context_uri") {
            body.context_uri = uri;
            if (offset !== undefined) {
                body.offset = { position: offset };
            }
        } else {
            body.uris = [uri];
        }

        try {
            await this.apiService.spotifyApiCall('put', `me/player/play?device_id=${deviceId}`, { body });
        } catch (error) {
            this.handleError('Failed to play track', error);
        }
    }

    // New method for playing playlist context
    async playPlaylistContext(playlistUri: string, offset: number): Promise<void> {
        await this.play(playlistUri, "context_uri", offset);
    }


    async seek(positionMs: number): Promise<void> {
        try {
            await this.player.seek(positionMs);
        } catch (error) {
            this.handleError('Seek failed', error);
        }
    }

    getVolume(): Observable<number | null> {
        return of(this.volumeLevel.value);
    }

    async setVolume(volume: number): Promise<void> {
        const volumeCap = Math.min(Math.max(volume, 0), 1); //cap within range of 0 and 1.

        try {
            await this.player.setVolume(volumeCap);
            this.volumeLevel.next(volumeCap); // Update local volume
            this.initialVolumeSet = true;

        } catch (error) {
            this.handleError('Volume change failed', error);
        }
    }
    pauseTrack(): void {
        this.apiService.spotifyApiCall('put', 'me/player/pause');
    }

    //Player Control Next Track
    nextTrack(): void {

        this.apiService.spotifyApiCall('post', 'me/player/next');
    }
    //Player Control previous track
    previousTrack(): void {
      
   this.apiService.spotifyApiCall('post', 'me/player/previous');
    }

    //Player set shuffle
    setShuffle(state: boolean) {
       this.apiService.spotifyApiCall('put', `me/player/shuffle?state=${state}`);
        
    }
    //Plyer set Repeat
    setRepeat(state: string) {
       this.apiService.spotifyApiCall('put', `me/player/repeat?state=${state}`);
    }
    async playAlbumContext(albumUri: string, offset: number = 0): Promise<void> {
        const deviceId = this.deviceId.getValue();
        if (!deviceId) {
          this.handleError('Failed to play album', 'No device ID available.');
          return;
        }
    
        try {
          await this.apiService.spotifyApiCall('put', `me/player/play?device_id=${deviceId}`, {
            body: {
              context_uri: albumUri,
              offset: { position: offset }
            }
          });
        } catch (error) {
          this.handleError('Failed to play album', error);
        }
      }
    

    async transferPlayback(): Promise<void> {
        const deviceId = this.deviceId.getValue();
        if (deviceId) {
            try {
                await this.apiService.spotifyApiCall('put', 'me/player', {
                    body: { device_ids: [deviceId], play: false }
                });
            } catch (error) {
                this.handleError('Playback transfer failed', error);
            }
        }
    }


    private handleError(context: string, error: any): void {
        const errorMessage = error?.message || 'Unknown error';
        console.error(`${context}: ${errorMessage}`);
        this.errors.next(`${context}: ${errorMessage}`);
    }

    getCurrentState(): Observable<any> {
      return new Observable(observer => {
        this.player.getCurrentState().then((state: any) => {
          observer.next(state);
          observer.complete();
        });
      });
    }
    getRecentlyPlayed(limit?: number): Observable<any> {
        if(!limit) limit = 10
      return new Observable(observer => {
        this.apiService.spotifyApiCall('get', `me/player/recently-played?limit=${limit}`).then((state: any) => {
          observer.next(state);
          observer.complete();
        });

      });
    }
    // spotify-player.service.ts
async playTrackContext(
    trackUri: string, 
    contextUri?: string, 
    offset: number = 0
  ): Promise<void> {
    const deviceId = this.deviceId.getValue();
    if (!deviceId) {
      this.handleError('Failed to play track', 'No device ID available.');
      return;
    }
  
    try {
      const body: any = {};
  
      if (contextUri) {
        // Play within context (album/playlist)
        body.context_uri = contextUri;
        body.offset = { position: offset };
      } else {
        // Play standalone track
        body.uris = [trackUri];
      }
  
      await this.apiService.spotifyApiCall(
        'put', 
        `me/player/play?device_id=${deviceId}`, 
        { body }
      );
    } catch (error) {
      this.handleError('Failed to play track', error);
    }
  }

    // Cleanup
    disconnectPlayer(): void {
        if (this.player) {
            this.player.disconnect();
            this.playerReady.next(false);
            this.currentState.next(null);
            this.deviceId.next(null);
        }
    }
}