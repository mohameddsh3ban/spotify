// Podcast Model
export interface IPodcast {
    name: string;
    creator: string;
    imageUrl: string;
    id?: string;
    description?: string;
    episodes?: {
      href: string;
      total: number;
    };
  }