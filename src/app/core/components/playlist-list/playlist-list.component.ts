import { Component, input } from '@angular/core';
import { IPlaylistItem } from '../../model/IPlaylistItem.model';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-playlist-list',
  templateUrl: './playlist-list.component.html',
  imports:[RouterLink],
  styleUrl: './playlist-list.component.css'
})
export class PlaylistListComponent   {
playlists = input.required<IPlaylistItem[]>();


}
