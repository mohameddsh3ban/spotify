// list-a.component.ts
import { Component, ElementRef, inject, ViewChild, AfterViewInit, OnDestroy, signal, computed, input } from '@angular/core';
import { ListAItemComponent } from "../list-a-item/list-a-item.component";
import { IPlaylist } from '../../model/IPlaylist.model';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { LoadingComponent } from "../../components/loading/loading.component";

@Component({
  selector: 'app-list-a',
  standalone: true,
  imports: [ListAItemComponent, RouterLink, LoadingComponent],
  templateUrl: './list-a.component.html',
  styleUrl: './list-a.component.css'
})
export class ListAComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private nextUrl: string | null = null;
  private searchSubject = new Subject<string>();
  
  isLoadingMore = signal(false);
  hasMoreItems = signal(true);
  searchQuery = signal('');
  sortBy = signal<'name' | 'date'>('name');
  
  @ViewChild('listA', { static: false }) listAElm!: ElementRef<HTMLDivElement>;
  isMobile = input.required<boolean>();

  rawItems = signal<IPlaylist[]>([]);
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const sort = this.sortBy();
    
    return this.rawItems()
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
      });
  });

  private spotifyPlaylistSrv = inject(SpotifyPlaylistService);
  isExpanded = signal(true);
  private resizeObserver: ResizeObserver | undefined;

  ngOnInit() {
    this.loadInitialData();
    this.setupSearch();
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
  }

  async loadInitialData() {
    try {
      const response = await this.spotifyPlaylistSrv.getCurrentUserPlaylists({ limit: 20 });
      this.rawItems.set(response.items);
      this.nextUrl = response.next;
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  }

  async loadMoreData() {
    if (!this.nextUrl || this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    try {
      const response = await this.spotifyPlaylistSrv.getNextPage(this.nextUrl);
      this.rawItems.update(items => [...items, ...response.items]);
      this.nextUrl = response.next;
      this.hasMoreItems.set(!!response.next);
    } catch (error) {
      console.error('Failed to load more playlists:', error);
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  onScroll(event: Event) {
    console.log('onScroll');
    const element = this.listAElm.nativeElement;
    const threshold = 100;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;

    if (atBottom && this.hasMoreItems() && !this.isLoadingMore()) {
      this.loadMoreData();
    }
  }

  updateSearch(query: string) {
    this.searchSubject.next(query);
  }

  toggleSort() {
    this.sortBy.set(this.sortBy() === 'name' ? 'date' : 'name');
  }

  ngAfterViewInit() {
    if (this.listAElm?.nativeElement) {
      this.resizeObserver = new ResizeObserver(entries => {
        const width = entries[0].contentRect.width;
        this.isExpanded.set(width >= 200);
      });
      this.resizeObserver.observe(this.listAElm.nativeElement);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resizeObserver?.disconnect();
  }
}