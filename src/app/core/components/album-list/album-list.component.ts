import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { IAlbum } from '../../model/IAlbum.model';
import { RouterLink } from '@angular/router';
import { SpotifyPlayerService } from '../../services/spotify-player.service';

@Component({
  selector: 'app-album-list',
  imports: [ RouterLink],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.css'
})

export class AlbumListComponent {
    @Output() play = new EventEmitter<string>();
 albums = input.required<IAlbum[]>();
 ngAfterViewInit() {  
  console.log(this.albums());
 }
 private playerService = inject(SpotifyPlayerService);

playAlbum(playlistId: string) {
  this.play.emit(playlistId);
}
}
