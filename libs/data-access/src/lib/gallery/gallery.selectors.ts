import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GalleryState, galleryAdapter } from './gallery.reducer';

const { selectAll, selectEntities, selectTotal } = galleryAdapter.getSelectors();

export const selectGalleryState = createFeatureSelector<GalleryState>('gallery');

export const selectAllPhotos = createSelector(selectGalleryState, selectAll);
export const selectPhotoEntities = createSelector(selectGalleryState, selectEntities);
export const selectTotalPhotos = createSelector(selectGalleryState, selectTotal);

export const selectFeaturedPhotos = createSelector(
  selectGalleryState,
  selectPhotoEntities,
  (state, entities) => state.featuredIds.map(id => entities[id]).filter(Boolean) as any[]
);

export const selectSelectedPhoto = createSelector(
  selectGalleryState,
  selectPhotoEntities,
  (state, entities) => (state.selectedId ? entities[state.selectedId] ?? null : null)
);

export const selectActiveCategory = createSelector(selectGalleryState, s => s.activeCategory);
export const selectSearchQuery = createSelector(selectGalleryState, s => s.searchQuery);
export const selectCategories = createSelector(selectGalleryState, s => s.categories);
export const selectPagination = createSelector(selectGalleryState, s => s.pagination);
export const selectGalleryLoading = createSelector(selectGalleryState, s => s.loading);
export const selectGalleryLoadingFeatured = createSelector(selectGalleryState, s => s.loadingFeatured);
export const selectGalleryError = createSelector(selectGalleryState, s => s.error);

/** Filtered photos by active category (client-side) */
export const selectFilteredPhotos = createSelector(
  selectAllPhotos,
  selectActiveCategory,
  selectSearchQuery,
  (photos, category, search) => {
    let result = photos;
    if (category) result = result.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }
);
