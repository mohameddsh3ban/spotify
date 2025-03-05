import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { IPlaylist } from '../../model/IPlaylist.model';
import { RouterLink } from '@angular/router';
import { SpotifyPlayerService } from '../../services/spotify-player.service';


@Component({
  selector: 'app-playlist-list',
  templateUrl: './playlist-list.component.html',
  imports:[RouterLink],
  styleUrl: './playlist-list.component.css'
})
export class PlaylistListComponent   {
  @Output() play = new EventEmitter<string>();
playlists = input.required<IPlaylist[]>();
ngOnInit() {
  console.log('playlist ',
    this.playlists());
}

 playPlaylist(playlistId: string) {
    this.play.emit(playlistId);
  }


}
