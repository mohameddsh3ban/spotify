import { Component, ElementRef, input, signal, ViewChild, viewChild } from '@angular/core';
import { IPlaylistItem } from '../../model/IPlaylistItem.model';
import { fromEvent, throttleTime } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-a-item',
  imports: [RouterLink],
  templateUrl: './list-a-item.component.html',
  styleUrl: './list-a-item.component.css'
})
export class ListAItemComponent {
   item = input.required<IPlaylistItem>() 
isExpanded = input.required()
    // {
    // collaborative: false,
    // description: "Playlist created by the tutorial on developer.spotify.com",
    // external_urls: {
    //   spotify: "https://open.spotify.com/playlist/5ejWd65g4N4tbfRITu3Age"
    // },
    // href: "https://api.spotify.com/v1/playlists/5ejWd65g4N4tbfRITu3Age",
    // id: "5ejWd65g4N4tbfRITu3Age",
    // images: [
    //   {
    //     height: 640,
    //     url: "https://mosaic.scdn.co/640/ab67616d00001e024654ace6e2337cc61f6d6409ab67616d00001e028d7f3300dd80d2704664ff16ab67616d00001e028db9ae6c73c671d4cf30e9f5ab67616d00001e02f17d43353ca312aa24590040",
    //     width: 640
    //   },
    //   // ... include all image entries here
    // ],
    // name: "My top tracks playlist",
    // owner: {
    //   display_name: "mohamed shaban",
    //   external_urls: {
    //     spotify: "https://open.spotify.com/user/316rau62daqe2i76sqn4mn7qdgfq"
    //   },
    //   href: "https://api.spotify.com/v1/users/316rau62daqe2i76sqn4mn7qdgfq",
    //   id: "316rau62daqe2i76sqn4mn7qdgfq",
    //   type: "user",
    //   uri: "spotify:user:316rau62daqe2i76sqn4mn7qdgfq"
    // },
    // primary_color: null,
    // public: true,
    // snapshot_id: "AAAAAkiFh8zLz7EHlSoXvoJLIq6RQwwB",
    // tracks: {
    //   href: "https://api.spotify.com/v1/playlists/5ejWd65g4N4tbfRITu3Age/tracks",
    //   total: 5
    // },
    // type: "playlist",
    // uri: "spotify:playlist:5ejWd65g4N4tbfRITu3Age"
  // };

}
