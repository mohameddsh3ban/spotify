import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { SpotifyApiService } from './spotify-api.service';

@Injectable({
    providedIn: 'root'
})
export class SpotifyPlaylistService {


    private apiService = inject(SpotifyApiService);

    async createPlaylist(userId: string, name: string, options: { public?: boolean; collaborative?: boolean; description?: string } = {}): Promise<any> {
        const endpoint = `users/${userId}/playlists`;
        const body = {
            name,
            public: options.public !== undefined ? options.public : true,
            collaborative: options.collaborative !== undefined ? options.collaborative : false,
            description: options.description || ''
        };
        return this.apiService.spotifyApiCall('post', endpoint, { body });
    }

    async changePlaylistDetails(playlistId: string, options: { name?: string; public?: boolean; collaborative?: boolean; description?: string } = {}): Promise<any> {
        const endpoint = `playlists/${playlistId}`;
        const body: any = {};
        if (options.name) body.name = options.name;
        if (options.public !== undefined) body.public = options.public;
        if (options.collaborative !== undefined) body.collaborative = options.collaborative;
        if (options.description) body.description = options.description;
        return this.apiService.spotifyApiCall('put', endpoint, { body });
    }

    async getPlaylist(playlistId: string): Promise<any> {
        const endpoint = `playlists/${playlistId}`;
        return this.apiService.spotifyApiCall('get', endpoint);
    }

    async getCurrentUserPlaylists(options: { limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `me/playlists`;
        let params = new HttpParams();
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getUserPlaylists(userId: string, options: { limit?: number; offset?: number } = {}): Promise<any> {
        const endpoint = `users/${userId}/playlists`;
        let params = new HttpParams();
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async getPlaylistItems(playlistId: string, options: { limit?: number; offset?: number; fields?: string } = {}): Promise<any> {
        const endpoint = `playlists/${playlistId}/tracks`;
        let params = new HttpParams();
        if (options.limit) params = params.set('limit', options.limit.toString());
        if (options.offset) params = params.set('offset', options.offset.toString());
        if (options.fields) params = params.set('fields', options.fields);
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }

    async addItemsToPlaylist(playlistId: string, uris: string[], position?: number): Promise<any> {
        const endpoint = `playlists/${playlistId}/tracks`;
        const body: any = { uris };
        if (position) body.position = position;
        return this.apiService.spotifyApiCall('post', endpoint, { body });
    }

    async reorderItemsInPlaylist(playlistId: string, range_start: number, insert_before: number, options: { range_length?: number; snapshot_id?: string } = {}): Promise<any> {
        const endpoint = `playlists/${playlistId}/tracks`;
        const body = {
            range_start,
            range_length: options.range_length || 1,
            insert_before,
            snapshot_id: options.snapshot_id
        };
        return this.apiService.spotifyApiCall('put', endpoint, { body });
    }

    async replaceItemsInPlaylist(playlistId: string, uris: string[]): Promise<any> {
        const endpoint = `playlists/${playlistId}/tracks`;
        const body = { uris };
        return this.apiService.spotifyApiCall('put', endpoint, { body });
    }

    async removeItemsFromPlaylist(playlistId: string, tracks: { uri: string; positions?: number[] }[], snapshot_id?: string): Promise<any> {
        const endpoint = `playlists/${playlistId}/tracks`;
        const body = { tracks, snapshot_id };
        return this.apiService.spotifyApiCall('delete', endpoint, { body });
    }

    async checkUsersFollowPlaylist(playlistId: string, ids: string[]): Promise<any> {
        const endpoint = `playlists/${playlistId}/followers/contains`;
        const params = new HttpParams().set('ids', ids.join(','));
        return this.apiService.spotifyApiCall('get', endpoint, { params });
    }
    async getNextPage(url: string): Promise<any> {
        const response = await this.apiService.spotifyApiCall('get', url);
        return response;
   
      }

}