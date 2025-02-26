import { Component, input } from '@angular/core';
import { IPodcast } from '../../model/IPodcast.model';

@Component({
  selector: 'app-podcast-list',
  imports: [],
  templateUrl: './podcast-list.component.html',
  styleUrl: './podcast-list.component.css'
})
export class PodcastListComponent {
  podcasts = input.required<IPodcast[]>();
}
