// artist-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { LoadingComponent } from "../../components/loading/loading.component";
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { ITrack } from '../../model/ITrack.model';
import { IAlbum } from '../../model/IAlbum.model';

@Component({
  selector: 'app-artist-page',
  standalone: true,
  imports: [NgIf, NgFor, LoadingComponent, RouterLink, CommonModule],
  templateUrl: './artist-page.component.html',
  styleUrl: './artist-page.component.css'
})
export class ArtistPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyService);
  private player = inject(SpotifyPlayerService);

  artistId: string | null = null;
  artist: any;
  topTracks: ITrack[] = [];
  albums: IAlbum[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.artistId = params.get('id');
      if (this.artistId) {
        this.loadArtistData(this.artistId);
      } else {
        this.error = 'Invalid artist ID';
        this.isLoading = false;
      }
    });
  }

  async loadArtistData(artistId: string): Promise<void> {
    try {
      const [artist, topTracks, albums] = await Promise.all([
        this.spotifyService.getArtist(artistId),
        this.spotifyService.getArtistTopTracks(artistId),
        this.spotifyService.getArtistAlbums(artistId)
      ]);

      this.artist = artist;
      this.topTracks = topTracks.tracks.map((track: any) => this.mapTrack(track));
      this.albums = albums.items.map((album: any) => this.mapAlbum(album));
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading artist data:', error);
      this.error = 'Failed to load artist data';
      this.isLoading = false;
    }
  }

  private mapTrack(trackData: any): ITrack {
    return trackData as ITrack;
  }

  private mapAlbum(albumData: any): IAlbum {
    return albumData as IAlbum;
  }

  playTrack(track: ITrack): void {
    if (!this.artistId) return;

    // Get all top track URIs
    const trackUris = this.topTracks.map(t => t.uri);
    
    // Find the index of the clicked track
    const trackIndex = this.topTracks.findIndex(t => t.id === track.id);
    
    if (trackIndex === -1) return;

    // Play using the top tracks as context
    this.player.playTracks(trackUris, trackIndex).then(() => {
      // Update UI state if needed
    });
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }

  getPopularityStars(popularity: number): string {
    const stars = Math.round(popularity / 20);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }
}