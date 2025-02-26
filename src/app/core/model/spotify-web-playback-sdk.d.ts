// spotify-web-playback-sdk.d.ts (create this file)

declare global {
    interface Window {
      onSpotifyWebPlaybackSDKReady: () => void;
      Spotify: typeof Spotify; // Use the namespace
    }
  
    namespace Spotify { // Use a namespace
      interface PlayerOptions {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }
  
      interface Player {
        new (options: PlayerOptions): Player;
        connect(): Promise<boolean>;
        disconnect(): void;
        addListener(event: string, callback: (data: any) => void): void;
        on(event: string, callback: (data: any) => void): void; // Some SDKs use 'on'
        togglePlay(): Promise<void>;
        seek(positionMs: number): Promise<void>;
        setVolume(volume: number): Promise<void>;
        _options: {id:string}; //for getting device id.
  
      }
  
      // Add other types/interfaces as needed
    }
  }