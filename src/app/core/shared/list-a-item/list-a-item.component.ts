import { Component, ElementRef, input, signal, ViewChild, viewChild } from '@angular/core';
import { IPlaylist } from '../../model/IPlaylist.model';
import { fromEvent, throttleTime } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-a-item',
  imports: [RouterLink],
  templateUrl: './list-a-item.component.html',
  styleUrl: './list-a-item.component.css'
})
export class ListAItemComponent {
   item = input.required<IPlaylist>() 
isExpanded = input.required()

}
