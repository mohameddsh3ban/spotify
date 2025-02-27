import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  HostListener,
  signal,
} from '@angular/core';
import {
  Subscription,
  fromEvent,
  filter,
  debounceTime,
  switchMap,
  catchError,
  of,
  take,
} from 'rxjs';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ITrack } from '../../model/ITrack.model';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy, AfterViewInit {
  //-----Instance Variables ----//
  private subscriptions: Subscription[] = [];
  isPlaying = false;
  currentTrack: ITrack | null = null;
  artistsString = '';
  progressMs = 0;
  durationMs = 0;
  volumePercent = 80;
  isMuted = false;
  isShuffle = false;
  repeatState: 'track' | 'context' | 'off' = 'off';
  progressPercent = signal(0);
  firstPlay = true;

  @ViewChild('progressBar', { static: false }) progressBar:
    | ElementRef
    | undefined;
  @ViewChild('volumeBar', { static: false }) volumeBar: ElementRef | undefined;

  private playerService = inject(SpotifyPlayerService);
  private spotifyService = inject(SpotifyService);
  private animationFrameId: number = 0; // Store the animation frame ID

  //------Lifecycle Hooks-----//
  ngOnInit(): void {
    this.playerService.initializePlayer();

    // Load recently played AFTER player is ready
    this.subscriptions.push(
      this.playerService.playerReady$
        .pipe(
          
          filter((ready) => ready), // Only proceed if player is ready
          take(1),
          switchMap(() =>
            this.playerService.getRecentlyPlayed(1).pipe(
              catchError((error) => {
                console.error('Error fetching recently played:', error);
                return of(null); // Handle error gracefully
              })
            )
          )
        )
        .subscribe((res: any) => {
          if (res && res.items && res.items.length > 0) {
            this.currentTrack = res.items[0].track;
            console.log(res);
            if (this.currentTrack) {
              this.artistsString = this.currentTrack.artists
                .map((artist) => artist.name)
                .join(', ');
            }
            console.log(this.currentTrack);
          }
        })
    );

    this.subscriptions.push(
      this.playerService.playerReady$.subscribe((ready) => {
        if (ready) {
          console.log('Player is ready');
          this.playerService.transferPlayback();
          this.playerService.getVolume().subscribe((volume) => {
            if (volume !== null) {
              this.volumePercent = volume * 100;
            }
          });
        }
      })
    );

    this.subscriptions.push(
      this.playerService.currentState$.subscribe((state) => {
        if (state) {
          this.isPlaying = !state.paused;
          this.currentTrack = state.track_window.current_track as ITrack;
          this.durationMs = state.duration; // Capture the duration here
          this.isShuffle = state.shuffle;
          this.repeatState =
            state.repeat_mode === 0
              ? 'off'
              : state.repeat_mode === 1
              ? 'context'
              : 'track';
          // Ensure progressMs does not exceed durationMs
          this.progressMs = Math.min(state.position, this.durationMs);
          this.updateProgress();
          this.startProgressUpdates();

          if (this.currentTrack) {
            this.artistsString = this.currentTrack.artists
              .map((artist) => artist.name)
              .join(', ');
            console.log(this.artistsString, ':name');
          }
        } else {
          this.stopProgressUpdates();
          this.isPlaying = false;
          this.progressMs = 0;
          this.durationMs = 0;
          this.progressPercent.set(0);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (this.progressBar) {
      this.subscriptions.push(
        fromEvent(this.progressBar.nativeElement, 'click')
          .pipe(
            filter((event): event is MouseEvent => event instanceof MouseEvent),
            debounceTime(100)
          )
          .subscribe((event) => {
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
          .subscribe((event) => this.setVolume(event))
      );
    }
  }

  //----Player Methods ---- //

  togglePlay(): void {
    if(this.firstPlay){
      if (this.currentTrack) {
        this.firstPlay = false;
          this.playerService.playTrack(this.currentTrack.uri);
        }
      }
      this.playerService.togglePlay();
    }
   


  playNextTrack(): void {
    this.playerService.nextTrack();
  }

  playPreviousTrack(): void {
    this.playerService.previousTrack();
  }

  toggleRepeat(): void {
    const nextState =
      this.repeatState === 'off'
        ? 'context'
        : this.repeatState === 'context'
        ? 'track'
        : 'off';
    this.playerService.setRepeat(nextState);
  }

  toggleShuffle(): void {
    const nextState = !this.isShuffle;
    this.playerService.setShuffle(nextState);
  }

  seekTo(event: MouseEvent): void {
    if (this.progressBar && this.durationMs) {
      const progressBarRect =
        this.progressBar.nativeElement.getBoundingClientRect();
      const clickX = event.clientX - progressBarRect.left;
      const newPositionPercent = clickX / progressBarRect.width;
      const newPositionMs = newPositionPercent * this.durationMs;

      // set the current progressMS value
      this.progressMs = newPositionMs;
      // then update the player
      this.playerService.seek(newPositionMs);
      this.updateProgress();
    }
  }

  setVolume(event: MouseEvent): void {
    if (this.volumeBar) {
      const volumeBarRect =
        this.volumeBar.nativeElement.getBoundingClientRect();
      const clickX = event.clientX - volumeBarRect.left;
      const newVolumePercent = clickX / volumeBarRect.width;
      this.playerService.setVolume(newVolumePercent);
      this.volumePercent = newVolumePercent * 100;
    }
  }

  updateProgress(): void {
    // Safely update progressPercent only if durationMs is valid
    if (this.durationMs > 0) {
      this.progressPercent.set(
        Math.min(100, (this.progressMs / this.durationMs) * 100)
      );
    } else {
      this.progressPercent.set(0);
    }
  }

  formatTime(ms: number): string {
    if (isNaN(ms) || ms < 0) {
      return '0:00';
    }
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${displaySeconds}`;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePlay();
    } else if (event.code === 'ArrowRight') {
      this.seekRelative(5000);
    } else if (event.code === 'ArrowLeft') {
      this.seekRelative(-5000);
    }
  }

  seekRelative(ms: number) {
    this.progressMs = Math.max(
      0,
      Math.min(this.progressMs + ms, this.durationMs)
    );
    this.playerService.seek(this.progressMs);
  }

  //--- Progress Updates ---//
  startProgressUpdates(): void {
    if (!this.animationFrameId && this.isPlaying && this.durationMs > 0) {
      this.animationFrameId = requestAnimationFrame(
        this.updateProgressContinuously.bind(this)
      );
    }
  }

  stopProgressUpdates(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  updateProgressContinuously(): void {
    if (this.isPlaying && this.durationMs > 0) {
      // Add a check to ensure durationMs is valid
      this.progressMs = Math.min(this.progressMs + 1000 / 60, this.durationMs); // Increment based on frame rate
      this.updateProgress();
    }
    if (this.isPlaying && this.progressMs < this.durationMs) {
      this.animationFrameId = requestAnimationFrame(
        this.updateProgressContinuously.bind(this)
      );
    } else {
      this.stopProgressUpdates();
    }
  }

  toggleMute() {
    if (this.isMuted) this.playerService.setVolume(this.volumePercent);
    else {
      this.playerService.setVolume(0);
    }
    this.isMuted = !this.isMuted;
  }
  checkIsSaved(track: any) {
    this.spotifyService.checkUserSavedTracks([track.id]).then((response) => {
     return response[0];
    })
    
  }
  ngOnDestroy(): void {
    this.playerService.disconnectPlayer();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.stopProgressUpdates();
  }
}