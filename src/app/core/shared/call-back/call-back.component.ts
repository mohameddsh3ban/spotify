import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';
import { SpotifyAuthService } from '../../services/spotify-auth.service';


@Component({
    selector: 'app-callback',
    standalone: true,
    imports: [CommonModule],
    template: '<p>Handling Spotify authentication callback...</p>' // Simple loading message
})
export class CallbackComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private authService: SpotifyAuthService
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const code = params['code'];
            const state = params['state'];

            if (code) {
                this.authService.handleCallback(code, state).then(() => {
             
                }).catch(error => {
                    // Handle error (e.g., navigate to error page)
                    console.error('Error handling callback:', error);
                });
            } else {
                const error = params['error'];
                console.error('Spotify authentication error:', error);
                // Handle error (e.g., navigate to error page)
                
            }
        });
    }

}
