import { Component, input } from '@angular/core';
import { IAlbum } from '../../model/IAlbum.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-album-list',
  imports: [ RouterLink],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.css'
})
export class AlbumListComponent {
 albums = input.required<IAlbum[]>();
 ngAfterViewInit() {  
  console.log(this.albums());
 }
}
