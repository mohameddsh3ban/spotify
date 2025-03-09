export interface IPlaylist {
  added_at: string | number | Date;
  collaborative: boolean; // Whether the playlist is collaborative
  description: string; // Description of the playlist
  external_urls: ExternalUrls; // External URLs for the playlist (e.g., Spotify link)
  href: string; // URL to the Web API endpoint providing full details of the playlist
  id: string; // Unique identifier for the playlist
  images: Image[]; // Array of image objects representing the playlist cover
  name: string; // Name of the playlist
  owner: Owner; // Information about the owner of the playlist
  primary_color: string | null; // Dominant color of the playlist's image (null if not available)
  public: boolean; // Whether the playlist is public
  snapshot_id: string; // A version identifier for the playlist
  tracks: Tracks; // Information about the tracks in the playlist
  type: string; // Type of object ("playlist" in this case)
  uri: string; // Spotify URI for the playlist
  imageUrl?: string;
}

interface ExternalUrls {
  spotify: string; // Spotify URL for the playlist
}

interface Image {
  height?: number; // Height of the image in pixels (optional)
  url: string; // URL of the image
  width?: number; // Width of the image in pixels (optional)
}

interface Owner {
  display_name: string; // Display name of the owner
  external_urls: ExternalUrls; // External URLs for the owner (e.g., Spotify link)
  href: string; // URL to the Web API endpoint providing full details of the owner
  id: string; // Unique identifier for the owner
  type: string; // Type of object ("user" in this case)
  uri: string; // Spotify URI for the owner
}

interface Tracks {
  href: string; // URL to the Web API endpoint providing full details of the tracks
  total: number; // Total number of tracks in the playlist
}