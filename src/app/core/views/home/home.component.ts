import { Component, OnInit, inject } from '@angular/core';
import { HeroComponent } from "../../components/hero/hero.component";
import { SpotifyService } from '../../services/spotify.service';
import { AlbumListComponent } from "../../components/album-list/album-list.component";
import { PlaylistListComponent } from "../../components/playlist-list/playlist-list.component";
// import { PodcastListComponent } from "../../components/podcast-list/podcast-list.component";
// import { LiveRadioListComponent } from "../../components/live-radio-list/live-radio-list.component";
import { IPodcast } from '../../model/IPodcast.model';
import { IPlaylistItem } from '../../model/IPlaylistItem.model';
import { IAlbum } from '../../model/IAlbum.model';
import { ILiveRadio } from '../../model/liveRadio.model';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { NgIf ,CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [HeroComponent, AlbumListComponent, PlaylistListComponent  ,CommonModule  ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  private spotifyService = inject(SpotifyService);
  private spotifyPlaylistService = inject(SpotifyPlaylistService);

  // Featured Sections Data
  newReleases: IAlbum[] = [];
  trending: IAlbum[] = [];
  topMixes: IPlaylistItem[] = [];
 

  // Genre & Mood Playlists Data
  madeForYou: IPlaylistItem[] = [];
  moodPlaylists: IPlaylistItem[] = [];
  discoverNewMusic: IPlaylistItem[] = [];

  // Podcasts Data (Spotify doesn't have a dedicated "Podcast" API, so this is an example)
  popularPodcasts: IPodcast[] = [];
  userPodcasts: IPodcast[] = [];

  // Live & Exclusive Data (Similarly, this is an example; you'll likely need to find external radio APIs)
  liveRadios: ILiveRadio[] = [];
  specialReleases: IAlbum[] = [];

  ngOnInit(): void {
    this.loadHomeData();
  }

  async loadHomeData(): Promise<void> {
    try {
      // **Featured Sections**
      this.newReleases = await this.getNewReleases();
      this.trending = await this.getTrending();
      this.topMixes = await this.getTopMixes();
   

      // // **Genre & Mood Playlists**
      this.madeForYou = await this.getMadeForYouPlaylists();
      this.moodPlaylists = await this.getMoodPlaylists();
      this.discoverNewMusic = await this.getDiscoverNewMusicPlaylists();

      // // **Podcasts** (Placeholder - Needs a different API source)
      // this.popularPodcasts = await this.getPopularPodcasts();
      // this.userPodcasts = await this.getUserPodcasts();

      // // **Live & Exclusive** (Placeholder - Needs a different API source)
      // this.liveRadios = await this.getLiveRadios();
      // this.specialReleases = await this.getSpecialReleases();

    } catch (error) {
      console.error('Error loading home data:', error);
      // Handle the error (e.g., display an error message to the user)
    }
  }

  // -----------------------
  // Data Fetching Methods (Spotify API Calls)
  // -----------------------

    async getNewReleases(): Promise<IAlbum[]> {
        try {
            const response = await this.spotifyService.searchForItem('new releases', ['album'], { limit: 10 });

            if (response && response.albums && response.albums.items) {
                return response.albums.items.map((item: any) => ({
                    name: item.name,
                    artist: item.artists.map((artist: any) => artist.name).join(', '),
                    imageUrl: item.images[0].url,
                    id: item.id
                }));
            } else {
                console.warn('Unexpected response format for new releases:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching New Releases:', error);
            return [];
        }
    }

    async getTrending(): Promise<IAlbum[]> {
        try {
            const response = await this.spotifyService.searchForItem('trending', ['album'], { limit: 10 });

            if (response && response.albums && response.albums.items) {
                return response.albums.items.map((item: any) => ({
                    name: item.name,
                    artist: item.artists.map((artist: any) => artist.name).join(', '),
                    imageUrl: item.images[0].url,
                    id: item.id
                }));
            } else {
                console.warn('Unexpected response format for trending albums:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching Trending:', error);
            return [];
        }
    }

    async getTopMixes(): Promise<IPlaylistItem[]> {
        try {
            const response = await this.spotifyService.searchForItem('top mixes', ['playlist'], { limit: 10 });

            if (response && response.playlists && response.playlists.items) {
              
              //filtter out the playlist check for null 
             const  unNullItems = response.playlists.items.filter((item: any) => item !== null); 
            //  console.log(unNullItems);
                return unNullItems.map((item: any) => ({
                    name: item.name,
                    description: item.description || 'A collection of top mixes',
                    imageUrl: item.images[0].url,
                    id: item.id
                }));
            } else {
                console.warn('Unexpected response format for top mixes playlists:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching Top Mixes:', error);
            return [];
        }
    }


    async getMadeForYouPlaylists(): Promise<IPlaylistItem[]> {
        try {
            // Need to adjust the search query as 'made for you' playlists are usually personalized
            const response = await this.spotifyPlaylistService.getCurrentUserPlaylists({ limit: 10 });
console.log(response)
            if (response && response.items) {
                return response.items
            } else {
                console.warn('Unexpected response format for made for you playlists:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching Made For You Playlists:', error);
            return [];
        }
    }

    async getMoodPlaylists(): Promise<IPlaylistItem[]> {
        try {
            const response = await this.spotifyService.searchForItem('mood', ['playlist'], { limit: 10 });

            if (response && response.playlists && response.playlists.items) {
                // console.log(response.playlists.items)
                const unNullItems = response.playlists.items.filter((item: any) => item !== null);
                return unNullItems
            } else {
                console.warn('Unexpected response format for mood playlists:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching Mood Playlists:', error);
            return [];
        }
    }

    async getDiscoverNewMusicPlaylists(): Promise<IPlaylistItem[]> {
        try {
            const response = await this.spotifyService.searchForItem('discover new music', ['playlist'], { limit: 10 });

            if (response && response.playlists && response.playlists.items) {
                const unNullItems = response.playlists.items.filter((item: any) => item !== null);
                return unNullItems
            } else {
                console.warn('Unexpected response format for discover new music playlists:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching Discover New Music Playlists:', error);
            return [];
        }
    }



}
