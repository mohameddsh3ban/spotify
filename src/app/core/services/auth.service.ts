import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  isLoggedIn(): boolean {
    // Implement your authentication logic here
    // For example, check if a token is stored in localStorage
    return localStorage.getItem('token') !== null;
  }

  logout(): void {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
