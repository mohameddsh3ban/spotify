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
toggleLike() {
throw new Error('Method not implemented.');
}

  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyService);
  private player = inject(SpotifyPlayerService)

  albumId: string | null = null;
  album: IAlbum | undefined;
  tracks: ITrack[] = [];
  isPlaying: boolean = false;

  ngOnInit(): void {
    this.albumId = this.route.snapshot.paramMap.get('id');

    if (this.albumId) {
      this.loadAlbumDetails(this.albumId);
      this.loadAlbumTracks(this.albumId);
    } else {
      console.error('Album ID is missing.');
    }
  }

  async loadAlbumDetails(albumId: string): Promise<void> {
    try {
      const album = await this.spotifyService.getAlbum(albumId);
      const { name, images, uri } = album //Include the uri
      console.log(album)
      this.album = {
        name: name || "Unknown name",
        imageUrl: images[0]?.url || "https://picsum.photos/300/300",
        artist: this.getArtistNames(album.artists),
        uri: uri // store the uri for playing the album
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
    if (!this.album?.uri) {
        console.warn("Album URI is missing.  Cannot play.");
        return;
    }
    this.isPlaying = !this.isPlaying;
    this.player.playAlbum(this.album.uri);
  }

  playTrack(track: ITrack) {
    this.player.playTrack(track.uri);
  }

  formatDuration(durationMs: number|undefined): string {
    if(!durationMs) return '00'
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  }

  getArtistNames(artists:any): string {

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