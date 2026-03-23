import { PhotoCategory } from '../enums';

export interface PhotoMetadata {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  location?: string;
  dateTaken?: string;
  width?: number;
  height?: number;
}

export interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  webpUrl?: string;
  category: PhotoCategory;
  tags: string[];
  featured: boolean;
  published: boolean;
  metadata?: PhotoMetadata;
  viewCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPhotos {
  data: Photo[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
