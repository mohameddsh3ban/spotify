// playlist-page.component.ts
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ITrack } from '../../model/ITrack.model';
import { ActivatedRoute } from '@angular/router';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { IPlaylist } from '../../model/IPlaylist.model';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SpotifyPlayerService } from '../../services/spotify-player.service'; // Import SpotifyPlayerService
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-playlist-page',
  standalone: true,
  imports: [NgFor, NgIf, LoadingComponent],
  templateUrl: './playlist-page.component.html',
  styleUrl: './playlist-page.component.css',
})
export class PlaylistPageComponent implements OnInit, OnDestroy {
  formatDuration(duration_ms: number): string {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyPlaylistService);

  private player = inject(SpotifyPlayerService); // Inject SpotifyPlayerService

  playlistId: string | null = null;
  playlist: IPlaylist | undefined;
  tracks: ITrack[] = [];
  isPlaying: boolean = false;
  currentTrackUri: string | null = null; // Track the currently playing track
  private paramMapSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      const playlistId = params.get('id');
      if (playlistId) {
        this.playlistId = playlistId;
        this.loadPlaylistData(playlistId).then((data) => {
          console.log(this.tracks);
        });
      } else {
        console.error('Playlist ID is missing.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
  }

  async loadPlaylistData(playlistId: string): Promise<void> {
    this.playlist = undefined;
    try {
      await Promise.all([
        this.loadPlaylistDetails(playlistId),
        this.loadPlaylistTracks(playlistId),
      ]);
    } catch (error) {
      console.error('Error loading playlist data:', error);
    }
  }

  async loadPlaylistDetails(playlistId: string): Promise<void> {
    try {
      const playlist = await this.spotifyService.getPlaylist(playlistId);
      this.playlist = playlist;
    } catch (error) {
      console.error('Error loading playlist details:', error);
    }
  }

  async loadPlaylistTracks(playlistId: string): Promise<void> {
    try {
      const { items } = await this.spotifyService.getPlaylistItems(playlistId, {
        fields:
          'items(track(id,name,artists(id,name),album(name,images(url)),uri))', // Add uri to fields
        limit: 50,
      });

      this.tracks =
        items?.map(({ track }: any) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(({ id, name }: any) => ({ id, name })),
          album: {
            name: track.album.name,
            images:
              track.album.images.length > 0 ? track.album.images[0].url : null, // Safely access image URL
          },
          uri: track.uri, // Store the track URI
        })) || [];
      console.log(this.tracks);
    } catch (error) {
      console.error('Error loading playlist tracks:', error);
    }
  }

  togglePlayPause(): void {
    if (this.tracks.length === 0 || !this.playlistId) return;

    if (this.isPlaying) {
      this.player.pauseTrack();
      this.isPlaying = false;
    } else {
      const playlistUri = `spotify:playlist:${this.playlistId}`;
      this.player.playPlaylistContext(playlistUri, 0).then(() => {
        this.isPlaying = true;
        this.currentTrackUri = this.tracks[0]?.uri;
      });
    }
  }

  playTrack(track: ITrack, index: number): void {
    if (!this.playlistId) return;

    const playlistUri = `spotify:playlist:${this.playlistId}`;

    this.player.playPlaylistContext(playlistUri, index).then(() => {
      this.isPlaying = true;
      this.currentTrackUri = track.uri;
    });
  }
  isCurrentlyPlaying(track: ITrack): boolean {
    return this.isPlaying && this.currentTrackUri === track.uri;
  }

  getArtistNames(track: ITrack): string {
    return track.artists.map((artist) => artist.name).join(', ');
  }
}
