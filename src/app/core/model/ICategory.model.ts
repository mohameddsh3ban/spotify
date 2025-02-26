export interface ICategory {
    href: string; // URL to the Web API endpoint providing full details of the category
    id: string; // Unique identifier for the category
    icons: Icon[]; // Array of icon objects representing the category's images
    name: string; // Name of the category
  }
  
  interface Icon {
    height: number; // Height of the image in pixels
    url: string; // URL of the image
    width: number; // Width of the image in pixels
  }