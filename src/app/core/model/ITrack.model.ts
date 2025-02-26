// Define the interface for the Image object
interface Image {
  height: number;
  url: string;
  width: number;
}

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
interface Album {
  images?: Image[];
  name: string;
}

// Define the main interface for the Track object
export interface ITrack {
  album?: Album;
  artists: Artist[];
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
}
