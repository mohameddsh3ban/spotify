import { Component, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { fromEvent, Subject, takeUntil, throttleTime } from 'rxjs';


type ResizeSide = 'left' | 'right' | 'both';

@Component({
  selector: 'app-resizeable-container',
  imports: [],
  templateUrl: './resizeable-container.component.html',
  styleUrl: './resizeable-container.component.css'
})
export class ResizeableContainerComponent {
  @ViewChild('sidebar', { static: false }) sidebarElement!: ElementRef;
  @Input()resizeSide : ResizeSide = "right";
  spotifySrv = inject(SpotifyService)
  isExpanded = signal(true);
  @Input()sidebarWidth = signal(251); // Initial width
  @Input() minWidth = 100; // Minimum width
  @Input() maxWidth = 500; // Maximum width
  isResizing = false;

  private destroy$ = new Subject<void>(); // RxJS Subject for unsubscribing

  

  ngAfterViewInit(): void {
    if (this.sidebarElement) {
      this.sidebarWidth.set(this.sidebarElement.nativeElement.offsetWidth);

      const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
        throttleTime(100), // Roughly 60 FPS
        takeUntil(this.destroy$) // unsubscribe when the component is destroyed
      );

      const mouseUp$ = fromEvent<MouseEvent>(document, 'mouseup').pipe(
        takeUntil(this.destroy$) // unsubscribe when the component is destroyed
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
      // Clamp the width
      newWidth = Math.max(this.minWidth, Math.min(newWidth, this.maxWidth));
      this.sidebarWidth.set(newWidth);
    }
  };

  stopResizing = () => {
    this.isResizing = false;
  };
}
