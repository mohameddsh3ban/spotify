import { Component, ElementRef, inject, Input, signal, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ListAItemComponent } from "../list-a-item/list-a-item.component";
import { SpotifyService } from '../../services/spotify.service';
import { IPlaylistItem } from '../../model/IPlaylistItem.model';
import { SpotifyPlaylistService } from '../../services/spotify-playlist.service';

@Component({
  selector: 'app-list-a',
  imports: [ListAItemComponent],
  templateUrl: './list-a.component.html',
  styleUrl: './list-a.component.css'
})
export class ListAComponent implements AfterViewInit, OnDestroy {
  @ViewChild('listA', { static: false }) listAElm!: ElementRef<HTMLDivElement>;

  private spotifyPlaylistSrv = inject(SpotifyPlaylistService);
  @Input() items = signal<IPlaylistItem[]>([]);
  isExpanded = signal(true);

  private resizeObserver: ResizeObserver | undefined;

  ngOnInit() {
    this.spotifyPlaylistSrv.getCurrentUserPlaylists().then(res => {
      this.items.set(res.items);
      console.log(this.items());
    });
  }

  ngAfterViewInit() {
    // Ensure element is available before handling resize
    if (this.listAElm && this.listAElm.nativeElement) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const width = entry.contentRect.width;
          this.isExpanded.set(width >= 200);
        }
      });

      this.resizeObserver.observe(this.listAElm.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}