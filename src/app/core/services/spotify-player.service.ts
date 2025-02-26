/// <reference types="spotify-web-playback-sdk" />

import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, from, of, Subject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { SpotifyApiService } from './spotify-api.service';
import { SpotifyAuthService } from './spotify-auth.service';

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: typeof Spotify; // or Spotify: typeof SpotifyExport if you import it
    }
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

    private player: any; // Ideally, use a more specific type if available
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
        const deviceId = this.deviceId.getValue();
        if (!deviceId) {
            this.handleError('Failed to play track', 'No device ID available.');
            return;
        }
        try {
            await this.apiService.spotifyApiCall('put', `me/player/play?device_id=${deviceId}`, { //pass device id in query
                body: { uris: [uri] }
            });

        } catch (error) {
            this.handleError('Failed to play track', error);
        }
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

    //Player Control Next Track
    nextTrack(): void {
        this.spotifyApiCallWithoutBody('post', `me/player/next`).subscribe({
            next: () => {
                // success callback(optional)
            },
            error: (error) => {
                this.handleError('Failed to Skip Next track', error);
            }
        });
    }
    //Player Control previous track
    previousTrack(): void {
        this.spotifyApiCallWithoutBody('post', `me/player/previous`).subscribe({
            next: () => {
                // success callback(optional)
            },
            error: (error) => {
                this.handleError('Failed to Skip Previous track', error);
            }
        });
    }

    //Player set shuffle
    setShuffle(state: boolean): Observable<any> {
        return this.spotifyApiCallWithoutBody('put', `me/player/shuffle?state=${state}`);
    }
    //Plyer set Repeat
    setRepeat(state: string): Observable<any> {

        return this.spotifyApiCallWithoutBody('put', `me/player/repeat?state=${state}`);
    }

    private spotifyApiCallWithoutBody(method: any, url: string): Observable<any> {
        const deviceId = this.deviceId.getValue();
        const fullURL = deviceId ? `${url}&device_id=${deviceId}` : url;

        return from(this.apiService.spotifyApiCall(method, fullURL)).pipe(
            catchError((error) => {
                this.handleError(`Spotify API call failed for ${url}`, error);
                throw error; // Re-throw to allow the component to handle it as well
            })
        );
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