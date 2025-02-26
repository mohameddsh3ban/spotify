export interface IUserProfile {
    country: string; // ISO 3166-1 alpha-2 country code
    display_name: string; // The user's display name
    email: string; // The user's email address
    explicit_content: IExplicitContent; // Explicit content settings
    external_urls: IExternalUrls; // External URLs for the user
    followers: IFollowers; // Follower information
    href: string; // A link to the Web API endpoint providing full details of the user
    id: string; // The Spotify user ID
    images: IImage[]; // Profile image information (empty array if no images)
    product: string; // The user's Spotify subscription level (e.g., "free", "premium")
    type: string; // The object type ("user" in this case)
    uri: string; // The Spotify URI for the user
}

interface IExplicitContent {
    filter_enabled: boolean; // Whether explicit content filtering is enabled
    filter_locked: boolean; // Whether explicit content filtering is locked
}

interface IExternalUrls {
    spotify: string; // The Spotify URL for the user
}

interface IFollowers {
    href: null | string; // A link to the Web API endpoint providing full details of the followers (null if not available)
    total: number; // The total number of followers
}

interface IImage {
    url: string; // The source URL of the image
    height?: number; // The height of the image in pixels (optional)
    width?: number; // The width of the image in pixels (optional)
}