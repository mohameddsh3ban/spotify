// album-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';

import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { IAlbum } from '../../model/IAlbum.model';
import { ITrack } from '../../model/ITrack.model';
import { LoadingComponent } from "../../components/loading/loading.component";
import { SpotifyPlayerService } from '../../services/spotify-player.service';

@Component({
  selector: 'app-album-page',
  standalone: true,
  imports: [NgIf, NgForOf, LoadingComponent,RouterLink,CommonModule],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.css'
})
export class AlbumPageComponent implements OnInit {
  isLiked: any;
  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyService);
  private player = inject(SpotifyPlayerService)

  albumId: string | null = null;
  album: IAlbum | undefined;
  tracks: ITrack[] = [];
  isPlaying: boolean = false;
  currentTrackUri: string | null = null; // Track the currently playing track
  ngOnInit(): void {
    this.albumId = this.route.snapshot.paramMap.get('id');
    if (this.albumId) {
      this.loadAlbumDetails(this.albumId);
      this.loadAlbumTracks(this.albumId);
    }
  }
  async loadAlbumDetails(albumId: string): Promise<void> {
    try {
      const album = await this.spotifyService.getAlbum(albumId);
      const { name, images, uri, artists } = album //Include the uri
      console.log(album)
      this.album = {
        name: name || "Unknown name",
        imageUrl: images[0]?.url || "https://picsum.photos/300/300",
        artist: this.getArtistNames(artists),  //Use the artist data passed
        uri: uri, // store the uri for playing the album
        artists: artists
      };
    } catch (error) {
      console.error('Error loading album details:', error);
      // Handle error
    }
  }

  async loadAlbumTracks(playlistId: string): Promise<void> {
    try {
      const { items } = await this.spotifyService.getAlbumTracks(playlistId);
      console.log(items);

      this.tracks = items?.map(( track : ITrack) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(({ id, name, external_urls, href, type, uri }: any) => ({
          id,
          name,
          external_urls,
          href,
          type,
          uri
        })),
        album: track.album
          ? {
              name: track.album.name,
              images: track.album.images || [] // Ensure images is an array
            }
          : undefined,
        available_markets: track.available_markets || [],
        disc_number: track.disc_number,
        duration_ms: track.duration_ms as number,
        explicit: track.explicit,
        external_urls: track.external_urls,
        href: track.href,
        preview_url: track.preview_url,
        track_number: track.track_number,
        type: track.type,
        uri: track.uri,
        is_local: track.is_local
      })) || [];

      console.log(this.tracks);
    } catch (error) {
      console.error("Error loading album tracks:", error);
      // Handle error properly, such as showing a notification to the user
    }
  }

  togglePlayPause(): void {
    if (!this.album?.uri || this.tracks.length === 0) return;

    if (this.isPlaying) {
      this.player.pauseTrack();
      this.isPlaying = false;
    } else {
      this.player.playAlbum(this.album.uri, 0).then(() => {
        this.isPlaying = true;
        this.currentTrackUri = this.tracks[0]?.uri;
      });
    }
  }
  playTrack(track: ITrack, index: number): void {
    if (!this.album?.uri) return;

    this.player.playAlbum(this.album.uri, index).then(() => {
      this.isPlaying = true;
      this.currentTrackUri = track.uri;
    });
  }
  isCurrentlyPlaying(track: ITrack): boolean {
    return this.isPlaying && this.currentTrackUri === track.uri;
  }
  formatDuration(durationMs: number|undefined): string {
    if(!durationMs) return '00'
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  }

  getArtistNames(artists:any[]): string {  //pass an array of artist to get the names
    return artists.map((artist:any) => artist.name).join(', ');
  }
  getArtistNamesFromTrack(track:ITrack): string {

    return track.artists.map(artist => artist.name).join(', ');
  }
  private readonly artistIdCache = new Map<string, string>();

  getArtistIdFromAlbum(name:string,album:IAlbum): string {
    if (this.artistIdCache.has(name)) {
      return this.artistIdCache.get(name)!;
    }

    const artistId = album.artists?.find(artist => artist.name === name)?.id;
    if (artistId) {
      this.artistIdCache.set(name, artistId);
    }
    return artistId || '';
  }

}