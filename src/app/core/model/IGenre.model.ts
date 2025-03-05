// genre.model.ts

// Main Genre Interface
export interface IGenre {
    id: string; // Unique identifier for the genre
    name: string; // Name of the genre (e.g., "rock", "pop")
    iconUrl?: string; // Optional URL for genre-specific icon
    color?: string; // Optional color associated with the genre
    popularity?: number; // Popularity score (0-100)
    description?: string; // Short description of the genre
    subgenres?: ISubgenre[]; // Array of related subgenres
    exampleArtists?: IArtistReference[]; // Example artists in this genre
  }
  
  // Subgenre Interface
  export interface ISubgenre {
    id: string;
    name: string;
    parentGenreId: string; // Reference to parent genre
  }
  
  // Artist Reference Interface
  export interface IArtistReference {
    id: string;
    name: string;
    imageUrl?: string;
  }
  
  // Genre Response from Spotify API
  export interface IGenreResponse {
    genres: string[]; // Array of genre names from Spotify
  }
  
  // Genre Seed for Recommendations
  export interface IGenreSeed {
    id: string;
    name: string;
    isAvailable: boolean; // Whether the genre is available for recommendations
  }
  
  // Genre with Statistics
  export interface IGenreStats extends IGenre {
    totalTracks: number;
    totalArtists: number;
    totalPlaylists: number;
    lastUpdated: Date;
  }