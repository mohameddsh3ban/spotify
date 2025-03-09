// src/app/core/layout/sidebar/sidebar.component.ts

import {
  Component,
  OnInit,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// import { faHome, faSearch, faBook, faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fromEvent, Subject, takeUntil, throttleTime } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ListAComponent } from "../../shared/list-a/list-a.component";



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, ListAComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidebar', { static: false }) sidebarElement!: ElementRef;
 
  spotifySrv = inject(SpotifyService)
  isExpanded = false;
  activeRoute: string = '';
  sidebarWidth = signal(80); // Initial width
  minWidth = 80; // Minimum width
  maxWidth = 400; // Maximum width
  isResizing = false;
isMobile = signal(window.innerWidth < 768);
  private destroy$ = new Subject<void>(); // RxJS Subject for unsubscribing

  constructor(private router: Router , private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
// this.spotifySrv.getCurrentUserPlaylists().then(console.log) 
// this.spotifySrv.getArtist('0TnOYISbd1XYRBk9myaseg').then(console.log)
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Ensure the view is updated
    if (this.sidebarElement) {
      this.sidebarWidth.set(this.sidebarElement.nativeElement.offsetWidth);
  
      const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
        throttleTime(100),
        takeUntil(this.destroy$)
      );
  
      const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
        takeUntil(this.destroy$)
      );
  
      mouseMove$.subscribe((event) => this.resize(event));
      mouseUp$.subscribe(() => this.stopResizing());
    } else {
      console.error('Sidebar element is not available in ngAfterViewInit.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    if (this.sidebarWidth() < 250) {
      this.sidebarWidth.set(500);
    } else {
      this.sidebarWidth.set(80);
    }
  }

  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    event.preventDefault(); // Prevent text selection during drag
  }

  resize = (event: MouseEvent) => {
    if (!this.isResizing) {
      return;
    }

    if (this.sidebarElement) {
      event.preventDefault(); // Prevent text selection during drag
      const rect = this.sidebarElement.nativeElement.getBoundingClientRect();
      let newWidth = event.clientX - rect.left; // Use clientX relative to sidebar
      if(newWidth<200){
        newWidth = 80
      }
      // Clamp the width
      newWidth = Math.max(this.minWidth, Math.min(newWidth, this.maxWidth));
      
      this.sidebarWidth.set(newWidth);
    }
  };

  stopResizing = () => {
    this.isResizing = false;
  };
  
}
