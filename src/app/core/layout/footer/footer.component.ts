import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, inject, HostListener,signal } from '@angular/core';
import { Subscription, fromEvent, filter, debounceTime, single } from 'rxjs';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { NgIf, AsyncPipe } from '@angular/common';  // Import AsyncPipe
import { RouterLink } from '@angular/router';
import { ITrack } from '../../model/ITrack.model';


// Interface for the track object -  This makes things MUCH clearer and helps avoid error

@Component({
  selector: 'app-footer',
  standalone: true, //  use standalone: true
  imports: [NgIf, AsyncPipe, RouterLink], // Include AsyncPipe, RouterLink
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy, AfterViewInit {
toggleMute() {
throw new Error('Method not implemented.');
}

  //-----Instance Variables ----//
  private subscriptions: Subscription[] = [];
  isPlaying = false;
  currentTrack:ITrack | null = null;  // Use theITrack interface
  artistsString = '';
  progressMs = 0;
  durationMs = 0;
  volumePercent = 80;  // Initialize. Should come from service on startup
  isShuffle = false;
  repeatState: 'track' | 'context' | 'off' = 'off'; // 'off', 'context', 'track'
  progressPercent =signal(0)

  @ViewChild('progressBar', { static: false }) progressBar: ElementRef | undefined;
  @ViewChild('volumeBar', { static: false }) volumeBar: ElementRef | undefined;


  private playerService = inject(SpotifyPlayerService); // using Angular dependency injection

 //------Lifecycle Hooks-----//
 ngOnInit(): void {
  this.playerService.initializePlayer();

  // Initialize with null, but we'll update it with the last track if available
  // No need to set currentTrack = null here since it's already null by default

  this.subscriptions.push(
    this.playerService.currentState$.subscribe(state => {
      if (state) {
        // Playback is active, update all track-related info
        this.isPlaying = !state.paused;
        this.currentTrack = state.track_window.current_track as ITrack; // Update to current track
        this.progressMs = state.position;
        this.durationMs = state.duration;
        this.isShuffle = state.shuffle;
        this.repeatState = state.repeat_mode === 0 ? 'off' : state.repeat_mode === 1 ? 'context' : 'track';
        this.updateProgress();

        // Update artists string when we have a valid track
        if (this.currentTrack) {
          this.artistsString = this.currentTrack.artists
            .map(artist => artist.name)
            .join(', ');
        }
      } else {
        // Playback stopped, but retain currentTrack as the last played track
        this.isPlaying = false;
        this.progressMs = 0; // Reset progress since no track is playing
        this.durationMs = 0; // Reset duration
        this.progressPercent.set(0); // Reset progress bar

        // Do NOT reset currentTrack or artistsString here
        // They will retain the last played track's info
      }
    })
  );

  // Optional: Fetch initial state or last played track if needed
  this.playerService.getCurrentState().subscribe(initialState => {
    if (initialState && initialState.track_window?.current_track) {
      this.currentTrack = initialState.track_window.current_track as ITrack;
      this.artistsString = this.currentTrack.artists.map(artist => artist.name).join(', ');
      this.progressMs = initialState.position || 0;
      this.durationMs = initialState.duration || 0;
      this.isPlaying = !initialState.paused;
      this.updateProgress();
    }
  });
}
   ngAfterViewInit(): void {
       if (this.progressBar) {
          this.subscriptions.push(
            fromEvent(this.progressBar.nativeElement, 'click')
              .pipe(
                filter((event): event is MouseEvent => event instanceof MouseEvent),
                debounceTime(100)
              )
              .subscribe(event => {
                this.seekTo(event);
              })
          );
        }

       if (this.volumeBar) {
            this.subscriptions.push(
              fromEvent(this.volumeBar.nativeElement, 'click')
                 .pipe(
                   filter((event): event is MouseEvent => event instanceof MouseEvent),
                   debounceTime(100)
                 )
                .subscribe(event => this.setVolume(event))
            );
      }
  }


  ngOnDestroy(): void {
     this.playerService.disconnectPlayer();  //IMPORTANT to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe()); // VERY important!
  }


  //----Player Methods ---- //

  togglePlay(): void {
    this.playerService.togglePlay();
  }
    playNextTrack(): void {
     this.playerService.nextTrack();
  }
    playPreviousTrack(): void {
    this.playerService.previousTrack();
  }

    toggleRepeat(): void {
      // Cycle through the repeat states: 'off' -> 'context' -> 'track' -> 'off'
      const nextState = this.repeatState === 'off' ? 'context' : this.repeatState === 'context' ? 'track' : 'off';
        this.playerService.setRepeat(nextState).subscribe(() => {
          this.repeatState = nextState; //update value locally after request succeed
        });

    }
   toggleShuffle(): void {

     const nextState = !this.isShuffle  //determine nex state

        this.playerService.setShuffle(nextState).subscribe(() => {
            this.isShuffle = nextState; // Update local isShuffle AFTER success.
      });
  }


   seekTo(event: MouseEvent): void {
    if (this.progressBar && this.durationMs) {  // Make sure durationMs is valid
      const progressBarRect = this.progressBar.nativeElement.getBoundingClientRect();
      const clickX = event.clientX - progressBarRect.left;
      const newPositionPercent = (clickX / progressBarRect.width);
      const newPositionMs = newPositionPercent * this.durationMs;
      this.playerService.seek(newPositionMs);
    }
  }
   setVolume(event: MouseEvent): void {
    if (this.volumeBar) {
      const volumeBarRect = this.volumeBar.nativeElement.getBoundingClientRect();
      const clickX = event.clientX - volumeBarRect.left;
      const newVolumePercent = (clickX / volumeBarRect.width);
      this.playerService.setVolume(newVolumePercent);  //Set Via service
      this.volumePercent = newVolumePercent * 100;    //Update value immediately
    }
  }

  updateProgress(): void {
    this.progressPercent.set((this.durationMs > 0) ? (this.progressMs / this.durationMs) * 100 : 0);
  }
   formatTime(ms: number): string {
    if (isNaN(ms) || ms < 0) { // handle the invalid values
       return '0:00'
    }
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
     const displaySeconds = seconds < 10 ? `0${seconds}` : seconds; //for add 0 before single digit.

    return `${minutes}:${displaySeconds}`;
  }


    @HostListener('document:keydown', ['$event'])  //Key board short-cut
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      // Prevent scrolling when spacebar is pressed.
      event.preventDefault();
      this.togglePlay();
    } else if (event.code === "ArrowRight") { // forward
      this.seekRelative(5000); // Forward 5s

    }else if (event.code === "ArrowLeft") { // backward
       this.seekRelative(-5000); // backward 5s

    }
  }
   seekRelative(ms: number) {
    this.progressMs = Math.max(0, Math.min(this.progressMs + ms, this.durationMs))
     this.playerService.seek(this.progressMs);
   }

}