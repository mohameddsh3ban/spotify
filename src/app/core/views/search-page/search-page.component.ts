// search-page.component.ts
import { Component, OnInit, OnDestroy, inject, input, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ITrack as Track } from '../../model/ITrack.model';
import { IAlbum as Album } from '../../model/IAlbum.model';
import { IArtist as Artist } from '../../model/IArtist.model';
import { IPlaylist as Playlist } from '../../model/IPlaylist.model';
import { LoadingComponent } from "../../components/loading/loading.component";
import { DatePipe } from '@angular/common';
import { DurationPipe } from "../../shared/pipes/duration.pipe";
import { SpotifyPlayerService } from '../../services/spotify-player.service';

type SearchType = 'artist' | 'album' | 'track' | 'playlist';
type SearchResult = Artist & Album & Track & Playlist;

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
  imports: [RouterLink, LoadingComponent, DatePipe, DurationPipe]
})
export class SearchPageComponent implements OnInit, OnDestroy {

  searchTerm:string = '';
  searchResults: SearchResult[] = [];
  isLoading = false;
  errorMessage = '';
  currentType: SearchType | null   = null;
  private unsubscribe$ = new Subject<void>();
  private spotifyService = inject(SpotifyService);
  private playerService = inject(SpotifyPlayerService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    if(this.route.snapshot.paramMap.has('query')) {
      this.route.paramMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(params => {
        const query = params.get('query');
        const type = params.get('type') as SearchType | null;

        if (query && this.isValidSearchType(type)) {
          this.currentType = type;
          this.performSearch(query, type);
        }
      });
    }


  }

  // Add this public method
  public parentSearch(term: string, type: SearchType): void {
    this.searchTerm = term;
    this.currentType = type;
    this.performSearch(term, type);
  }

  private isValidSearchType(type: string | null): type is SearchType {
    return ['artist', 'album', 'track', 'playlist'].includes(type || '');
  }

  async performSearch(term: string, type: SearchType): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      const data = await this.spotifyService.searchForItem(
        term, 
        [type], // Pass as array if service expects multiple types
        { limit: 20 }
      );


      this.searchResults = this.processSearchResults(data, type);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    } finally {
      this.isLoading = false;
    }
  }

  private processSearchResults(data: any, type: SearchType): SearchResult[] {
    console.log(data);
    switch (type) {
      case 'artist':
        return data.artists?.items || [];
      case 'album':
        console.log(data.albums?.items);
        return data.albums?.items || [];
      case 'track':
       
        return data.tracks?.items || [];
      case 'playlist':
        return data.playlists?.items || [];
      default:
        return [];
    }
  }

  getImageUrl(item: SearchResult): string | undefined {
    if (this.isArtist(item)) return item.images?.[0]?.url;
    if (this.isAlbum(item)) return item.images?.[0]?.url;
    if (this.isTrack(item)) return item.album?.images?.[0]?.url;
    if (this.isPlaylist(item)) return item.images?.[0]?.url;
    return undefined;
  }

  // Type guards for safe type narrowing
  isArtist(item: SearchResult){
    return this.currentType === 'artist';
  }

  isAlbum(item: SearchResult){
    return  this.currentType === 'album';
  }

  isTrack(item: SearchResult){
    return  this.currentType === 'track';
  }

  isPlaylist(item: SearchResult) {
    return  this.currentType === 'playlist';
  }
  playTrack(track: any) {
    this.playerService.playTrackContext(
      track.uri,
      track.album?.uri, 
      track.track_number - 1
    );
  }
  
  playAlbum(albumId: string) {
    this.playerService.playAlbumContext(`spotify:album:${albumId}`);
  }
  
  playPlaylist(playlistId: string) {
    this.playerService.playPlaylistContext(`spotify:playlist:${playlistId}`, 0);
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}