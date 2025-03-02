// search-page.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ITrack as Track } from '../../model/ITrack.model';
import { IAlbum as Album } from '../../model/IAlbum.model';
import { IArtist as Artist } from '../../model/IArtist.model';
import { IPlaylist as Playlist } from '../../model/IPlaylist.model';
import { LoadingComponent } from "../../components/loading/loading.component";

type SearchType = 'artist' | 'album' | 'track' | 'playlist';
type SearchResult = Artist & Album & Track & Playlist;

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
  imports: [RouterLink, LoadingComponent]
})
export class SearchPageComponent implements OnInit, OnDestroy {
  searchResults: SearchResult[] = [];
  isLoading = false;
  errorMessage = '';
  currentType: SearchType | null = null;

  private unsubscribe$ = new Subject<void>();
  private spotifyService = inject(SpotifyService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}