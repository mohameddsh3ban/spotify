import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { PlaylistListComponent } from '../../components/playlist-list/playlist-list.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { IPlaylist } from '../../model/IPlaylist.model';
import { IAlbum } from '../../model/IAlbum.model';
import { ITrack } from '../../model/ITrack.model';
import { IGenre } from '../../model/IGenre.model';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { IArtist } from '../../model/IArtist.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AlbumListComponent, PlaylistListComponent, RouterLink, LoadingComponent ,NgForOf,RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('newReleasesCarousel') newReleasesCarousel!: ElementRef<HTMLElement>;

  private spotify = inject(SpotifyService);
  private playlistService = inject(SpotifyPlaylistService);
  private playerService = inject(SpotifyPlayerService);

  // State signals
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  recentPlaylists = signal<IPlaylist[]>([]);
  personalizedPlaylists = signal<IPlaylist[]>([]);
  newReleases = signal<IAlbum[]>([]);
  genres = signal<IGenre[]>([]);
  recentTracks = signal<ITrack[]>([]);

  async ngOnInit() {
    await this.loadAllData();
  }

  async loadAllData() {
    try {
      const [recent, personalized, releases, genreData, tracks] = await Promise.all([
        this.getRecentPlaylists(),
        this.getPersonalizedPlaylists(),
        this.getNewReleases(),
        this.getGenres(),
        this.getRecentlyPlayed()
      ]);

      this.recentPlaylists.set(recent);
      this.personalizedPlaylists.set(personalized);
      this.newReleases.set(releases);
      this.genres.set(genreData);
      this.recentTracks.set(tracks);
      this.isLoading.set(false);

    } catch (error) {
      console.error('Error loading home data:', error);
      this.errorMessage.set('Failed to load data. Please try again later.');
      this.isLoading.set(false);
    }
  }

  // Data fetching methods with proper typing
  private async getRecentPlaylists(): Promise<IPlaylist[]> {
    try {
      const response = await this.playlistService.getCurrentUserPlaylists({ limit: 10 });
      return response.items.map((item:any) => this.mapPlaylist(item));
    } catch (error) {
      console.error('Error fetching recent playlists:', error);
      return [];
    }
  }

  private async getPersonalizedPlaylists(): Promise<IPlaylist[]> {
    try {
      const response = await this.spotify.getFeaturedPlaylists()
      return response.playlists.items
        .filter(item => item.images !== null && item.images.length > 0) 
        .map(item => this.mapPlaylist(item))
        

    } catch (error) {
      console.error('Error fetching personalized playlists:', error);
      return [];
    }
  }

  private async getNewReleases(): Promise<IAlbum[]> {
    try {
      const response = await this.spotify.getNewReleases();
      return response.albums.items.map(item => this.mapAlbum(item));
    } catch (error) {
      console.error('Error fetching new releases:', error);
      return [];
    }
  }

  private async getGenres(): Promise<IGenre[]> {
    try {
      const response = await this.spotify.getAvailableGenres();
      return response.genres.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        imageUrl: this.getGenreImage(name)
      }));
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }

  private async getRecentlyPlayed(): Promise<ITrack[]> {
    try {
      const response = await this.spotify.getRecentlyPlayedTracks();
      return response.items.map(item => this.mapTrack(item.track));
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      return [];
    }
  }

  // Proper type mapping functions
  private mapPlaylist(item: any): IPlaylist {
    return item as IPlaylist
  }

  private mapAlbum(item: any): IAlbum {
    return  item as IAlbum
  }

  private mapTrack(item: any): ITrack {
    return  item as ITrack
  }

  // Player controls
  playPlaylist(playlistId: string) {
    this.playerService.playPlaylistContext(`spotify:playlist:${playlistId}`, 0);
  }

  playAlbum(albumId: string) {
    this.playerService.playAlbumContext(`spotify:album:${albumId}`, 0);
  }

  playTrack(track: ITrack) {
    console.log(track.uri);
    this.playerService.playTrackContext(track.uri);
  }

  // Carousel controls
  scrollLeft() {
    this.scrollCarousel(-300);
  }


  scrollRight() {
    this.scrollCarousel(300);
  }

  private scrollCarousel(amount: number) {
    if (this.newReleasesCarousel?.nativeElement) {
      this.newReleasesCarousel.nativeElement.scrollBy({
        left: amount,
        behavior: 'smooth'
      });
    }
  }

  // Genre image helper
  private getGenreImage(name: string): string {
    const genreImages: { [key: string]: string } = {
      rock: '/assets/genres/rock.jpg',
      pop: '/assets/genres/pop.jpg',
      jazz: '/assets/genres/jazz.jpg',
      // Add more genre images as needed
    };
    return genreImages[name.toLowerCase()] || '/assets/genres/default.jpg';
  }

  // Featured play handler
  playFeatured() {
    const relases = this.newReleases().length > 0 ? this.newReleases() : this.recentTracks().length > 0 ? this.recentTracks() : this.recentPlaylists().length > 0 ? this.recentPlaylists() : [];
    if (relases.length > 0 && relases[0].id) {
      this.playAlbum(relases[0].id);
    }
  }
  // get the artist name from the track object
  getArtist(artists: IArtist[]): string {
    return artists && artists.length > 0 ? artists[0].name : 'Unknown';
  }
  
}