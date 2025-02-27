import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpotifyAuthService } from './spotify-auth.service';

// Optional: HTTP Method Enum
enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}

// Interface for Request Options
interface RequestOptions {
    headers?: HttpHeaders;
    params?: HttpParams;
    body?: any;
    // Add other options as needed (e.g., observe, reportProgress)
}

@Injectable({
    providedIn: 'root'
})
export class SpotifyApiService {

    private readonly http = inject(HttpClient);
    private authService = inject(SpotifyAuthService);
    private baseUrl = 'https://api.spotify.com/v1';  // Base URL for Spotify API

    // Generic API Call
    async spotifyApiCall<T>(method: HttpMethod | string, endpoint: string, options: RequestOptions = {}): Promise<T> {
        try {
            const accessToken = await this.authService.ensureValidToken();

            // Create Headers with Authorization
            const headers = options.headers ? options.headers.set('Authorization', `Bearer ${accessToken}`) : new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });

            const requestOptions = { ...options, headers };
            const url = `${this.baseUrl}/${endpoint}`; // Construct full URL

            let response: T;

            switch (method) {
                case HttpMethod.GET:
                    response = await firstValueFrom(this.http.get<T>(url, requestOptions));
                    break;
                case HttpMethod.POST:
                    response = await firstValueFrom(this.http.post<T>(url, options.body, requestOptions));
                    break;
                case HttpMethod.PUT:
                    response = await firstValueFrom(this.http.put<T>(url, options.body, requestOptions));
                    break;
                case HttpMethod.DELETE:
                    response = await firstValueFrom(this.http.delete<T>(url, requestOptions));
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            return response;
        } catch (error: any) {
            let errorMessage = `Error during Spotify API call to ${endpoint}: `;
            if (error instanceof HttpErrorResponse) {
                errorMessage += `Status ${error.status}, Body: ${JSON.stringify(error.error)}`;
            } else {
                errorMessage += error.message || error; // Default error message
            }
            console.error(errorMessage);
            throw error; // Re-throw the error
        }
    }
}