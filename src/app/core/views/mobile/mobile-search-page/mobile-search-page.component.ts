// mobile-search-page.component.ts
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchPageComponent } from '../../search-page/search-page.component';

type SearchType = 'artist' | 'album' | 'track' | 'playlist';

@Component({
  selector: 'app-mobile-search-page',
  imports:[SearchPageComponent],
  templateUrl: './mobile-search-page.component.html',
  styleUrls: ['./mobile-search-page.component.css']
})
export class MobileSearchPageComponent {
  @ViewChild(SearchPageComponent) searchPageComponent!: SearchPageComponent;
  
  searchQuery: string = '';
  searchType: SearchType = 'track';
isSearching: boolean = false;
  constructor(private router: Router) {}

  onSearch(): void {

    if (this.searchQuery.trim()) {
      // Call child component's method directly
      this.searchPageComponent.parentSearch(this.searchQuery, this.searchType);
      
      // Update URL (optional)
      this.router.navigate([], {
        queryParams: { 
          query: this.searchQuery,
          type: this.searchType
        },
        queryParamsHandling: 'merge'
      });
      this.isSearching=true
    }
  }

  onSearchInputChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    if (this.searchQuery.trim()) {
      this.onSearch();
    }
  }

  onSearchTypeChange(event: Event): void {
    this.searchType = (event.target as HTMLSelectElement).value as SearchType;
    if (this.searchQuery.trim()) {
      this.onSearch();
    }
  }
}