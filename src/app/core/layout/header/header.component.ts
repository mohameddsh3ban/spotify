import { Component, HostListener, inject, ViewChild, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SpotifyAuthService } from '../../services/spotify-auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  searchQuery: string = ''; // Bind this to the input
searchType: string = 'track'; // Default value: search all types
showDropdown = false;
 private authService = inject(SpotifyAuthService);
  private router = inject(Router);

  onSearch(): void {  
    this.router.navigate(['/search', {query: this.searchQuery, type:this.searchType }]);
  }
  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
    
  }
  onSearchTypeChange(event: any): void {
    this.searchType = event.target.value;

  }


  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown state:', this.showDropdown);
  }

  logout(): void {
    // Add your logout logic here
    console.log('Logging out...');
    // this.showDropdown = false;
     this.authService.logout();
    this.router.navigate(['/login']);
  }


}
