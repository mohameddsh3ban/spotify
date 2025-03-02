import { Component, ViewChild, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  searchQuery: string = ''; // Bind this to the input
searchType: string = 'track'; // Default value: search all types
  constructor(private router: Router) {}  // Inject the Router

  onSearch(): void {  // Call this when the user presses Enter or clicks a search button.  Remove if using option 1
    this.router.navigate(['/search', {query: this.searchQuery, type:this.searchType }]);
  }
  onSearchInputChange(event: any): void {
    this.searchQuery = event.target.value;
     //Option 1: Navigate on every key press (least efficient)
    //  this.router.navigate(['/search', this.searchQuery]);
  }
  onSearchTypeChange(event: any): void {
    this.searchType = event.target.value;
     //Option 1: Navigate on every key press (least efficient)
    //  this.router.navigate(['/search', this.searchQuery]);
  }

}
