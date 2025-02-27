import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SpotifyAuthService } from '../services/spotify-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: SpotifyAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {  // Return boolean directly
    const isLoggedIn = this.authService.userIsLoggedIn(); // Call the Signal
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}