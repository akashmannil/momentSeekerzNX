/**
 * Gallery reducer uses NgRx Entity for O(1) lookups and normalized storage.
 * Entity key is the MongoDB `_id` string.
 */
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Photo, PhotoCategory } from '@mss/shared';
import { GalleryActions } from './gallery.actions';

export interface GalleryState extends EntityState<Photo> {
  featuredIds: string[];
  selectedId: string | null;
  activeCategory: PhotoCategory | null;
  searchQuery: string;
  categories: { category: string; count: number }[];
  pagination: { page: number; limit: number; total: number; pages: number };
  loading: boolean;
  loadingFeatured: boolean;
  error: string | null;
}

export const galleryAdapter: EntityAdapter<Photo> = createEntityAdapter<Photo>({
  selectId: photo => photo._id,
  sortComparer: (a, b) => a.sortOrder - b.sortOrder,
});

export const galleryInitialState: GalleryState = galleryAdapter.getInitialState({
  featuredIds: [],
  selectedId: null,
  activeCategory: null,
  searchQuery: '',
  categories: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  loadingFeatured: false,
  error: null,
});

export const galleryReducer = createReducer(
  galleryInitialState,

  on(GalleryActions.loadPhotos, state => ({ ...state, loading: true, error: null })),
  on(GalleryActions.loadPhotosSuccess, (state, { result }) =>
    galleryAdapter.setAll(result.data, {
      ...state,
      pagination: { page: result.page, limit: result.limit, total: result.total, pages: result.pages },
      loading: false,
    })
  ),
  on(GalleryActions.loadPhotosFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(GalleryActions.loadFeatured, state => ({ ...state, loadingFeatured: true })),
  on(GalleryActions.loadFeaturedSuccess, (state, { photos }) => {
    const next = galleryAdapter.upsertMany(photos, state);
    return { ...next, featuredIds: photos.map(p => p._id), loadingFeatured: false };
  }),
  on(GalleryActions.loadFeaturedFailure, state => ({ ...state, loadingFeatured: false })),

  on(GalleryActions.loadPhotoSuccess, (state, { photo }) =>
    galleryAdapter.upsertOne(photo, state)
  ),

  on(GalleryActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories })),

  on(GalleryActions.createPhotoSuccess, (state, { photo }) =>
    galleryAdapter.addOne(photo, state)
  ),
  on(GalleryActions.updatePhotoSuccess, (state, { photo }) =>
    galleryAdapter.updateOne({ id: photo._id, changes: photo }, state)
  ),
  on(GalleryActions.deletePhotoSuccess, (state, { id }) =>
    galleryAdapter.removeOne(id, state)
  ),

  on(GalleryActions.setSelectedPhoto, (state, { id }) => ({ ...state, selectedId: id })),
  on(GalleryActions.setActiveCategory, (state, { category }) => ({ ...state, activeCategory: category })),
  on(GalleryActions.setSearchQuery, (state, { query }) => ({ ...state, searchQuery: query })),
);
