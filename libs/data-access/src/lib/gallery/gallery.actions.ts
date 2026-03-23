import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Photo, PaginatedPhotos, PhotoCategory } from '@mss/shared';

export const GalleryActions = createActionGroup({
  source: 'Gallery',
  events: {
    // Load list
    'Load Photos': props<{ page?: number; limit?: number; category?: PhotoCategory; search?: string }>(),
    'Load Photos Success': props<{ result: PaginatedPhotos }>(),
    'Load Photos Failure': props<{ error: string }>(),

    // Load featured (used in 3D home scene)
    'Load Featured': props<{ limit?: number }>(),
    'Load Featured Success': props<{ photos: Photo[] }>(),
    'Load Featured Failure': props<{ error: string }>(),

    // Load single photo
    'Load Photo': props<{ id: string }>(),
    'Load Photo Success': props<{ photo: Photo }>(),
    'Load Photo Failure': props<{ error: string }>(),

    // Categories
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: { category: string; count: number }[] }>(),

    // Admin mutations
    'Create Photo': props<{ data: Partial<Photo> }>(),
    'Create Photo Success': props<{ photo: Photo }>(),
    'Update Photo': props<{ id: string; data: Partial<Photo> }>(),
    'Update Photo Success': props<{ photo: Photo }>(),
    'Delete Photo': props<{ id: string }>(),
    'Delete Photo Success': props<{ id: string }>(),

    // UI
    'Set Selected Photo': props<{ id: string | null }>(),
    'Set Active Category': props<{ category: PhotoCategory | null }>(),
    'Set Search Query': props<{ query: string }>(),
  },
});
