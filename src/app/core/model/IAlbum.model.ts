import { IArtist } from "./IArtist.model";

// Album Model
export interface IAlbum {
    name: string;
    artist: string; // Or Artist object if you have more artist details
    imageUrl: string;
    images?: { url: string }[];
    id?: string;  // Add if you have an ID
    uri?: string; // Add if you have a URI
    artists?: IArtist[];
    release_date?: string;
    type?:any
    total_tracks?: number;
  }