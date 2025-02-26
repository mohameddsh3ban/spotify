import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpotifyAuthService } from './spotify-auth.service';

@Injectable({
    providedIn: 'root'
})
export class SpotifyApiService {

    private readonly http = inject(HttpClient);
    private authService = inject(SpotifyAuthService);
    private baseUrl = 'https://api.spotify.com/v1';  // Base URL for Spotify API


    // Generic API Call
    async spotifyApiCall<T>(method: 'get' | 'post' | 'put' | 'delete', endpoint: string, options: { headers?: HttpHeaders; params?: HttpParams; body?: any } = {}): Promise<T> {
        try {
            const accessToken = await this.authService.ensureValidToken();
            const url = `${this.baseUrl}/${endpoint}`; // Construct full URL

            const headers = options.headers ? options.headers.set('Authorization', `Bearer ${accessToken}`) : new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });

            const requestOptions = { ...options, headers };

            let response: any;

            switch (method) {
                case 'get':
                    response = await firstValueFrom(this.http.get<T>(url, requestOptions));
                    break;
                case 'post':
                    response = await firstValueFrom(this.http.post<T>(url, options.body, requestOptions));
                    break;
                case 'put':
                    response = await firstValueFrom(this.http.put<T>(url, options.body, requestOptions));
                    break;
                case 'delete':
                    response = await firstValueFrom(this.http.delete<T>(url, requestOptions));
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            return response;
        } catch (error: any) {
            console.error(`Error during Spotify API call to ${endpoint}:`, error);
            throw error;
        }
    }
}