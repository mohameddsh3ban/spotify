import { Component, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { IUserProfile } from '../../model/IUserProfile.model';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
private spotifySrv = inject(SpotifyService)

constructor(){
this.spotifySrv.getUserTopArtistsAndTracks('artists', {time_range: 'short_term', limit: 6}).then(console.log)
 
}

 
}
