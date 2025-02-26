export interface IArtist {
    external_urls: IExternalUrls; // External URLs for the artist
    followers: IFollowers; // Follower information
    genres: string[]; // Array of genres associated with the artist
    href: string; // A link to the Web API endpoint providing full details of the artist
    id: string; // The Spotify ID for the artist
    images: IImage[]; // Array of image objects representing the artist's profile pictures
    name: string; // The name of the artist
    popularity: number; // The popularity of the artist (0-100)
    type: string; // The object type ("artist" in this case)
    uri: string; // The Spotify URI for the artist
}

interface IExternalUrls {
    spotify: string; // The Spotify URL for the artist
}

interface IFollowers {
    href: null | string; // A link to the Web API endpoint providing full details of the followers (null if not available)
    total: number; // The total number of followers
}

interface IImage {
    height: number; // The height of the image in pixels
    url: string; // The source URL of the image
    width: number; // The width of the image in pixels
}