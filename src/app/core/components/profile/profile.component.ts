import { Component, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { IUserProfile } from '../../model/IUserProfile.model';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
private spotifySrv = inject(SpotifyService)

constructor(){
this.spotifySrv.getCurrentUserProfile().then(res => this.userProfile = res).finally(() => console.log(this.userProfile));  
 
}
public userProfile:IUserProfile | undefined

}
