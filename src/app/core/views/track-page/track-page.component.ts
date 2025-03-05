// track-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ITrack } from '../../model/ITrack.model';
import { LoadingComponent } from "../../components/loading/loading.component";
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { IArtist } from '../../model/IArtist.model';

@Component({
  selector: 'app-track-page',
  standalone: true,
  imports: [NgIf, LoadingComponent, RouterLink, CommonModule],
  templateUrl: './track-page.component.html',
  styleUrl: './track-page.component.css'
})
export class TrackPageComponent implements OnInit {
isLiked = false


  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyService);
  private player = inject(SpotifyPlayerService);
artists :IArtist[]=[]
  trackId: string | null = null;
  track: ITrack | undefined;
  isPlaying = false;
  currentTrackUri: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.trackId = params.get('id');
      if (this.trackId) {
        this.loadTrackDetails(this.trackId).then(() => {
          if(this.track){
            this.populateArtist(this.track);
            this.checkIsSaved(this.track.id);
          }
        
        })
      }
    });
  }

  async loadTrackDetails(trackId: string): Promise<void> {
    try {
      const response = await this.spotifyService.getTrack(trackId)
      
      this.track = this.mapTrackResponse(response)
    } catch (error) {
      console.error('Error loading track details:', error);
    }
  }

  private mapTrackResponse(trackData: any): ITrack {
    console.log(trackData);
    return trackData as unknown as ITrack;
  }

  togglePlayPause(): void {
    if (!this.track?.uri) return;

    if (this.isPlaying) {
      this.player.pauseTrack();
      this.isPlaying = false;
    } else {
      this.player.playTrack(this.track.uri).then(() => {
        this.isPlaying = true;
        this.currentTrackUri = this.track?.uri || null;
      });
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying && this.currentTrackUri === this.track?.uri;
  }

  formatDuration(durationMs: number | undefined): string {
    if (!durationMs) return '0:00';
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }


  getArtistNames(artists: any[]): string {
    return artists.map(artist => artist.name).join(', ');
  }
  async populateArtist(track: ITrack) {
    const artistPromises = track.artists.map(artist => this.spotifyService.getArtist(artist.id));
    const artistResults = await Promise.all(artistPromises);
    this.artists.push(...artistResults);
  }
  async checkIsSaved(trackId: string) {
    try {
      const isSaved = await this.spotifyService.checkIsSaved(trackId);
      this.isLiked = isSaved;
      console.log('Track saved status:', this.isLiked);
    } catch (error) {
      console.error('Error checking saved status:', error);
      this.isLiked = false;
    }
  }
  async toggleLike() {
    if (!this.track) return;
  
    try {
      if (!this.isLiked) {
        await this.spotifyService.saveTracksForCurrentUser([this.track.id]);
        console.log('Track liked');
      } else {
        await this.spotifyService.removeTracksForCurrentUser([this.track.id]);
        console.log('Track unliked');
      }
      // Re-check the actual state after toggle
      await this.checkIsSaved(this.track.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI state if operation failed
      this.isLiked = !this.isLiked;
    }
  }
}