import { IAlbum } from "./IAlbum.model";
import { IArtist } from "./IArtist.model";

// Define the interface for the Image object


// Define the interface for the External URLs object
interface ExternalUrls {
  spotify: string;
}

// Define the interface for the Artist object
interface Artist {
  external_urls?: ExternalUrls;
  href?: string;
  id: string;
  name: string;
  type?: string;
  uri?: string;
}

// Define the interface for the Album object


// Define the main interface for the Track object
export interface ITrack {
  album: IAlbum;
  artists: IArtist[];
  name: string;
  id: string;
  available_markets?: string[];
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: ExternalUrls;
  href?: string;
  preview_url?: string | null;
  track_number?: number;
  type?: string;
  uri: string;
  is_local?: boolean;
  popularity:any
}
