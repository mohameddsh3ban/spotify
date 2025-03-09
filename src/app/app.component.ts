import { Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { SpotifyAuthService } from './core/services/spotify-auth.service';
import { HeaderComponent } from "./core/layout/header/header.component";
import { SidebarComponent } from "./core/layout/sidebar/sidebar.component";
import { ListAComponent } from "./core/shared/list-a/list-a.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [HeaderComponent, SidebarComponent,RouterOutlet,FooterComponent],
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
   readonly AuthService = inject(SpotifyAuthService);
  
  // Reactive signal for mobile detection
  public isMobile = signal(window.innerWidth < 768);

  // Computed signal for login status
  public userIsLoggedIn = computed(() => this.AuthService.userIsLoggedIn());

  // Resize handler
  private handleResize = () => {
    this.isMobile.set(window.innerWidth < 768);
  };

  constructor() {}

  ngOnInit(): void {
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }
}