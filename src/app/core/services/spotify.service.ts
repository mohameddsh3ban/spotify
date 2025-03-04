import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { SpotifyApiService } from './spotify-api.service';

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {

    private apiService = inject(SpotifyApiService);

    // Artist Endpoints
    async getArtist(artistId: string): Promise<any> {
        const endpoint = `artists/${artistId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getSeveralArtists(artistIds: string[]): Promise<any> {
        const endpoint = `artists`;
        const params = new HttpParams().set('ids', artistIds.join(','));
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getArtistAlbums(artistId: string): Promise<any> {
        const endpoint = `artists/${artistId}/albums`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<any> {
        const endpoint = `artists/${artistId}/top-tracks`;
        const params = new HttpParams().set('market', market);
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getRelatedArtists(artistId: string): Promise<any> {
        const endpoint = `artists/${artistId}/related-artists`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    // Album Endpoints
    async getAlbum(albumId: string): Promise<any> {
        const endpoint = `albums/${albumId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getSeveralAlbums(albumIds: string[]): Promise<any> {
        const endpoint = `albums`;
        const params = new HttpParams().set('ids', albumIds.join(','));
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getAlbumTracks(albumId: string): Promise<any> {
        const endpoint = `albums/${albumId}/tracks`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    // Category Endpoints
    async getSeveralBrowseCategories(options: { locale?: string; limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `browse/categories`;
        let params = new HttpParams();
        if (options.locale) params = params.set('locale', options.locale);
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getSingleBrowseCategory(categoryId: string, options: { locale?: string } = {}): Promise<any> {
        const endpoint = `browse/categories/${categoryId}`;
        let params = new HttpParams();
        if (options.locale) params = params.set('locale', options.locale);
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    // Search Endpoint
    async searchForItem(query: string, type: string[], options: { market?: string; limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `search`;
        let params = new HttpParams()
            .set('q', query)
            .set('type', type.join(','));

        if (options.market) params = params.set('market', options.market);
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());

        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    // Track Endpoints
    async getTrack(trackId: string): Promise<any> {
        const endpoint = `tracks/${trackId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getSeveralTracks(trackIds: string[], options: { market?: string } = {}): Promise<any> {
        const endpoint = `tracks`;
        let params = new HttpParams().set('ids', trackIds.join(','));
        if (options.market) params = params.set('market', options.market);
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getAudioFeaturesForTrack(trackId: string): Promise<any> {
        const endpoint = `audio-features/${trackId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getAudioFeaturesForSeveralTracks(trackIds: string[]): Promise<any> {
        const endpoint = `audio-features`;
        const params = new HttpParams().set('ids', trackIds.join(','));
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getAudioAnalysisForTrack(trackId: string): Promise<any> {
        const endpoint = `audio-analysis/${trackId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    // User Endpoints
    async getCurrentUserProfile(): Promise<any> {
        const endpoint = `me`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getUserProfile(userId: string): Promise<any> {
        const endpoint = `users/${userId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    // Library Endpoints
    async saveTracksForCurrentUser(trackIds: string[]): Promise<any> {
        const endpoint = `me/tracks`;
        return this.apiService.spotifyApiCall('put', endpoint, { params: new HttpParams().set('ids', trackIds.join(',')) });
    }

    async removeTracksForCurrentUser(trackIds: string[]): Promise<any> {
        const endpoint = `me/tracks`;
        return this.apiService.spotifyApiCall('delete', endpoint, { params: new HttpParams().set('ids', trackIds.join(',')) });
    }

    async checkUserSavedTracks(trackIds: string[]): Promise<any> {
        const endpoint = `me/tracks/contains`;
        return this.apiService.spotifyApiCall('get', endpoint, { params: new HttpParams().set('ids', trackIds.join(',')) });
    }

    async getUserSavedTracks(options: { limit?: number; offset?: number; market?: string } = {}): Promise<any> {
        const endpoint = `me/tracks`;
        let params = new HttpParams();
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        if (options.market) params = params.set('market', options.market);
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async saveAlbumsForCurrentUser(albumIds: string[]): Promise<any> {
        const endpoint = `me/albums`;
        return this.apiService.spotifyApiCall('put', endpoint, { params: new HttpParams().set('ids', albumIds.join(',')) });
    }

    async removeAlbumsForCurrentUser(albumIds: string[]): Promise<any> {
        const endpoint = `me/albums`;
        return this.apiService.spotifyApiCall('delete', endpoint, { params: new HttpParams().set('ids', albumIds.join(',')) });
    }

    async checkUserSavedAlbums(albumIds: string[]): Promise<any> {
        const endpoint = `me/albums/contains`;
        return this.apiService.spotifyApiCall('get', endpoint, { params: new HttpParams().set('ids', albumIds.join(',')) });
    }

    async getUserSavedAlbums(options: { limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `me/albums`;
        let params = new HttpParams();
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }
   // In SpotifyService
async checkIsSaved(trackId: string): Promise<boolean> {
    try {
      const res = await this.checkUserSavedTracks([trackId]);
      return res[0];
    } catch (error) {
      console.error('Error checking saved track:', error);
      return false;
    }
  }
    // Personalization Endpoints
    async getUserTopArtistsAndTracks(type: 'artists' | 'tracks', options: { time_range?: string; limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `me/top/${type}`;
        let params = new HttpParams();
        if (options.time_range) params = params.set('time_range', options.time_range);
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }
}