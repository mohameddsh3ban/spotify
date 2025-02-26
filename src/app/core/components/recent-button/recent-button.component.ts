import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recent-button',
  imports: [],
  templateUrl: './recent-button.component.html',
  styleUrl: './recent-button.component.css'
})
export class RecentButtonComponent {
imgUrl = input.required<string>()
}
