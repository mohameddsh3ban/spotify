import { Component, OnInit, inject } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { SpotifyService } from '../../services/spotify.service';
import { AlbumListComponent } from '../../components/album-list/album-list.component';
import { PlaylistListComponent } from '../../components/playlist-list/playlist-list.component';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { NgIf, CommonModule } from '@angular/common';
import { LoadingComponent } from '../../components/loading/loading.component';
import { IAlbum } from '../../model/IAlbum.model';
import { IPlaylist } from '../../model/IPlaylist.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ AlbumListComponent, PlaylistListComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private spotifyService = inject(SpotifyService);
  private spotifyPlaylistService = inject(SpotifyPlaylistService);

  // Loading state
  isLoading = true;
  totalComponentsToLoad = 7; // Hero + 2 album lists + 4 playlist lists
  loadedComponents = 0;

  // Featured Sections Data
  newReleases: IAlbum[] = [];
  trending: IAlbum[] = [];
  topMixes: IPlaylist[] = [];

  // Genre & Mood Playlists Data
  madeForYou: IPlaylist[] = [];
  moodPlaylists: IPlaylist[] = [];
  discoverNewMusic: IPlaylist[] = [];

  // Defer flags
  newReleasesLoaded = false;
  trendingLoaded = false;
  topMixesLoaded = false;
  madeForYouLoaded = false;
  moodPlaylistsLoaded = false;
  discoverNewMusicLoaded = false;

  ngOnInit(): void {
    this.loadHomeData();
  }

  async loadHomeData(): Promise<void> {
    try {
      // Fetch all data concurrently
      const [
        newReleases,
        trending,
        topMixes,
        madeForYou,
        moodPlaylists,
        discoverNewMusic
      ] = await Promise.all([
        this.getNewReleases(),
        this.getTrending(),
        this.getTopMixes(),
        this.getMadeForYouPlaylists(),
        this.getMoodPlaylists(),
        this.getDiscoverNewMusicPlaylists()
      ]);

      // Assign data and set defer flags
      this.newReleases = newReleases;
      this.newReleasesLoaded = true;

      this.trending = trending;
      this.trendingLoaded = true;

      this.topMixes = topMixes;
      this.topMixesLoaded = true;

      this.madeForYou = madeForYou;
      this.madeForYouLoaded = true;

      this.moodPlaylists = moodPlaylists;
      this.moodPlaylistsLoaded = true;

      this.discoverNewMusic = discoverNewMusic;
      this.discoverNewMusicLoaded = true;

      // Increment for hero component (assuming it loads instantly or has its own logic)
      this.onComponentLoaded(); // For <app-hero>
    } catch (error) {
      console.error('Error loading home data:', error);
      // Set all flags to true to proceed even on error
      this.newReleasesLoaded = this.trendingLoaded = this.topMixesLoaded = true;
      this.madeForYouLoaded = this.moodPlaylistsLoaded = this.discoverNewMusicLoaded = true;
      this.onComponentLoaded(); // Ensure hero is counted
    }
  }

  onComponentLoaded() {
    this.loadedComponents++;
    if (this.loadedComponents >= this.totalComponentsToLoad) {
      this.isLoading = false;
      console.log('All components and assets initialized!');
    }
  }

  // Data Fetching Methods
  async getNewReleases(): Promise<IAlbum[]> {
    try {
      const response = await this.spotifyService.searchForItem('new releases', ['album'], { limit: 10 });
      if (response?.albums?.items) {
        return response.albums.items.map((item: any) => ({
          name: item.name,
          artist: item.artists.map((artist: any) => artist.name).join(', '),
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for new releases:', response);
      return [];
    } catch (error) {
      console.error('Error fetching New Releases:', error);
      return [];
    }
  }

  async getTrending(): Promise<IAlbum[]> {
    try {
      const response = await this.spotifyService.searchForItem('trending', ['album'], { limit: 10 });
      if (response?.albums?.items) {
        return response.albums.items.map((item: any) => ({
          name: item.name,
          artist: item.artists.map((artist: any) => artist.name).join(', '),
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for trending albums:', response);
      return [];
    } catch (error) {
      console.error('Error fetching Trending:', error);
      return [];
    }
  }

  async getTopMixes(): Promise<IPlaylist[]> {
    try {
      const response = await this.spotifyService.searchForItem('top mixes', ['playlist'], { limit: 10 });
      if (response?.playlists?.items) {
        const unNullItems = response.playlists.items.filter((item: any) => item !== null);
        return unNullItems.map((item: any) => ({
          name: item.name,
          description: item.description || 'A collection of top mixes',
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for top mixes playlists:', response);
      return [];
    } catch (error) {
      console.error('Error fetching Top Mixes:', error);
      return [];
    }
  }

  async getMadeForYouPlaylists(): Promise<IPlaylist[]> {
    try {
      const response = await this.spotifyPlaylistService.getCurrentUserPlaylists({ limit: 10 });
      if (response?.items) {
        return response.items.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for made for you playlists:', response);
      return [];
    } catch (error) {
      console.error('Error fetching Made For You Playlists:', error);
      return [];
    }
  }

  async getMoodPlaylists(): Promise<IPlaylist[]> {
    try {
      const response = await this.spotifyService.searchForItem('mood', ['playlist'], { limit: 10 });
      if (response?.playlists?.items) {
        const unNullItems = response.playlists.items.filter((item: any) => item !== null);
        return unNullItems.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for mood playlists:', response);
      return [];
    } catch (error) {
      console.error('Error fetching Mood Playlists:', error);
      return [];
    }
  }

  async getDiscoverNewMusicPlaylists(): Promise<IPlaylist[]> {
    try {
      const response = await this.spotifyService.searchForItem('discover new music', ['playlist'], { limit: 10 });
      if (response?.playlists?.items) {
        const unNullItems = response.playlists.items.filter((item: any) => item !== null);
        return unNullItems.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          imageUrl: item.images[0]?.url || '',
          id: item.id
        }));
      }
      console.warn('Unexpected response format for discover new music playlists:', response);
      return [];
    } catch (error) {
      console.error('Error fetching Discover New Music Playlists:', error);
      return [];
    }
  }
}