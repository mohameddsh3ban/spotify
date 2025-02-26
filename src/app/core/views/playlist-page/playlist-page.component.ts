import { Component, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { ITrack } from '../../model/ITrack.model';
import { ActivatedRoute } from '@angular/router';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { IPlaylistItem } from '../../model/IPlaylistItem.model';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingComponent } from "../../components/loading/loading.component"; // Import Subscription

@Component({
  selector: 'app-playlist-page',
  standalone: true,
  imports: [NgFor, NgIf, LoadingComponent],
  templateUrl: './playlist-page.component.html',
  styleUrl: './playlist-page.component.css'
})
export class PlaylistPageComponent implements OnInit, OnDestroy { // Implement OnDestroy


  formatDuration(duration_ms: number): string {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private route = inject(ActivatedRoute);
  private spotifyService = inject(SpotifyPlaylistService);

  playlistId: string | null = null;
  playlist: IPlaylistItem | undefined;
  tracks: ITrack[] = [];
  isPlaying: boolean = false;

  private paramMapSubscription: Subscription | undefined; // Store the subscription

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe(params => {
      const playlistId = params.get('id');
      if (playlistId) {
        this.playlistId = playlistId;
        this.loadPlaylistData(playlistId); // Call the data loading function
      } else {
        console.error('Playlist ID is missing.');
      }
    });
  }

  ngOnDestroy(): void { // Implement OnDestroy
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }
  }


  async loadPlaylistData(playlistId: string): Promise<void> {
    this.playlist = undefined
    try {
      await Promise.all([
        this.loadPlaylistDetails(playlistId),
        this.loadPlaylistTracks(playlistId)
      ]);
    } catch (error) {
      console.error('Error loading playlist data:', error);
      // Handle error (e.g., display an error message)
    }
  }

  async loadPlaylistDetails(playlistId: string): Promise<void> {
    try {
      const playlist = await this.spotifyService.getPlaylist(playlistId);
      this.playlist = playlist;
    } catch (error) {
      console.error('Error loading playlist details:', error);
      // Handle error (e.g., display an error message)
    }
  }

  async loadPlaylistTracks(playlistId: string): Promise<void> {
    try {
      const { items } = await this.spotifyService.getPlaylistItems(playlistId, {
        fields: 'items(track(id,name,artists(name),album(name,images(url))),total)', // Include URL in images
        limit: 50
      });

      this.tracks = items?.map(({ track } :any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(({ id, name }:any) => ({ id, name })),
        album: {
          name: track.album.name,
          images: track.album.images[0]?.url // Safely access the URL
        }
      })) || [];
      console.log(this.tracks)
    } catch (error) {
      console.error('Error loading playlist tracks:', error);
      // Handle error
    }
  }


  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    // Add actual playback logic here (using a player service or library)
  }

  getArtistNames(track:ITrack): string {
    return track.artists.map(artist => artist.name).join(', ');
  }
}